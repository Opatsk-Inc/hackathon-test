import { useWarehouses } from "@/features/warehouses"
import type { IWarehouseWithTotals } from "@/features/warehouses"
import { Warehouse, PackageOpen, Boxes } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/loaders"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function WarehousesPage() {
  const { warehouses, isLoading, error } = useWarehouses()

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-destructive">
        <Boxes className="h-5 w-5" /> Error loading data:{" "}
        {(error as Error).message}
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Loading warehouses...">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Warehouse className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">
            Warehouses & Resources
          </h1>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {warehouses?.map((w: IWarehouseWithTotals) => {
            return (
              <Card key={w.id} className="bg-card">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <PackageOpen className="h-5 w-5 text-muted-foreground" />
                    {w.name}
                  </CardTitle>
                  <div className="text-sm font-normal text-muted-foreground">
                    {w.address}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Total items</span>
                      <strong className="text-foreground">
                        {w.totalItems}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Reserved items</span>
                      <strong className="text-foreground">
                        {w.reservedItems}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Active shipments</span>
                      <strong className="text-foreground">
                        {w.activeShipments}
                      </strong>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    <Boxes className="h-3.5 w-3.5" />
                    Resources
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-md border border-border pr-1">
                    <Table className="text-sm">
                      <TableHeader className="sticky top-0 bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-8 px-2 py-1 text-xs uppercase">
                            Name
                          </TableHead>
                          <TableHead className="h-8 px-2 py-1 text-xs uppercase">
                            Category
                          </TableHead>
                          <TableHead className="h-8 px-2 py-1 text-right text-xs uppercase">
                            Qty
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {w.inventory?.map((inv, i) => (
                          <TableRow key={i}>
                            <TableCell className="px-2 py-1.5 font-medium text-foreground">
                              {inv.resource?.name}
                            </TableCell>
                            <TableCell className="px-2 py-1.5 text-muted-foreground">
                              {inv.resource?.category}
                            </TableCell>
                            <TableCell className="px-2 py-1.5 text-right font-mono text-foreground">
                              {inv.quantityAvailable}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!w.inventory || w.inventory.length === 0) && (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="py-4 text-center text-muted-foreground"
                            >
                              No resources
                            </TableCell>
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
    </PageLoader>
  )
}
