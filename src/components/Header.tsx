import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-50">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}