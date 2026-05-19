import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Loader2, ArrowLeft, Bookmark, Clock, GraduationCap } from 'lucide-react'

interface Department {
  name: string
  code: string
}

interface CourseDetails {
  id: string
  title: string
  course_number: string
  credits: number
  description: string | null
  syllabus_abstract: string | null
  prerequisites: string | null
  departments: Department | null
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)

  useEffect(() => {
    async function fetchCourseDetails() {
      if (!id) return
      try {
        setLoading(true)
        
        const { data, error: dbError } = await supabase
          .from('courses')
          .select('id, title, course_number, credits, description, syllabus_abstract, prerequisites, departments(name, code)')
          .eq('id', id)
          .single()

        if (dbError) throw dbError
        setCourse(data as unknown as CourseDetails)
      } catch (err: any) {
        console.error('Error fetching course records:', err)
        setError(err.message || 'Unable to sync details for this section module.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourseDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Syncing catalog profile metadata...</span>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Link to="/departments" className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Catalog Access Exception:</strong> {error || 'The requested record unique locator index string is invalid.'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Dynamic Back Nav History */}
      <Link 
        to={`/departments/${course.departments?.code ? '' : ''}`}
        onClick={() => window.history.back()}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 group"
      >
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> 
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
              {course.departments?.code || 'UNKN'}-{course.course_number}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
              {course.title}
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-1">
              <GraduationCap size={16} /> Hosted by the Department of {course.departments?.name}
            </p>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Course Abstract</h3>
            <p className="text-slate-600 leading-relaxed bg-white p-5 rounded-xl border border-slate-200">
              {course.description || 'No descriptive statement record has been cataloged for this syllabus unit module structure point.'}
            </p>
          </div>

          {course.syllabus_abstract && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Syllabus Highlights</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {course.syllabus_abstract}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls Card */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Registration Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 text-slate-700 border-b border-slate-100 pb-4">
                <Clock size={20} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Value Metrics</p>
                  <p className="text-sm font-bold text-slate-900">{course.credits} Lecture Units</p>
                </div>
              </div>

              <div className="space-y-2 pb-2">
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Bookmark size={14} /> Requisite Credentials
                </p>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-700">
                  {course.prerequisites ? (
                    <span className="font-mono text-blue-700 font-semibold">{course.prerequisites}</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">None (Open Enrollment)</span>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => setIsRegistered(!isRegistered)}
                className={`w-full font-bold py-5 rounded-xl transition-all ${
                  isRegistered 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isRegistered ? 'Successfully Enrolled' : 'Add to Academic Schedule'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}