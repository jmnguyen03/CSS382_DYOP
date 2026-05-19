import { useParams, Link } from 'react-router';
import { ChevronLeft, Book, User } from 'lucide-react';
import { courses } from '../data/courses';

export function DepartmentDetail() {
  const { name } = useParams();
  const departmentName = decodeURIComponent(name || '');
  const departmentCourses = courses.filter(c => c.department === departmentName);

  if (departmentCourses.length === 0) {
    return (
      <div className="px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Department Not Found</h1>
          <Link to="/departments" className="text-blue-600 hover:text-blue-700">
            Return to Departments
          </Link>
        </div>
      </div>
    );
  }

  const professors = new Set(departmentCourses.flatMap(c => c.professors.map(p => p.name)));

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/departments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Departments
        </Link>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-8 py-8 text-white mb-6">
          <h1 className="text-3xl font-semibold mb-4">{departmentName}</h1>
          <div className="flex flex-wrap gap-6 text-blue-100">
            <div>
              <span className="text-2xl font-semibold text-white">{departmentCourses.length}</span>
              <span className="ml-2">Course{departmentCourses.length !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <span className="text-2xl font-semibold text-white">{professors.size}</span>
              <span className="ml-2">Instructor{professors.size !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <h2 className="font-semibold text-xl mb-4">Courses</h2>

        <div className="grid gap-4">
          {departmentCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">{course.code}</span>
                    <h3 className="font-semibold">{course.name}</h3>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded text-sm transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">{course.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-gray-600" />
                      <h4 className="font-medium text-sm text-gray-900">
                        Instructor{course.professors.length > 1 ? 's' : ''}
                      </h4>
                    </div>
                    <div className="ml-6 space-y-1">
                      {course.professors.map((prof, idx) => (
                        <p key={idx} className="text-sm text-gray-600">{prof.name}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Book size={16} className="text-gray-600" />
                      <h4 className="font-medium text-sm text-gray-900">
                        {course.textbooks.length} Textbook{course.textbooks.length !== 1 ? 's' : ''}
                      </h4>
                    </div>
                    <div className="ml-6 space-y-1">
                      {course.textbooks.map((book, idx) => (
                        <p key={idx} className="text-sm text-gray-600">{book.title}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
