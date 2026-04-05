import React from "react"

interface RoleSelectCardProps {
  title: string
  description: string
  badgeText: string
  badgeColor: string
  onClick: () => void
  children?: React.ReactNode
}

const RoleSelectCard: React.FC<RoleSelectCardProps> = ({
  title,
  description,
  badgeText,
  badgeColor,
  onClick,
  children,
}) => {
  return (
    <div
      className="flex min-h-75 flex-1 transform cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl md:min-h-[400px]"
      onClick={onClick}
    >
      <div className="flex h-full flex-col items-center justify-center p-8 text-center md:p-12">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
          {title}
        </h2>
        <p className="mb-6 max-w-md text-gray-600">{description}</p>
        <div className="mt-auto">
          <span
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default RoleSelectCard
