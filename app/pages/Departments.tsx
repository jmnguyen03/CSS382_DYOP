import { Link } from 'react-router';
import { Building2, ChevronRight } from 'lucide-react';
import { courses } from '../data/courses';

export function Departments() {
  const departments = [...new Set(courses.map(c => c.department))].sort();

  const departmentStats = departments.map(dept => {
    const deptCourses = courses.filter(c => c.department === dept);
    const totalTextbooks = deptCourses.reduce((sum, c) => sum + c.textbooks.length, 0);
    const professors = new Set(deptCourses.flatMap(c => c.professors.map(p => p.name)));

    return {
      name: dept,
      courseCount: deptCourses.length,
      textbookCount: totalTextbooks,
      professorCount: professors.size
    };
  });

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Departments</h1>
        <p className="text-gray-600 mb-6">Browse courses by department</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStats.map((dept) => (
            <Link
              key={dept.name}
              to={`/departments/${encodeURIComponent(dept.name)}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 size={24} className="text-blue-600" />
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>

              <h2 className="font-semibold text-lg text-gray-900 mb-3">{dept.name}</h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Courses</span>
                  <span className="font-medium text-gray-900">{dept.courseCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Textbooks</span>
                  <span className="font-medium text-gray-900">{dept.textbookCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Instructors</span>
                  <span className="font-medium text-gray-900">{dept.professorCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
