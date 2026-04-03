import { Role } from '@prisma/client';

export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  role: Role;
  warehouseId: string | null;
}
