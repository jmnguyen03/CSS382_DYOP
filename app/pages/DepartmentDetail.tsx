import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Loader2, BookOpen, ChevronRight, ChevronDown, ArrowLeft, GraduationCap, Star } from 'lucide-react'

interface Department {
  name: string
  code: string
  description: string | null
}

interface Course {
  course_id: string
  title: string
  course_code: string
  credits: number
  description: string | null
}

interface RatingRow {
  rating: number | null
}

interface Professor {
  prof_id: string
  prof_firstname: string | null
  prof_lastname: string | null
  rating: RatingRow[]
}

function avgRating(ratings: RatingRow[]): number | null {
  const valid = ratings.filter(r => r.rating !== null).map(r => r.rating!)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [department, setDepartment] = useState<Department | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllFaculty, setShowAllFaculty] = useState(false)

  const FACULTY_LIMIT = 5

  useEffect(() => {
    async function fetchDepartmentData() {
      if (!id) return
      try {
        setLoading(true)

        const [deptRes, courseRes, profRes] = await Promise.all([
          supabase
            .from('department')
            .select('name, code, description')
            .eq('department_id', id)
            .single(),
          supabase
            .from('courses')
            .select('course_id, title, course_code, credits, description')
            .eq('department_id', id)
            .order('course_code', { ascending: true }),
          supabase
            .from('professor')
            .select('prof_id, prof_firstname, prof_lastname, rating(rating_id, rating)')
            .eq('department_id', id)
            .order('prof_lastname', { ascending: true }),
        ])

        if (deptRes.error) throw deptRes.error
        if (courseRes.error) throw courseRes.error
        if (profRes.error) throw profRes.error

        setDepartment(deptRes.data as Department)
        setCourses((courseRes.data as Course[]) || [])
        setProfessors((profRes.data as Professor[]) || [])

      } catch (err: any) {
        console.error('Error syncing department data details:', err)
        setError(err.message || 'Failed to download course registry lists.')
      } finally {
        setLoading(false)
      }
    }
    fetchDepartmentData()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Compiling database registry...</span>
      </div>
    )
  }

  if (error || !department) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Link to="/departments" className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Back to Departments
        </Link>
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Registry Search Exception:</strong> {error || 'Academic record identifier missing.'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Link to="/departments" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 group">
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Back to Departments
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{department.name}</h1>
          <span className="text-sm font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full">
            {department.code} Division
          </span>
        </div>
        <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
          {department.description || 'No formal description details cataloged for this academic timeline segment branch context.'}
        </p>
      </div>

      {/* Faculty in this department */}
      {professors.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="text-indigo-600" />
            Faculty
            <span className="text-sm font-normal text-slate-400">{professors.length} instructors</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAllFaculty ? professors : professors.slice(0, FACULTY_LIMIT)).map(p => {
              const fullName = [p.prof_firstname, p.prof_lastname].filter(Boolean).join(' ')
              const avg = avgRating(p.rating ?? [])
              return (
                <Link
                  key={p.prof_id}
                  to={`/professors/${p.prof_id}`}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-200 transition-colors shrink-0">
                          <GraduationCap size={16} />
                        </div>
                        <span className="text-xs font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {department.code}
                        </span>
                      </div>
                      {avg !== null && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Star size={11} className="text-amber-500 fill-amber-400" />
                          <span className="text-xs font-bold text-amber-700">{avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {fullName || 'Unknown'}
                    </h3>
                  </div>
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                    <span>{(p.rating ?? []).length} review{(p.rating ?? []).length !== 1 ? 's' : ''}</span>
                    <span className="text-blue-600 font-semibold group-hover:text-blue-700 inline-flex items-center gap-1">
                      View Profile <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          {professors.length > FACULTY_LIMIT && !showAllFaculty && (
            <button
              onClick={() => setShowAllFaculty(true)}
              className="mt-4 w-full py-2.5 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1 border border-slate-200 rounded-lg bg-white shadow-sm"
            >
              Show {professors.length - FACULTY_LIMIT} more instructors <ChevronDown size={14} />
            </button>
          )}
        </section>
      )}

      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BookOpen size={22} className="text-blue-600" /> Cataloged Course Modules ({courses.length})
      </h2>

      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          No courses are currently published under this field of study.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.course_id} className="hover:shadow-sm border-slate-200 transition-shadow flex flex-col justify-between">
              <CardHeader className="p-6 pb-4">
                <span className="text-xs font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded w-fit">
                  {department.code}-{course.course_code}
                </span>
                <CardTitle className="text-lg font-bold text-slate-900 mt-2">{course.title}</CardTitle>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {course.description || 'No lecture abstract has been published for this curriculum track entry section.'}
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 flex justify-between items-center border-t border-slate-50 mt-auto">
                <span className="text-xs font-semibold text-slate-500">{course.credits} Credits</span>
                <Link to={`/courses/${course.course_id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                  View Details <ChevronRight size={16} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}