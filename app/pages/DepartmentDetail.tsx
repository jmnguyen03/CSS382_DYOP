import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Loader2, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react'

interface Department {
  name: string
  code: string
  description: string | null
}

interface Course {
  id: string
  title: string
  course_number: string
  credits: number
  description: string | null
}

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [department, setDepartment] = useState<Department | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDepartmentData() {
      if (!id) return
      try {
        setLoading(true)
        
        // Fetch specific metadata
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('name, code, description')
          .eq('id', id)
          .single()

        if (deptError) throw deptError
        setDepartment(deptData as Department)

        // Fetch associated courses running under this foreign key relation
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title, course_number, credits, description')
          .eq('department_id', id)
          .order('course_number', { ascending: true })

        if (courseError) throw courseError
        setCourses((courseData as Course[]) || [])

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
            <Card key={course.id} className="hover:shadow-sm border-slate-200 transition-shadow flex flex-col justify-between">
              <CardHeader className="p-6 pb-4">
                <span className="text-xs font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded w-fit">
                  {department.code}-{course.course_number}
                </span>
                <CardTitle className="text-lg font-bold text-slate-900 mt-2">{course.title}</CardTitle>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {course.description || 'No lecture abstract has been published for this curriculum track entry section.'}
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 flex justify-between items-center border-t border-slate-50 mt-auto">
                <span className="text-xs font-semibold text-slate-500">{course.credits} Academic Credits</span>
                <Link to={`/courses/${course.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                  View Requisites <ChevronRight size={16} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}