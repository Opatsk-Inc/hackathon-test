import { BrowserRouter, Routes, Route } from "react-router-dom"
import RequireAuth from "@/components/RequireAuth"
import DispatcherLayout from "@/features/dispatcher-layout/components/DispatcherLayout"
import DashboardPage from "@/pages/dispatcher/DashboardPage"
import OrdersPage from "@/pages/dispatcher/OrdersPage"
import WarehousesPage from "@/pages/dispatcher/WarehousesPage"
import RequestsPage from "@/pages/dispatcher/RequestsPage"
import DriversPage from "@/pages/dispatcher/DriversPage"
import LoginPage from "@/pages/auth/LoginPage"
import ManagerLayout from "@/features/manager-layout"
import ManagerResourcesPage from "@/pages/manager/ResourcesPage"
import ManagerOrdersPage from "@/pages/manager/OrdersPage"
import ManagerReplenishPage from "@/pages/manager/ReplenishPage"
import ManagerInventoryPage from "@/pages/manager/InventoryPage"
import DriverPage from "@/pages/driver/DriverPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<RequireAuth allowedRoles={["DISPATCHER"]} />}>
          <Route path="dispatcher" element={<DispatcherLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="drivers" element={<DriversPage />} />
          </Route>
        </Route>
        <Route element={<RequireAuth allowedRoles={["WAREHOUSE_MANAGER"]} />}>
          <Route path="manager" element={<ManagerLayout />}>
            <Route index element={<ManagerResourcesPage />} />
            <Route index element={<ManagerResourcesPage />} />
            <Route path="orders" element={<ManagerOrdersPage />} />
            <Route path="replenish" element={<ManagerReplenishPage />} />
            <Route path="inventory" element={<ManagerInventoryPage />} />
          </Route>
        </Route>
        <Route path="driver/:magicToken" element={<DriverPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
