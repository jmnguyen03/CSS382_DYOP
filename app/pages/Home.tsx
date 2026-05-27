import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, Award, Users, ChevronRight, Loader2, Search, GraduationCap, BookMarked, ChevronDown } from 'lucide-react'
// GraduationCap used in search results professors section

interface Department {
  department_id: string
  name: string
  code: string
}

interface ProfessorRow {
  prof_id: string
  prof_firstname: string | null
  prof_lastname: string | null
  department: Department | null
}

interface Resource {
  resource_id: string
  title: string
  description: string | null
  source_url: string | null
}

interface Course {
  course_id: string
  title: string
  course_code: string
  description: string | null
  credits: number
  department: Department | null
  resources: Resource[]
}

interface ResourceResult {
  resource_id: string
  title: string
  description: string | null
  source_url: string | null
  course: Course
}

const ROW_SIZE = 3

export default function Home() {
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [allProfessors, setAllProfessors] = useState<ProfessorRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [showAllProfessors, setShowAllProfessors] = useState(false)
  const [showAllResources, setShowAllResources] = useState(false)
  const [showAllCourses, setShowAllCourses] = useState(false)
  const [majorCount, setMajorCount] = useState<number | null>(null)
  const [courseCount, setCourseCount] = useState<number | null>(null)
  const [profCount, setProfCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true)
        const [coursesRes, profsRes, courseCountRes, profCountRes, majorsRes] = await Promise.all([
          supabase
            .from('courses')
            .select('course_id, title, course_code, description, credits, department(department_id, name, code), resources(resource_id, title, description, source_url)')
            .order('course_code', { ascending: true })
            .range(0, 9999),
          supabase
            .from('professor')
            .select('prof_id, prof_firstname, prof_lastname, department(department_id, name, code)')
            .order('prof_lastname', { ascending: true })
            .range(0, 9999),
          // Exact counts — not affected by max_rows row cap
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('professor').select('*', { count: 'exact', head: true }),
          supabase.from('major').select('*', { count: 'exact', head: true }),
        ])

        if (coursesRes.error) throw coursesRes.error
        if (profsRes.error) throw profsRes.error

        setAllCourses((coursesRes.data as unknown as Course[]) || [])
        setAllProfessors((profsRes.data as unknown as ProfessorRow[]) || [])
        setCourseCount(courseCountRes.count ?? null)
        setProfCount(profCountRes.count ?? null)
        setMajorCount(majorsRes.count ?? 0)
      } catch (err: any) {
        console.error('Error loading data:', err)
        setError(err.message || 'Failed to sync database information')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Reset show-more when search/filter changes
  useEffect(() => {
    setShowAllProfessors(false)
    setShowAllResources(false)
    setShowAllCourses(false)
  }, [searchQuery, departmentFilter])

  const departments = useMemo(() => {
    const codes = allCourses
      .map(c => c.department?.code)
      .filter((c): c is string => !!c)
    return ['All', ...Array.from(new Set(codes)).sort()]
  }, [allCourses])

  const deptFiltered = useMemo(() =>
    departmentFilter === 'All'
      ? allCourses
      : allCourses.filter(c => c.department?.code === departmentFilter),
    [allCourses, departmentFilter]
  )

  // Min 2 chars to avoid single-letter noise
  const q = searchQuery.trim().length >= 2 ? searchQuery.trim().toLowerCase() : ''
  const isSearching = q.length > 0

  const matchingCourses = useMemo(() =>
    deptFiltered.filter(c => {
      if (!isSearching) return true
      const deptCode = c.department?.code?.toLowerCase() ?? ''
      const combined = `${deptCode} ${c.course_code}`.toLowerCase() // e.g. "css 382"
      return (
        c.title.toLowerCase().includes(q) ||
        c.course_code.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.department?.name.toLowerCase().includes(q) ||
        deptCode.includes(q) ||
        combined.includes(q)
      )
    }), [deptFiltered, q, isSearching])

  const matchingProfessors = useMemo((): ProfessorRow[] => {
    if (!isSearching) return []
    return allProfessors.filter(p => {
      const fullName = `${p.prof_firstname ?? ''} ${p.prof_lastname ?? ''}`.toLowerCase().trim()
      const deptMatch = departmentFilter === 'All' || p.department?.code === departmentFilter
      return fullName.includes(q) && deptMatch
    })
  }, [allProfessors, q, isSearching, departmentFilter])

  const matchingResources = useMemo((): ResourceResult[] => {
    if (!isSearching) return []
    const results: ResourceResult[] = []
    const seen = new Set<string>()
    for (const course of deptFiltered) {
      for (const r of course.resources ?? []) {
        if (
          !seen.has(r.resource_id) &&
          (r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
        ) {
          seen.add(r.resource_id)
          results.push({ resource_id: r.resource_id, title: r.title, description: r.description, source_url: r.source_url ?? null, course })
        }
      }
    }
    return results
  }, [deptFiltered, q, isSearching])

  const hasAnyResults = matchingCourses.length > 0 || matchingProfessors.length > 0 || matchingResources.length > 0

  const visibleProfessors = showAllProfessors ? matchingProfessors : matchingProfessors.slice(0, ROW_SIZE)
  const visibleResources  = showAllResources  ? matchingResources  : matchingResources.slice(0, ROW_SIZE)
  const visibleCourses    = showAllCourses    ? matchingCourses    : matchingCourses.slice(0, ROW_SIZE)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-6 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Academic Course Registration Hub
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl">
            Browse current university catalog offerings, check prerequisite hierarchies, and manage dynamic schedules in real-time.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/departments" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-sm">
              Explore Academic Departments
            </Link>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-6 mt-8 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search courses, professors, or textbooks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Metric Cards */}
      <section className="max-w-6xl mx-auto mt-6 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/courses"
          className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:border-blue-200 transition-all group"
        >
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-200 transition-colors">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Offerings</h3>
            <p className="text-2xl font-bold">
              {loading ? <span className="text-slate-400 text-lg">Loading…</span> : `${(courseCount ?? allCourses.length).toLocaleString()} Courses`}
            </p>
          </div>
        </Link>

        <Link
          to="/professors"
          className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:border-indigo-200 transition-all group"
        >
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-200 transition-colors">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Faculty Instructors</h3>
            <p className="text-2xl font-bold">
              {loading ? <span className="text-slate-400 text-lg">Loading…</span> : `${(profCount ?? allProfessors.length).toLocaleString()} Staff`}
            </p>
          </div>
        </Link>

        <Link
          to="/majors"
          className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:border-emerald-200 transition-all group"
        >
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200 transition-colors">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Degree Pathways</h3>
            <p className="text-2xl font-bold">
              {loading ? <span className="text-slate-400 text-lg">Loading…</span> : `${majorCount ?? 0} Majors`}
            </p>
          </div>
        </Link>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {loading ? (
          <div className="flex justify-center items-center py-12 gap-2 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={20} />
            <span>Syncing catalog with Supabase...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <strong>Database Synchronization Error:</strong> {error}
          </div>
        ) : isSearching && !hasAnyResults ? (
          <div className="py-12 text-center text-slate-500">No results match your search.</div>
        ) : (
          <>
            {/* Professors Section — only when searching */}
            {matchingProfessors.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-500" />
                  Professors
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    {matchingProfessors.length} result{matchingProfessors.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                  {visibleProfessors.map(p => (
                    <div key={p.prof_id} className="flex items-center justify-between px-5 py-3">
                      <Link
                        to={`/professors/${p.prof_id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {[p.prof_firstname, p.prof_lastname].filter(Boolean).join(' ')}
                      </Link>
                      {p.department ? (
                        <Link
                          to={`/departments/${p.department.department_id}`}
                          className="text-blue-600 text-sm font-medium hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          {p.department.code} — {p.department.name} <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">No department assigned</span>
                      )}
                    </div>
                  ))}
                </div>
                {matchingProfessors.length > ROW_SIZE && !showAllProfessors && (
                  <button
                    onClick={() => setShowAllProfessors(true)}
                    className="mt-2 w-full py-2 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1"
                  >
                    Show {matchingProfessors.length - ROW_SIZE} more <ChevronDown size={14} />
                  </button>
                )}
              </section>
            )}

            {/* Textbooks Section — only when searching */}
            {matchingResources.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <BookMarked size={18} className="text-emerald-500" />
                  Textbooks
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    {matchingResources.length} result{matchingResources.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                  {visibleResources.map(({ resource_id, title, description, source_url, course }) => (
                    <div key={resource_id} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <span className="font-medium text-slate-900">{title}</span>
                        {description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{description}</p>
                        )}
                      </div>
                      {source_url && (
                        <a
                          href={source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 shrink-0 text-blue-600 text-sm font-medium hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          View <ChevronRight size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                {matchingResources.length > ROW_SIZE && !showAllResources && (
                  <button
                    onClick={() => setShowAllResources(true)}
                    className="mt-2 w-full py-2 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1"
                  >
                    Show {matchingResources.length - ROW_SIZE} more <ChevronDown size={14} />
                  </button>
                )}
              </section>
            )}

            {/* Courses Section — always visible */}
            {(!isSearching || matchingCourses.length > 0) && (
              <section>
                {isSearching ? (
                  <h2 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-500" />
                    Courses
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      {matchingCourses.length} result{matchingCourses.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                ) : (
                  <p className="text-sm text-slate-500 mb-4">
                    Showing {matchingCourses.length} course{matchingCourses.length !== 1 ? 's' : ''}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {visibleCourses.map((course) => (
                    <div key={course.course_id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
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
                        <Link to={`/courses/${course.course_id}`} className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-1">
                          View Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                {matchingCourses.length > ROW_SIZE && !showAllCourses && (
                  <button
                    onClick={() => setShowAllCourses(true)}
                    className="mt-4 w-full py-2.5 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1 border border-slate-200 rounded-lg bg-white shadow-sm"
                  >
                    Show {matchingCourses.length - ROW_SIZE} more courses <ChevronDown size={14} />
                  </button>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
