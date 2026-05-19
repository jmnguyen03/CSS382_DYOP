import { Outlet, Link, useLocation } from 'react-router'
import { GraduationCap, Home, Building2 } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const linkClass = (path: string) => {
    const base = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    return isActive(path)
      ? `${base} bg-blue-50 text-blue-700 font-semibold`
      : `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Central Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Header Brand */}
          <Link to="/" className="flex items-center gap-2 text-blue-700 font-extrabold text-xl tracking-tight">
            <GraduationCap className="h-6 w-6" />
            <span>CourseRegistry</span>
          </Link>

          {/* Navigation Action Links */}
          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link to="/departments" className={linkClass('/departments')}>
              <Building2 className="h-4 w-4" />
              <span>Departments</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Embedded Route Child View Yield Port */}
      <div className="flex-1 w-full">
        <Outlet />
      </div>

      {/* Global Standard Site Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-6xl mx-auto">
          &copy; {new Date().getFullYear()} University Course Registration Management Hub. All rights reserved.
        </div>
      </footer>
    </div>
  )
}