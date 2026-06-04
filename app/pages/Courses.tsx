import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Loader2, BookOpen, ChevronRight, Search, ChevronDown } from 'lucide-react'

interface Department {
  department_id: string
  name: string
  code: string
}

interface Course {
  course_id: string
  title: string
  course_code: string
  description: string | null
  credits: string
  department: Department | null
}

const PAGE_SIZE = 9

export default function Courses() {
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setShowAll(false)
  }, [search, deptFilter])

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true)
        const { data, error: dbError } = await supabase
          .from('courses')
          .select('course_id, title, course_code, description, credits, department:department(department_id, name, code)')
          .order('course_code', { ascending: true })
          .range(0, 9999)
        if (dbError) throw dbError
        setAllCourses((data as unknown as Course[]) || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load course catalog.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const departments = useMemo(() => {
    const codes = allCourses.map(c => c.department?.code).filter((c): c is string => !!c)
    return ['All', ...Array.from(new Set(codes)).sort()]
  }, [allCourses])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allCourses.filter(c => {
      const deptMatch = deptFilter === 'All' || c.department?.code === deptFilter
      if (!q) return deptMatch
      const deptCode = c.department?.code?.toLowerCase() ?? ''
      const combined = `${deptCode} ${c.course_code}`.toLowerCase()
      const combinedNorm = combined.replace(/[\s\-_]+/g, '')
      const qNorm = q.replace(/[\s\-_]+/g, '')
      const textMatch =
        c.title.toLowerCase().includes(q) ||
        c.course_code.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.department?.name.toLowerCase().includes(q) ||
        deptCode.includes(q) ||
        combined.includes(q) ||
        combinedNorm.includes(qNorm)
      return deptMatch && textMatch
    })
  }, [allCourses, search, deptFilter])

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading course catalog...</span>
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Course Catalog</h1>
        <p className="text-slate-500 mt-2">
          {allCourses.length.toLocaleString()} courses across all departments.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by title, code, or description..."
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
          No courses match your search.
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">
            Showing {visible.length} of {filtered.length} course{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visible.map(course => (
              <div
                key={course.course_id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div className="p-6">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-mono">
                    {course.department?.code || 'UNKN'}-{course.course_code}
                  </span>
                  <h3 className="text-lg font-bold mt-3 text-slate-900">{course.title}</h3>
                  <p className="text-slate-600 text-sm mt-2 line-clamp-3">
                    {course.description || 'No description available.'}
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{course.credits} Credits</span>
                  <Link
                    to={`/courses/${course.course_id}`}
                    className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > PAGE_SIZE && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-6 w-full py-2.5 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1 border border-slate-200 rounded-lg bg-white shadow-sm"
            >
              Show {filtered.length - PAGE_SIZE} more courses <ChevronDown size={14} />
            </button>
          )}
        </>
      )}
    </div>
  )
}
