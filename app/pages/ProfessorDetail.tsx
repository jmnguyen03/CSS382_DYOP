import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Loader2, BookOpen, ChevronRight, ArrowLeft, Star, GraduationCap, Users } from 'lucide-react'

interface Department {
  department_id: string
  name: string
  code: string
}

interface Course {
  course_id: string
  title: string
  course_code: string
  credits: string
  description: string | null
  department: Department | null
}

interface Rating {
  rating_id: string
  rating: number | null
  comment: string | null
}

interface Professor {
  prof_id: string
  prof_firstname: string | null
  prof_lastname: string | null
  department: Department | null
}

export default function ProfessorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [deptCourses, setDeptCourses] = useState<Course[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      try {
        setLoading(true)
        // Step 1: fetch prof info, course ID lists, and ratings in parallel
        const [profRes, pcRes, resRes, ratingsRes] = await Promise.all([
          supabase
            .from('professor')
            .select('prof_id, prof_firstname, prof_lastname, department:department(department_id, name, code)')
            .eq('prof_id', id)
            .single(),
          // IDs from the teaching-assignment junction table
          supabase
            .from('professor_courses')
            .select('course_id')
            .eq('prof_id', id),
          // IDs from resources this professor is linked to
          supabase
            .from('resources')
            .select('course_id')
            .eq('prof_id', id)
            .not('course_id', 'is', null),
          supabase
            .from('rating')
            .select('rating_id, rating, comment')
            .eq('prof_id', id),
        ])

        if (profRes.error) throw profRes.error
        if (ratingsRes.error) throw ratingsRes.error

        // Step 2: collect unique course IDs from both sources
        const rawIds = [
          ...((pcRes.data ?? []) as { course_id: string }[]).map(r => r.course_id),
          ...((resRes.data ?? []) as { course_id: string }[]).map(r => r.course_id),
        ].filter(Boolean)
        const courseIds = Array.from(new Set(rawIds))

        console.log('[courseIds]', courseIds)

        // Step 3: fetch full course data in a single .in() query (no ambiguity)
        let fetchedCourses: Course[] = []
        if (courseIds.length > 0) {
          const { data: courseData, error: courseErr } = await supabase
            .from('courses')
            .select('course_id, title, course_code, credits, description, department(department_id, name, code)')
            .in('course_id', courseIds)
            .order('course_code', { ascending: true })
          console.log('[courses] data:', courseData, 'error:', courseErr)
          if (!courseErr) fetchedCourses = (courseData as unknown as Course[]) || []
        }

        // Fallback: if no direct assignments, load courses from professor's department
        const prof = profRes.data as unknown as Professor
        let fetchedDeptCourses: Course[] = []
        if (fetchedCourses.length === 0 && prof?.department?.department_id) {
          const { data: deptData } = await supabase
            .from('courses')
            .select('course_id, title, course_code, credits, description, department(department_id, name, code)')
            .eq('department_id', prof.department.department_id)
            .order('course_code', { ascending: true })
            .range(0, 49)
          fetchedDeptCourses = (deptData as unknown as Course[]) || []
        }

        setProfessor(prof)
        setCourses(fetchedCourses)
        setDeptCourses(fetchedDeptCourses)
        setRatings((ratingsRes.data as Rating[]) || [])
      } catch (err: any) {
        console.error('Error loading professor data:', err)
        setError(err.message || 'Failed to load faculty record.')
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
        <span>Loading faculty record...</span>
      </div>
    )
  }

  if (error || !professor) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Error:</strong> {error || 'Professor not found.'}
        </div>
      </div>
    )
  }

  const fullName = [professor.prof_firstname, professor.prof_lastname].filter(Boolean).join(' ')
  const ratedReviews = ratings.filter(r => r.rating !== null)
  const avgRating = ratedReviews.length > 0
    ? (ratedReviews.reduce((sum, r) => sum + r.rating!, 0) / ratedReviews.length).toFixed(1)
    : null

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 group">
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Professor Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                <GraduationCap size={28} />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{fullName}</h1>
            </div>
            {professor.department ? (
              <Link
                to={`/departments/${professor.department.department_id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full"
              >
                {professor.department.code} — {professor.department.name}
                <ChevronRight size={14} />
              </Link>
            ) : (
              <span className="text-sm text-slate-400">No department assigned</span>
            )}
          </div>

          <div className="flex gap-3">
            {/* Courses count badge */}
            <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl min-w-[80px]">
              <span className="text-2xl font-bold text-slate-900">{courses.length}</span>
              <span className="text-xs text-slate-500 mt-0.5">Courses</span>
            </div>
            {/* Rating badge */}
            {avgRating ? (
              <div className="flex flex-col items-center justify-center bg-amber-50 border border-amber-200 px-5 py-3 rounded-xl min-w-[80px]">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-500 fill-amber-400" />
                  <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
                </div>
                <span className="text-xs text-slate-500 mt-0.5">{ratedReviews.length} rating{ratedReviews.length !== 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl min-w-[80px]">
                <Users size={18} className="text-slate-400 mb-0.5" />
                <span className="text-xs text-slate-500">No ratings</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Courses Taught — direct assignments, or dept fallback */}
      <section className="mb-8">
        {courses.length > 0 ? (
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Courses Taught
            <span className="text-sm font-normal text-slate-400">{courses.length} total</span>
          </h2>
        ) : deptCourses.length > 0 ? (
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            {professor.department?.name} Courses
            <span className="text-sm font-normal text-slate-400">department catalog</span>
          </h2>
        ) : (
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Courses Taught
          </h2>
        )}
        {courses.length === 0 && deptCourses.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            No course assignments on record.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(courses.length > 0 ? courses : deptCourses).map(course => (
              <Link
                key={course.course_id}
                to={`/courses/${course.course_id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group flex flex-col gap-2"
              >
                <span className="text-xs font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded w-fit">
                  {course.department?.code ?? '???'}-{course.course_code}
                </span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                )}
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>{course.credits} Credits</span>
                  <span className="text-blue-600 font-medium flex items-center gap-0.5">
                    View Details <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Ratings & Comments */}
      {ratings.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star size={20} className="text-amber-500 fill-amber-400" />
            Student Reviews
            <span className="text-sm font-normal text-slate-400">{ratings.length} total</span>
          </h2>
          <div className="space-y-3">
            {ratings.map(r => (
              <div key={r.rating_id} className="bg-white rounded-xl border border-slate-200 p-5">
                {r.rating !== null && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          size={14}
                          className={n <= r.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-600">{r.rating} / 5</span>
                  </div>
                )}
                {r.comment ? (
                  <p className="text-slate-700 text-sm leading-relaxed">{r.comment}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic">No written comment.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
