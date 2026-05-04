import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Info, DollarSign, MapPin, Briefcase, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostJob = () => {
  const { jobId } = useParams();
  const isEdit = !!jobId;
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    jobType: 'Full-time',
    experienceMin: '',
    experienceMax: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const clearMessages = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        try {
          const res = await axios.get(`/jobs/${jobId}`);
          const job = res.data.data;
          setFormData({
            title: job.title || '',
            company: job.company || '',
            location: job.location || '',
            description: job.description || '',
            requirements: job.requirements?.join(', ') || '',
            salary: job.salary || '',
            jobType: job.jobType || 'Full-time',
            experienceMin: job.experienceMin || '',
            experienceMax: job.experienceMax || '',
          });
        } catch (err) {
          setError('Failed to fetch job details');
          clearMessages();
          setTimeout(() => {
            navigate('/recruiter-dashboard');
          }, 2000);
        } finally {
          setFetching(false);
        }
      };
      fetchJob();
    }
  }, [jobId,navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateAIDescription = async () => {
    if (!formData.title) {
      setError('Please enter a job title first');
      clearMessages();
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post('/jobs/generate-description', {
        title: formData.title,
        requirements: formData.requirements
      });
      setFormData({ ...formData, description: res.data.data });
      setSuccess('Description generated with AI!');
      clearMessages();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate description';
      setError(msg);
      clearMessages();
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert requirements string to array
    const jobData = {
      ...formData,
      requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req !== ''),
    };

    try {
      if (isEdit) {
        await axios.put(`/jobs/${jobId}`, jobData);
        setSuccess('Job updated successfully!');
      } else {
        await axios.post('/jobs', jobData);
        setSuccess('Job posted successfully!');
      }
      clearMessages();
      setTimeout(() => {
        navigate('/recruiter-dashboard/jobs');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'post'} job`);
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-600 p-4 rounded-2xl text-white shadow-lg shadow-primary-200">
              {isEdit ? <Save className="h-7 w-7" /> : <PlusCircle className="h-7 w-7" />}
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {isEdit ? 'Edit Posting' : 'Create Job Listing'}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Fill in the details to find your next great hire</p>
            </div>
          </div>
          
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Job Title</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Senior Product Designer"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Company Name</label>
              <input
                name="company"
                type="text"
                required
                placeholder="TalentAI Inc."
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Location</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  name="location"
                  type="text"
                  required
                  placeholder="Remote / New York"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Salary Range</label>
              <div className="relative group">
                <input
                  name="salary"
                  type="text"
                  placeholder="e.g. ₹ 10000 - ₹ 15000"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Job Type</label>
              <select
                name="jobType"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900 appearance-none cursor-pointer"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Skills & Requirements</label>
            <div className="relative group">
              <input
                name="requirements"
                type="text"
                required
                placeholder="React, TypeScript, Tailwind CSS..."
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.requirements}
                onChange={handleChange}
              />
              <div className="flex items-center space-x-2 mt-3 ml-1">
                <div className="bg-primary-50 p-1 rounded-md">
                  <Info className="h-3 w-3 text-primary-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Separated by commas</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Detailed Description</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={generating}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-xs font-black uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="h-3 w-3 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              name="description"
              required
              rows="12"
              placeholder="Describe the role, responsibilities, and team culture..."
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900 leading-relaxed resize-none"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Min Experience (Years)</label>
              <input
                name="experienceMin"
                type="number"
                min="0"
                placeholder="e.g. 0"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.experienceMin}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Max Experience (Years)</label>
              <input
                name="experienceMax"
                type="number"
                min="0"
                placeholder="e.g. 5"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.experienceMax}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 px-6 border border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 px-6 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 shadow-2xl shadow-primary-600/30 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{isEdit ? 'Update Job Posting' : 'Publish Job Posting'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
