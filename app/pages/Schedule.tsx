import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Loader2, CalendarDays, GraduationCap, Trash2 } from 'lucide-react'

interface ScheduleEntry {
  id: string
  course_id: string
  added_at: string
  quarter: string
  courses: {
    course_id: string
    title: string
    course_code: string
    credits: string
    department: { name: string; code: string } | null
  }
}

const QUARTER_ORDER: Record<string, number> = { Winter: 0, Spring: 1, Summer: 2, Autumn: 3 }

function quarterSortKey(quarter: string): number {
  const parts = quarter.split(' ')
  const year = parseInt(parts[1] ?? '0')
  const order = QUARTER_ORDER[parts[0]] ?? 4
  return year * 4 + order
}

export default function Schedule() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return

    async function fetchSchedule() {
      const { data, error } = await supabase
        .from('user_schedule')
        .select('id, course_id, added_at, quarter, courses(course_id, title, course_code, credits, department(name, code))')
        .eq('user_id', user!.id)
        .order('added_at', { ascending: false })

      if (!error && data) {
        setSchedule(data as unknown as ScheduleEntry[])
      }
      setLoading(false)
    }

    fetchSchedule()
  }, [user])

  const handleRemove = async (entryId: string) => {
    setRemoving(entryId)
    await supabase.from('user_schedule').delete().eq('id', entryId)
    setSchedule(prev => prev.filter(e => e.id !== entryId))
    setRemoving(null)
  }

  // Group entries by quarter, sorted chronologically
  const groupedByQuarter = useMemo(() => {
    const groups: Record<string, ScheduleEntry[]> = {}
    for (const entry of schedule) {
      const q = entry.quarter || 'Unassigned'
      if (!groups[q]) groups[q] = []
      groups[q].push(entry)
    }
    return Object.entries(groups).sort(([a], [b]) => quarterSortKey(a) - quarterSortKey(b))
  }, [schedule])

  const totalCredits = useMemo(() =>
    schedule.reduce((sum, e) => sum + (parseInt(e.courses.credits) || 0), 0),
    [schedule]
  )

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading schedule...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900">My Academic Schedule</h1>
        </div>
        {schedule.length > 0 && (
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{schedule.length}</span> course{schedule.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
            <span className="font-semibold text-slate-700">{totalCredits}</span> credits
          </div>
        )}
      </div>

      {schedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap className="h-16 w-16 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-600 mb-2">No courses added yet</h2>
          <p className="text-slate-400 mb-6">Browse the course catalog to build your schedule.</p>
          <Button onClick={() => navigate('/courses')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByQuarter.map(([quarter, entries]) => (
            <div key={quarter}>
              {/* Quarter header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-bold text-slate-700">{quarter}</h2>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">
                  {entries.reduce((sum, e) => sum + (parseInt(e.courses.credits) || 0), 0)} credits
                </span>
              </div>

              {/* Courses in this quarter */}
              <div className="grid gap-3">
                {entries.map(entry => (
                  <Card key={entry.id} className="border-slate-200 shadow-sm bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <Link
                        to={`/courses/${entry.courses.course_id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                            {entry.courses.department?.code || 'UNKN'}-{entry.courses.course_code}
                          </span>
                          <span className="text-xs text-slate-400">{entry.courses.credits} credits</span>
                        </div>
                        <p className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {entry.courses.title}
                        </p>
                        {entry.courses.department && (
                          <p className="text-xs text-slate-400 mt-0.5">{entry.courses.department.name}</p>
                        )}
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={removing === entry.id}
                        onClick={() => handleRemove(entry.id)}
                        className="shrink-0 gap-1"
                      >
                        {removing === entry.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
