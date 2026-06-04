import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        {/* Warning Icon Flag Header */}
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle size={24} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404 Exception</h1>
          <h2 className="text-xl font-bold text-slate-800">Academic Page Not Found</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            The curriculum track listing or unique resource record path string you are searching for does not exist in the live database schema catalog indexes.
          </p>
        </div>

        {/* Back Home Safety Action Trigger */}
        <Link 
          to="/" 
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
        >
          <Home size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  )
}