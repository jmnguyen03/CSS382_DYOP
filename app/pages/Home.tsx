import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Book, User, ChevronRight } from 'lucide-react';
import { courses } from '../data/courses';

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const departments = ['All', ...new Set(courses.map(c => c.department))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professors.some(prof =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      course.textbooks.some(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDepartment = selectedDepartment === 'All' || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search courses, professors, or textbooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm flex-1"
            />
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
            <Filter size={18} className="text-gray-500" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent border-none outline-none text-sm cursor-pointer"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
        </div>

        <div className="grid gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
                    <Link
                      to={`/course/${course.id}`}
                      className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded text-sm transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="p-6">
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
          ))}
        </div>
      </div>
    </div>
  );
}
