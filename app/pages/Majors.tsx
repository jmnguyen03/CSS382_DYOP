import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Loader2, Award, ChevronRight } from 'lucide-react'

interface Department {
  department_id: string
  name: string
  code: string
}

interface Major {
  major_id: string
  description: string | null
  department: Department | null
}

export default function Majors() {
  const [majors, setMajors] = useState<Major[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMajors() {
      try {
        setLoading(true)
        const { data, error: dbError } = await supabase
          .from('major')
          .select('major_id, description, department:department(department_id, name, code)')
          .order('major_id', { ascending: true })
        if (dbError) throw dbError
        setMajors((data as unknown as Major[]) || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load degree pathways.')
      } finally {
        setLoading(false)
      }
    }
    fetchMajors()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading degree pathways...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Degree Pathways</h1>
        <p className="text-slate-500 mt-2">
          {majors.length} major{majors.length !== 1 ? 's' : ''} available across all departments.
        </p>
      </div>

      {majors.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          No degree pathways are currently listed.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {majors.map(major => (
            <Link
              key={major.major_id}
              to={`/majors/${major.major_id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200 transition-colors shrink-0">
                    <Award size={18} />
                  </div>
                  {major.department && (
                    <span className="text-xs font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {major.department.code}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {major.description ?? 'Unnamed Major'}
                </h3>
                {major.department && (
                  <p className="text-sm text-slate-500 mt-2">{major.department.name}</p>
                )}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end items-center text-xs">
                <span className="text-blue-600 font-semibold group-hover:text-blue-700 inline-flex items-center gap-1">
                  Browse Courses <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
