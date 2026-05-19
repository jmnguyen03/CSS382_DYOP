import { useParams, Link } from 'react-router';
import { ChevronLeft, Book, User, ChevronRight } from 'lucide-react';
import { courses } from '../data/courses';

export function CourseDetail() {
  const { id } = useParams();
  const course = courses.find(c => c.id === Number(id));

  if (!course) {
    return (
      <div className="px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Course Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Courses
        </Link>

        {/* Course Card - Similar to Home Page */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">{course.code}</span>
                  <h2 className="font-semibold text-lg">{course.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm opacity-90">{course.credits} credits</span>
                <span className="text-sm opacity-90">{course.semester}</span>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Course Description</h3>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Professor Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={18} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Instructor{course.professors.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="ml-7 space-y-3">
                  {course.professors.map((prof, idx) => (
                    <div key={idx}>
                      <p className="text-gray-900">{prof.name}</p>
                      <p className="text-sm text-gray-600">{prof.email}</p>
                    </div>
                  ))}
                  <Link
                    to={`/departments/${encodeURIComponent(course.department)}`}
                    className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 pt-1"
                  >
                    {course.department}
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Textbooks */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Book size={18} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Required Textbooks</h3>
                </div>
                <div className="ml-7 space-y-4">
                  {course.textbooks.map((book, idx) => (
                    <div key={idx} className="border-l-2 border-blue-600 pl-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{book.title}</p>
                          <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {book.edition}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              ISBN: {book.isbn}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {book.price}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          book.required
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {book.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
