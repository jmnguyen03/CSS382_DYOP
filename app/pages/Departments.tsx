import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Loader2, ArrowRight } from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
  description: string | null
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setLoading(true)
        const { data, error: dbError } = await supabase
          .from('departments')
          .select('id, name, code, description')
          .order('name', { ascending: true })

        if (dbError) throw dbError
        setDepartments((data as Department[]) || [])
      } catch (err: any) {
        console.error('Error fetching departments:', err)
        setError(err.message || 'Failed to pull department listings.')
      } finally {
        setLoading(false)
      }
    }
    fetchDepartments()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading academic departments...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Database Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Departments</h1>
        <p className="text-slate-500 mt-2">Select a field of study below to explore available course catalogs and paths.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-md transition-all border-slate-200 flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-xl font-bold text-slate-900">{dept.name}</CardTitle>
                <span className="text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded">
                  {dept.code}
                </span>
              </div>
              <CardDescription className="mt-2 text-slate-600 line-clamp-3">
                {dept.description || 'No description provided for this academic division.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link 
                to={`/departments/${dept.id}`} 
                className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center justify-end gap-1 group"
              >
                Browse Courses 
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}