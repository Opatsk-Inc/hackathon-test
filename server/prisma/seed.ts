import { PrismaClient, OrderStatus, Priority, TripStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const user = encodeURIComponent(process.env.POSTGRES_USER || 'postgres');
  const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || '');
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.POSTGRES_PORT || '5432';
  const db = encodeURIComponent(process.env.POSTGRES_DB || 'postgres');
  return `postgresql://${user}:${password}@${host}:${port}/${db}`;
}

const adapter = new PrismaPg({ connectionString: buildDatabaseUrl() } as any);
const prisma = new PrismaClient({ adapter } as any);

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

async function main() {
  console.log('Cleaning up existing data (except users)...');
  
  // Unlink users from warehouses before deleting warehouses
  await prisma.user.updateMany({ data: { warehouseId: null } });

  await prisma.trip.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.warehouse.deleteMany();

  console.log('Start seeding...');

  // 1. Create Warehouses
  const warehouseData = [
    { name: 'Kyiv Central Hub', address: 'Kyiv, Peremohy Ave 50', lat: 50.4501, lng: 30.5234 },
    { name: 'Lviv Western Depot', address: 'Lviv, Horodotska St 120', lat: 49.8397, lng: 24.0297 },
    { name: 'Odesa Port Station', address: 'Odesa, Mytna Square 1', lat: 46.4825, lng: 30.7233 },
    { name: 'Dnipro Logistics Hub', address: 'Dnipro, Yavornytskoho Ave 10', lat: 48.4647, lng: 35.0462 },
    { name: 'Kharkiv Eastern Point', address: 'Kharkiv, Sumska St 15', lat: 50.0057, lng: 36.2292 },
  ];

  const warehouses: any[] = [];
  for (const w of warehouseData) {
    const created = await prisma.warehouse.create({ data: w });
    warehouses.push(created);
  }
  console.log(`Created ${warehouses.length} warehouses.`);

  // 2. Prepare Users (Manager & Dispatcher)
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const manager = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: { warehouseId: warehouses[0].id },
    create: {
      firstName: 'Warehouse',
      lastName: 'Manager',
      email: 'manager@test.com',
      passwordHash: passwordHash,
      role: 'WAREHOUSE_MANAGER',
      warehouseId: warehouses[0].id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'dispatcher@test.com' },
    update: {},
    create: {
      firstName: 'Global',
      lastName: 'Dispatcher',
      email: 'dispatcher@test.com',
      passwordHash: passwordHash,
      role: 'DISPATCHER',
    },
  });
  console.log(`Ensured users exist. Manager assigned to ${warehouses[0].name}.`);

  // 3. Create Resources
  const resourceData = [
    { name: 'Drinking Water 5L', category: 'Food & Water' },
    { name: 'MRE Rations', category: 'Food & Water' },
    { name: 'Thermal Blanket', category: 'Shelter' },
    { name: 'Winter Sleeping Bag', category: 'Shelter' },
    { name: 'First Aid Kit (Basic)', category: 'Medical' },
    { name: 'Tourniquets', category: 'Medical' },
    { name: 'Electric Generator 3kW', category: 'Power' },
    { name: 'Powerbank 20000mAh', category: 'Power' },
    { name: 'Flashlight batteries', category: 'Equipment' },
    { name: 'Heavy Duty Tents', category: 'Shelter' },
  ];

  const resources: any[] = [];
  for (const r of resourceData) {
    const rs = await prisma.resource.create({ data: r });
    resources.push(rs);
  }
  console.log(`Created ${resources.length} resources.`);

  // 4. Create Inventory items across warehouses
  let inventoryCount = 0;
  for (const w of warehouses) {
    for (const r of resources) {
      // randomly assign between 50 to 5000 items
      const quantity = randomInt(50, 5000);
      await prisma.inventory.create({
        data: {
          warehouseId: w.id,
          resourceId: r.id,
          quantityAvailable: quantity,
          quantityReserved: randomInt(0, Math.floor(quantity * 0.2)),
        },
      });
      inventoryCount++;
    }
  }
  console.log(`Created ${inventoryCount} inventory records.`);

  // 5. Create Orders
  const orderCount = 25;
  const orders: any[] = [];
  for (let i = 0; i < orderCount; i++) {
    const requester = randomItem(warehouses);
    let provider = Math.random() > 0.3 ? randomItem(warehouses) : null;
    if (provider && provider.id === requester.id) {
      provider = null;
    }
    const resource = randomItem(resources);
    
    const _statuses = Object.values(OrderStatus);
    const _priorities = Object.values(Priority);
    
    const status = provider ? randomItem(_statuses) : 'PENDING';
    
    const o = await prisma.order.create({
      data: {
        quantity: randomInt(10, 500),
        priority: randomItem(_priorities) as any,
        status: status as any,
        requesterId: requester.id,
        providerId: provider?.id,
        resourceId: resource.id,
      },
      include: {
        provider: true,
        requester: true,
      }
    });
    orders.push(o as any);
  }
  console.log(`Created ${orders.length} orders.`);

  // 6. Create Trips for orders that are IN_TRANSIT, DELIVERED, PACKED, or SOS
  let tripCount = 0;
  for (const o of orders) {
    if (o.status !== 'PENDING' && o.status !== 'CANCELLED' && o.status !== 'APPROVED') {
      const isDelivered = o.status === 'DELIVERED';
      const isSos = Math.random() > 0.8;
      let tripStatus: any = 'EN_ROUTE';
      if (isDelivered) tripStatus = 'DELIVERED';
      if (isSos) tripStatus = 'SOS';
      if (o.status === 'PACKED') tripStatus = 'PENDING';

      const provider = o.provider as any;
      const requester = o.requester as any;

      // Randomly offset lat and lng to simulate en_route
      const baseLat = provider ? provider.lat : requester.lat;
      const baseLng = provider ? provider.lng : requester.lng;
      const driverLat = baseLat + (Math.random() * 0.1 - 0.05);
      const driverLng = baseLng + (Math.random() * 0.1 - 0.05);

      await prisma.trip.create({
        data: {
          orderId: o.id,
          driverName: `Driver ${randomInt(1, 100)}`,
          currentLat: driverLat,
          currentLng: driverLng,
          status: tripStatus,
        },
      });
      tripCount++;
    }
  }
  console.log(`Created ${tripCount} trips.`);

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
