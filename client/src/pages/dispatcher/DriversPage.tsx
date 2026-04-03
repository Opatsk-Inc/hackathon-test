import { Search, Filter, ShieldAlert, Zap, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DriversPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Водії та автопарк
        </h1>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Пошук водія по ID..."
              className="h-9 w-64 pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
            <Button size="xs" variant="default">
              Всі активні
            </Button>
            <Button variant="ghost" size="xs" className="text-zinc-500">
              У рейсі
            </Button>
            <Button variant="ghost" size="xs" className="text-zinc-500">
              Очікують
            </Button>
            <Button variant="ghost" size="xs" className="text-zinc-500 hover:text-red-600">
              SOS
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-zinc-600 dark:text-zinc-400"
        >
          <Filter className="h-4 w-4" />
          Додаткові фільтри
        </Button>
      </div>

      {/* Main Table Area */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableHead className="font-semibold uppercase tracking-wider text-xs">ID Водія</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Поточний рейс</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Остання локація</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Статус</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Останній пінг</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Row 1: Restore Magic Link */}
            <TableRow>
              <TableCell className="font-mono font-medium text-zinc-900 dark:text-zinc-100">DRV-101</TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400">TRP-ALPHA</TableCell>
              <TableCell className="text-zinc-500 font-mono text-xs">50.45N, 30.52E</TableCell>
              <TableCell>
                <Badge variant="in_transit">У рейсі</Badge>
              </TableCell>
              <TableCell className="text-zinc-400 text-xs">1с тому</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Link className="h-3 w-3" />
                  Restore Magic Link
                </Button>
              </TableCell>
            </TableRow>
            
            {/* Row 2: Smart Assign Route */}
            <TableRow className="bg-zinc-50/30 dark:bg-zinc-800/10">
              <TableCell className="font-mono font-medium text-zinc-900 dark:text-zinc-100">DRV-204</TableCell>
              <TableCell className="text-zinc-400 italic">Не призначено</TableCell>
              <TableCell className="text-zinc-500 font-mono text-xs">49.83N, 24.02E</TableCell>
              <TableCell>
                <Badge variant="pending">Вільний</Badge>
              </TableCell>
              <TableCell className="text-zinc-400 text-xs">15хв тому</TableCell>
              <TableCell className="text-right">
                <Button size="sm" className="gap-1.5">
                  <Zap className="h-3 w-3" />
                  Smart Assign Route
                </Button>
              </TableCell>
            </TableRow>

            {/* Row 3: Handle SOS */}
            <TableRow className="bg-red-50/10 dark:bg-red-950/5">
              <TableCell className="font-mono font-medium text-red-600 dark:text-red-400">DRV-SOS</TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400">TRP-GAMMA</TableCell>
              <TableCell className="text-red-500/70 font-mono text-xs">46.48N, 30.72E</TableCell>
              <TableCell>
                <Badge variant="sos">SOS ERROR</Badge>
              </TableCell>
              <TableCell className="text-red-600 font-bold text-xs uppercase tracking-tighter">LIVE</TableCell>
              <TableCell className="text-right">
                <Button variant="destructive" size="sm" className="gap-1.5 font-bold shadow-sm">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Handle SOS
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
