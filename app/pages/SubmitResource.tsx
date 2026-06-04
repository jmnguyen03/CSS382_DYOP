import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router'; // Strict React Router v7 framework build configuration mapping
import { ChevronLeft, Upload, FileText, Link2, Search, Check, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface CourseSearchResult {
  course_id: string;
  course_code: string; // Updated to match your exact SQL schema definition tracking parameter
  title: string;
}

export function SubmitResource() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form Field Input States
  const [formData, setFormData] = useState({
    submitted_url: '',
    reason: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseSearchResult | null>(null);
  
  // Dynamic Live Query States
  const [courses, setCourses] = useState<CourseSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Notification Banners Trigger States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debounced Live Server Lookup Interface Trigger
  useEffect(() => {
    // Blocks query execution on empty inputs or matching current active selections
    if (searchQuery.trim().length < 2 || (selectedCourse && searchQuery === `${selectedCourse.course_code} - ${selectedCourse.title}`)) {
      setCourses([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const cleanQuery = searchQuery.trim();
        
        // CORRECTION: Adjusted the column search key query from .or('code...') to .or('course_code...')
        const { data, error } = await supabase
          .from('courses') 
          .select('course_id, course_code, title')
          .or(`course_code.ilike.%${cleanQuery}%,title.ilike.%${cleanQuery}%`)
          .limit(10); // Performance boundary layout cap

        if (error) throw error;
        setCourses(data || []);
        setIsDropdownOpen(true);
      } catch (err: any) {
        console.error('Supabase async remote course fetch failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300); // 300ms input throttling limits database load

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCourse]);

  // Click handler to toggle list view drop when clicking background components
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      setSubmitStatus({ type: 'error', message: 'Please select a course item using the drop lookup view list.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const submissionPayload = {
        course_id: selectedCourse.course_id, // Behind-the-scenes relational UUID map constraint entry
        submitted_url: formData.submitted_url.trim(),
        reason: formData.reason.trim() || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('request_submission')
        .insert([submissionPayload]);

      if (error) throw error;

      setSubmitStatus({
        type: 'success',
        message: `Thank you! Material suggestions for ${selectedCourse.course_code} successfully transmitted for validation tracking.`
      });
      setFormData({ submitted_url: '', reason: '' });
      setSelectedCourse(null);
      setSearchQuery('');

      setTimeout(() => {
        navigate('/courses');
      }, 2000);

    } catch (error: any) {
      console.error('Database payload commit failure breakdown:', error);
      setSubmitStatus({
        type: 'error',
        message: `Submission Failure: ${error.message || 'Check connection context.'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium text-sm no-underline"
        >
          <ChevronLeft size={16} />
          Back to Courses
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 m-0">
              <Upload className="text-indigo-600" size={22} />
              Submit Course Material
            </h1>
            <p className="text-sm text-slate-500 mt-1 mb-0">
              Search by course numbers or keywords. Returns matches instantly across large indexing scopes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 m-0">
            {submitStatus && (
              <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                submitStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {submitStatus.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />}
                <span className="text-sm font-medium">{submitStatus.message}</span>
              </div>
            )}

            {/* Debounced Input Area Container */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Search size={15} className="text-slate-400" />
                Select Associated Course *
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 pl-10 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white text-slate-900 font-normal"
                  placeholder="Type to find course catalog matching e.g., CSS 382..."
                  value={searchQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                    if (selectedCourse) setSelectedCourse(null);
                  }}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                  </div>
                )}
              </div>

              {/* Dynamic Option List Drawer Stack */}
              {isDropdownOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <button
                        key={course.course_id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-sm transition-colors border-none bg-transparent cursor-pointer text-slate-700 font-normal"
                        onClick={() => {
                          setSelectedCourse(course);
                          setSearchQuery(`${course.course_code} - ${course.title}`);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div>
                          <span className="font-semibold text-indigo-600 mr-2">{course.course_code}</span>
                          <span className="text-slate-800">{course.title}</span>
                        </div>
                        {selectedCourse?.course_id === course.course_id && (
                          <Check size={16} className="text-indigo-600 shrink-0" />
                        )}
                      </button>
                    ))
                  ) : (
                    !searching && (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        No catalog matches found inside current index.
                      </div>
                    )
                  )}
                </div>
              )}
              {selectedCourse && (
                <p className="text-xs text-emerald-600 font-medium mt-1 mb-0">
                  ✓ Target Relational Identity Key Set: <span className="font-mono bg-emerald-50 px-1 rounded border border-emerald-100">{selectedCourse.course_id}</span>
                </p>
              )}
            </div>

            {/* Resource URL Box */}
            <div>
              <label htmlFor="submitted_url" className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Link2 size={15} className="text-slate-400" />
                Resource Link (URL) *
              </label>
              <input
                id="submitted_url"
                name="submitted_url"
                type="url"
                value={formData.submitted_url}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white text-slate-900"
                placeholder="https://openstax.org/details/books/..."
              />
            </div>

            {/* Description Textarea Field Box */}
            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText size={15} className="text-slate-400" />
                Reason for Submission / Material Description
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white text-slate-900 resize-none font-normal"
                placeholder="Provide short comments layout text matching textbook prerequisites parameters..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
              <p className="text-xs text-slate-400 m-0">* Required field reference constraints</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all border-none cursor-pointer"
              >
                <Upload size={16} />
                {isSubmitting ? 'Uploading...' : 'Submit Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitResource;