import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Warehouse, PackageOpen, Boxes } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function WarehousesPage() {
  const { data: warehouses, isLoading, error } = useQuery({
    queryKey: ["warehouses"],
    queryFn: api.getWarehouses,
  })

  if (isLoading) {
    return <div className="p-4 flex items-center gap-2 text-muted-foreground"><Warehouse className="h-5 w-5 animate-pulse" /> Завантаження складів...</div>
  }

  if (error) {
    return <div className="p-4 flex items-center gap-2 text-destructive"><Boxes className="h-5 w-5" /> Помилка завантаження даних.</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Warehouse className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Склади та ресурси</h1>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {warehouses?.map((w: any) => {
          const totalItems = w.inventory?.reduce((acc: number, inv: any) => acc + inv.quantityAvailable, 0) || 0
          
          return (
            <Card key={w.id} className="bg-card">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <PackageOpen className="h-5 w-5 text-muted-foreground" />
                  {w.name}
                </CardTitle>
                <div className="text-sm text-muted-foreground font-normal">{w.address}</div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 text-sm space-y-2">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Загалом одиниць товару</span>
                    <strong className="text-foreground">{totalItems}</strong>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Зарезервовано товарів</span>
                    <strong className="text-foreground">{w.inventory?.reduce((acc: number, inv: any) => acc + inv.quantityReserved, 0) || 0}</strong>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Активних відправок</span>
                    <strong className="text-foreground">{w.ordersOut ? w.ordersOut.length : 0}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2 text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                  <Boxes className="h-3.5 w-3.5" />
                  Ресурси
                </div>
                <div className="max-h-48 overflow-y-auto pr-1 border rounded-md border-border">
                  <Table className="text-sm">
                    <TableHeader className="sticky top-0 bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 px-2 py-1 text-xs uppercase">Назва</TableHead>
                        <TableHead className="h-8 px-2 py-1 text-xs uppercase">Категорія</TableHead>
                        <TableHead className="h-8 px-2 py-1 text-xs uppercase text-right">К-сть</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {w.inventory?.map((inv: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="px-2 py-1.5 font-medium text-foreground">{inv.resource?.name}</TableCell>
                          <TableCell className="px-2 py-1.5 text-muted-foreground">{inv.resource?.category}</TableCell>
                          <TableCell className="px-2 py-1.5 text-right font-mono text-foreground">{inv.quantityAvailable}</TableCell>
                        </TableRow>
                      ))}
                      {(!w.inventory || w.inventory.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-4">Немає ресурсів</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
