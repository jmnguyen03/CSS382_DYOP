import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import { Loader2, GraduationCap, ChevronRight, Search, Star } from 'lucide-react'

interface Department {
  department_id: string
  name: string
  code: string
}

interface RatingRow {
  rating: number | null
}

interface Professor {
  prof_id: string
  prof_firstname: string | null
  prof_lastname: string | null
  department: Department | null
  rating: RatingRow[]
}

function avgRating(ratings: RatingRow[]): number | null {
  const valid = ratings.filter(r => r.rating !== null).map(r => r.rating!)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export default function Professors() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  useEffect(() => {
    async function fetchProfessors() {
      try {
        setLoading(true)
        const { data, error: dbError } = await supabase
          .from('professor')
          .select('prof_id, prof_firstname, prof_lastname, department:department(department_id, name, code), rating(rating_id, rating)')
          .order('prof_lastname', { ascending: true })
          .range(0, 9999)
        if (dbError) throw dbError
        setProfessors((data as unknown as Professor[]) || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load faculty directory.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfessors()
  }, [])

  const departments = useMemo(() => {
    const codes = professors.map(p => p.department?.code).filter((c): c is string => !!c)
    return ['All', ...Array.from(new Set(codes)).sort()]
  }, [professors])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return professors.filter(p => {
      const name = `${p.prof_firstname ?? ''} ${p.prof_lastname ?? ''}`.toLowerCase().trim()
      const deptMatch = deptFilter === 'All' || p.department?.code === deptFilter
      return deptMatch && (!q || name.includes(q) || p.department?.name.toLowerCase().includes(q))
    })
  }, [professors, search, deptFilter])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading faculty directory...</span>
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Directory</h1>
        <p className="text-slate-500 mt-2">
          Browse {professors.length} instructors across all departments.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          No faculty match your search.
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">
            Showing {filtered.length} instructor{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filtered.map(p => {
              const fullName = [p.prof_firstname, p.prof_lastname].filter(Boolean).join(' ')
              const avg = avgRating(p.rating ?? [])
              return (
                <Link
                  key={p.prof_id}
                  to={`/professors/${p.prof_id}`}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-200 transition-colors shrink-0">
                          <GraduationCap size={18} />
                        </div>
                        {p.department && (
                          <span className="text-xs font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {p.department.code}
                          </span>
                        )}
                      </div>
                      {avg !== null && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Star size={11} className="text-amber-500 fill-amber-400" />
                          <span className="text-xs font-bold text-amber-700">{avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug">
                      {fullName || 'Unknown'}
                    </h3>
                    {p.department && (
                      <p className="text-sm text-slate-500 mt-1">{p.department.name}</p>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                    <span>{(p.rating ?? []).length} review{(p.rating ?? []).length !== 1 ? 's' : ''}</span>
                    <span className="text-blue-600 font-semibold group-hover:text-blue-700 inline-flex items-center gap-1">
                      View Profile <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
