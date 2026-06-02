import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import { Loader2, BookOpen, ChevronRight, ArrowLeft, Award, ChevronDown } from 'lucide-react'

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

interface Course {
  course_id: string
  title: string
  course_code: string
  credits: string
  description: string | null
  department: Department | null
}

const PAGE_SIZE = 9

export default function MajorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [major, setMajor] = useState<Major | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      try {
        setLoading(true)
        const [majorRes, coursesRes] = await Promise.all([
          supabase
            .from('major')
            .select('major_id, description, department:department(department_id, name, code)')
            .eq('major_id', id)
            .single(),
          supabase
            .from('courses')
            .select('course_id, title, course_code, credits, description, department:department(department_id, name, code)')
            .eq('major_id', id)
            .order('course_code', { ascending: true })
            .range(0, 9999),
        ])
        if (majorRes.error) throw majorRes.error
        if (coursesRes.error) throw coursesRes.error
        setMajor(majorRes.data as unknown as Major)
        setCourses((coursesRes.data as unknown as Course[]) || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load major.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading major...</span>
      </div>
    )
  }

  if (error || !major) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Error:</strong> {error || 'Major not found.'}
        </div>
      </div>
    )
  }

  const visible = showAll ? courses : courses.slice(0, PAGE_SIZE)

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 group">
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <Award size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {major.description ?? 'Unnamed Major'}
            </h1>
            {major.department && (
              <Link
                to={`/departments/${major.department.department_id}`}
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full"
              >
                {major.department.code} — {major.department.name}
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Courses */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          Courses in this Major
          <span className="text-sm font-normal text-slate-400">{courses.length} total</span>
        </h2>

        {courses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            No courses are currently listed under this major.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visible.map(course => (
                <div
                  key={course.course_id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div className="p-6">
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-mono">
                      {course.department?.code ?? major.department?.code ?? 'UNKN'}-{course.course_code}
                    </span>
                    <h3 className="text-base font-bold mt-3 text-slate-900 leading-snug">{course.title}</h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-3">
                      {course.description ?? 'No description available.'}
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

            {courses.length > PAGE_SIZE && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-6 w-full py-2.5 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1 border border-slate-200 rounded-lg bg-white shadow-sm"
              >
                Show {courses.length - PAGE_SIZE} more courses <ChevronDown size={14} />
              </button>
            )}
          </>
        )}
      </section>
    </div>
  )
}
