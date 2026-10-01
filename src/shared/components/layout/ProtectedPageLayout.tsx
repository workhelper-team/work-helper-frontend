import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import SiteHeader from './SiteHeader'

interface ProtectedPageLayoutProps {
  title: string
  description: string
  backTo: string
  backLabel: string
  action?: ReactNode
  children: ReactNode
}

export function ProtectedPageLayout({
  title,
  description,
  backTo,
  backLabel,
  action,
  children,
}: ProtectedPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <SiteHeader />
      <div className="border-b border-slate-200 bg-white">
        <div className="container py-8 sm:py-10">
          <Link to={backTo} className="text-sm font-medium text-blue-700 hover:underline">
            ← {backLabel}
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
            {action}
          </div>
        </div>
      </div>
      <main className="container py-8 pb-20">{children}</main>
    </div>
  )
}
