import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Loader2, ArrowLeft, Bookmark, Clock, GraduationCap } from 'lucide-react'

interface Department {
  name: string
  code: string
}

interface CourseDetails {
  course_id: string
  title: string
  course_code: string
  credits: number
  description: string | null
  prerequisites: string | null
  department: Department | null
}

const QUARTER_ORDER = ['Winter', 'Spring', 'Summer', 'Autumn']

function generateQuarters(): string[] {
  const quarters: string[] = []
  for (let year = 2026; year <= 2028; year++) {
    for (const name of QUARTER_ORDER) {
      quarters.push(`${name} ${year}`)
    }
  }
  return quarters
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [enrolledQuarter, setEnrolledQuarter] = useState<string | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(false)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedQuarter, setSelectedQuarter] = useState('Summer 2026')

  const quarters = generateQuarters()

  useEffect(() => {
    async function fetchCourseDetails() {
      if (!id) return
      try {
        setLoading(true)

        const { data, error: dbError } = await supabase
          .from('courses')
          .select('course_id, title, course_code, credits, description, prerequisites, department(name, code)')
          .eq('course_id', id)
          .single()

        if (dbError) throw dbError
        setCourse(data as unknown as CourseDetails)

        if (user) {
          const { data: scheduleData } = await supabase
            .from('user_schedule')
            .select('id, quarter')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .maybeSingle()
          setIsRegistered(!!scheduleData)
          setEnrolledQuarter(scheduleData?.quarter ?? null)
        }
      } catch (err: any) {
        console.error('Error fetching course records:', err)
        setError(err.message || 'Unable to sync details for this section module.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourseDetails()
  }, [id, user])

  const handleAddClick = () => {
    if (!user) {
      navigate('/login')
      return
    }
    setShowDialog(true)
  }

  const handleConfirmAdd = async () => {
    setShowDialog(false)
    setScheduleLoading(true)
    await supabase
      .from('user_schedule')
      .insert({ user_id: user!.id, course_id: id, quarter: selectedQuarter })
    setIsRegistered(true)
    setEnrolledQuarter(selectedQuarter)
    setScheduleLoading(false)
  }

  const handleRemove = async () => {
    setScheduleLoading(true)
    await supabase
      .from('user_schedule')
      .delete()
      .eq('user_id', user!.id)
      .eq('course_id', id)
    setIsRegistered(false)
    setEnrolledQuarter(null)
    setScheduleLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading course...</span>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Link to="/courses" className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Error:</strong> {error || 'Course not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 group"
      >
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
              {course.department?.code || 'UNKN'}-{course.course_code}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
              {course.title}
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-1">
              <GraduationCap size={16} /> {course.department?.name}
            </p>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Course Abstract</h3>
            <p className="text-slate-600 leading-relaxed bg-white p-5 rounded-xl border border-slate-200">
              {course.description || 'No description available.'}
            </p>
          </div>
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

              {isRegistered ? (
                <div className="space-y-2">
                  <p className="text-xs text-center text-emerald-600 font-semibold">
                    Enrolled — {enrolledQuarter}
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={scheduleLoading}
                    className="w-full font-bold py-5 rounded-xl flex items-center justify-center gap-2"
                  >
                    {scheduleLoading && <Loader2 size={16} className="animate-spin" />}
                    Remove from Schedule
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddClick}
                  disabled={scheduleLoading}
                  className="w-full font-bold py-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2"
                >
                  {scheduleLoading && <Loader2 size={16} className="animate-spin" />}
                  Add to Academic Schedule
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quarter Picker Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Choose a Quarter</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-500 mb-3">
              Which quarter are you planning to take <span className="font-semibold text-slate-700">{course.title}</span>?
            </p>
            <select
              value={selectedQuarter}
              onChange={e => setSelectedQuarter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {quarters.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
              Add to Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
