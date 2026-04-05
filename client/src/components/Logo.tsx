import logo from "@/assets/ЛевчикТранс.svg"

export default function Logo() {
    return (
        <div className="flex items-center gap-2 px-4 pb-3">
            <img 
                src={logo} 
                alt="Levtrans Logo" 
                className="h-10 w-10 rounded-full border border-zinc-200 object-contain shadow-sm dark:border-zinc-800" 
            />
            <span className="text-lg font-bold tracking-tight">Levtrans</span>
        </div>
    )
}