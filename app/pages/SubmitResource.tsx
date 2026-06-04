import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, FileText, Link2, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export function SubmitResource() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    course_id: '',
    submitted_url: '',
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (formData.course_id && !uuidRegex.test(formData.course_id.trim())) {
        throw new Error('Associated Course ID must be a valid UUID sequence layout string.');
      }

      const submissionPayload = {
        course_id: formData.course_id.trim() || null,
        submitted_url: formData.submitted_url.trim(),
        reason: formData.reason.trim() || null,
        status: 'pending'
      };

      // Connect explicitly to your public.request_submission database layout profile configuration
      const { error } = await supabase
        .from('request_submission')
        .insert([submissionPayload]);

      if (error) throw error;

      setSubmitStatus({
        type: 'success',
        message: 'Your material contribution proposal has been saved for verification tracking.'
      });
      setFormData({ course_id: '', submitted_url: '', reason: '' });

      setTimeout(() => {
        navigate('/courses');
      }, 1500);

    } catch (error: any) {
      console.error('Database connection insert fail context:', error);
      setSubmitStatus({
        type: 'error',
        message: `Submission Failure: ${error.message || 'Check network properties.'}`
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
              Provide textbooks or syllabus details linking directly onto your course system indices.
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

            <div>
              <label htmlFor="course_id" className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash size={15} className="text-slate-400" />
                Associated Course ID (UUID) *
              </label>
              <input
                id="course_id"
                name="course_id"
                type="text"
                value={formData.course_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono bg-white text-slate-900"
                placeholder="e.g., c9a64738-d113-4ec2-a5d9-762493012abc"
              />
            </div>

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
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900"
                placeholder="https://example.com/free-textbook-pdf"
              />
            </div>

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
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900 resize-none font-normal"
                placeholder="Describe material conditions..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
              <p className="text-xs text-slate-400 m-0">* Required field reference constraint</p>
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