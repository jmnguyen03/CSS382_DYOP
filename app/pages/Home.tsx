import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, Award, Users, ChevronRight, Loader2 } from 'lucide-react'

// Define explicit TypeScript interfaces for safety
interface Department {
  name: string
  code: string
}

interface Course {
  course_id: string
  title: string
  course_code: string
  description: string | null
  credits: number
  department: Department | null
}

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getFeatured() {
      try {
        setLoading(true)
        // Fetches your real database courses and joins department fields dynamically
        const { data, error: dbError } = await supabase
          .from('courses')
          .select('course_id, title, course_code, description, credits, department(name, code)')
          .limit(3)
        
        if (dbError) throw dbError
        
        // Safely typecast the data payload to match our interface schema
        setFeaturedCourses((data as unknown as Course[]) || [])
      } catch (err: any) {
        console.error('Error loading courses:', err)
        setError(err.message || 'Failed to sync database information')
      } finally {
        setLoading(false)
      }
    }
    getFeatured()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Header Frame */}
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

      {/* Overview Metric Cards */}
      <section className="max-w-6xl mx-auto -mt-8 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><BookOpen size={24} /></div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Offerings</h3>
            <p className="text-2xl font-bold">450+ Courses</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg"><Users size={24} /></div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Faculty Instructors</h3>
            <p className="text-2xl font-bold">120+ Staff</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg"><Award size={24} /></div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Degree Pathways</h3>
            <p className="text-2xl font-bold">32 Majors</p>
          </div>
        </div>
      </section>

      {/* Main Database-Driven Container Block */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Featured Database Cataloging</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12 gap-2 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={20} />
            <span>Syncing catalog with Supabase...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <strong>Database Synchronization Error:</strong> {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <div key={course.course_id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                <div className="p-6">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-mono">
                    {course.department?.code || 'UNKN'}-{course.course_code}
                  </span>
                  <h3 className="text-lg font-bold mt-3 text-slate-900">
                    {course.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-2 line-clamp-3">
                    {course.description || "No public catalog abstract details provided for this section context."}
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{course.credits} Credits</span>
                  <Link to={`/courses/${course.course_id}`} className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-1">
                    Prerequisites <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}