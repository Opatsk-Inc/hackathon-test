import { useNavigate } from "react-router-dom"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs"
import type { LucideIcon } from "lucide-react"

interface TabConfig {
  value: string
  label: string
  icon?: LucideIcon
}

interface AnimatedTabsProps {
  tabs: TabConfig[]
  defaultValue: string
  variant?: "grid" | "scroll" // "grid" для десктопу, "scroll" для мобайла
}

export function AnimatedTabs({
  tabs,
  defaultValue,
  variant = "scroll",
}: AnimatedTabsProps) {
  const navigate = useNavigate()

  return (
    <div className="w-full overflow-x-auto">
      <Tabs value={defaultValue} onValueChange={(value) => navigate(value)}>
        <TabsList
          className={`${
            variant === "grid" ? "grid w-full" : "flex w-max min-w-full gap-1"
          }`}
          style={
            variant === "grid"
              ? { gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }
              : undefined
          }
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="inline text-xs sm:hidden">
                {tab.label.substring(0, 3)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
