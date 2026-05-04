import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  Loader2,
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccess('');
    }, 3000);
  };

  useEffect(() => {
    const fetchJob = async () => {
      // Don't fetch until auth state is determined
      if (authLoading) return;

      try {
        const res = await axios.get(`/jobs/${id}`);
        const jobData = res.data.data;
        setJob(jobData);
        setApplied(jobData.hasApplied);
      } catch (err) {
        setError('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user, authLoading]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'seeker') {
      return;
    }

    setApplying(true);
    try {
      await axios.post(`/jobs/${id}/apply`);
      setApplied(true);
      setSuccess('Application successful!');
      clearMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
      clearMessages();
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || 'Job not found'}</h2>
        <button onClick={() => navigate(-1)} className="text-primary-600 font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-10 font-bold transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Jobs
      </button>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-black uppercase tracking-widest border border-primary-100">
                  {job.jobType}
                </span>
                <span className="flex items-center text-xs font-bold text-slate-400">
                  <Clock className="h-4 w-4 mr-1.5" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {job.matchScore !== undefined && user?.role === 'seeker' && (
                <div className="flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-2xl border border-primary-100">
                  <Sparkles className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-black text-primary-700">
                    {job.matchScore}% Match
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              {job.title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                <p className="text-sm font-black text-slate-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                  {job.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                <p className="text-sm font-black text-slate-700 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-primary-500" />
                  {job.experience} Years
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary</p>
                <p className="text-sm font-black text-slate-700 flex items-center">
                  ₹ {job.salary || 'Negotiable'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry</p>
                <p className="text-sm font-black text-slate-700 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-primary-500" />
                  {job.industry || 'IT'}
                </p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-black text-slate-900 mb-4">Job Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              <h3 className="text-xl font-black text-slate-900 mt-10 mb-4">Role Requirements</h3>
              <ul className="space-y-3 mb-10">
                {job.requirements?.map((req, i) => (
                  <li key={i} className="flex items-start text-slate-600">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-black text-slate-900 mb-4">Key Skills</h3>
              <div className="flex flex-wrap gap-3 mb-10">
                {job.skills?.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Skill Gaps Section */}
              {user?.role === 'seeker' && (
                <>
                  {job.skillGap?.length > 0 ? (
                    <div className="mt-10 p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <h4 className="text-lg font-black text-amber-900">Skill Gaps</h4>
                      </div>
                      <p className="text-sm text-amber-700 font-medium mb-4 italic">
                        {job.hasApplied 
                          ? "To improve your match for this role, consider gaining experience in these areas:"
                          : "Based on your profile, you might be missing these skills required for this role:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.skillGap.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1.5 bg-white text-amber-700 text-xs font-bold rounded-lg border border-amber-200 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (job.matchScore === 100 || (job.skillGap?.length === 0 && user.profile?.skills?.length > 0)) ? (
                    <div className="mt-10 p-6 bg-green-50/50 rounded-3xl border border-green-100/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h4 className="text-lg font-black text-green-900">Perfect Match!</h4>
                      </div>
                      <p className="text-sm text-green-700 font-medium italic">
                        You have all the key skills required for this role. Great job!
                      </p>
                    </div>
                  ) : user.profile?.resumeUrl ? (
                    <div className="mt-10 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <h4 className="text-lg font-black text-blue-900">Analyze Your Match</h4>
                      </div>
                      <p className="text-sm text-blue-700 font-medium mb-4 italic">
                        You've uploaded a resume! Confirm your skills in your profile to see how well you match this role and identify any skill gaps.
                      </p>
                      <Link 
                        to="/profile" 
                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
                      >
                        Go to Profile
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <Sparkles className="h-5 w-5 text-slate-400" />
                        <h4 className="text-lg font-black text-slate-900">Check Skill Gaps</h4>
                      </div>
                      <p className="text-sm text-slate-600 font-medium mb-4 italic">
                        Upload your resume or add skills to your profile to see if you have any gaps for this role.
                      </p>
                      <Link 
                        to="/profile" 
                        className="inline-flex items-center text-sm font-bold text-primary-600 hover:underline"
                      >
                        Update Profile
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {applied && (
            <div className="w-full py-4 bg-green-500/20 text-green-400 rounded-[1.25rem] font-black flex items-center justify-center space-x-2 border border-green-500/30">
              <CheckCircle2 className="h-5 w-5" />
              <span>Applied Successfully</span>
            </div>
          )}

          {user?.role !== 'recruiter' && !applied && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full py-5 bg-primary-600 text-white rounded-[1.25rem] font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {applying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>Apply Now</span>
              )}
            </button>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg">
            <h3 className="text-lg font-black text-slate-900 mb-6">About the Company</h3>
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-2xl">
                {job.company?.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-slate-900">{job.company}</h4>
                <p className="text-xs font-bold text-slate-400">{job.industry || 'Technology'}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Leading the industry with innovative solutions and a focus on talent development.
            </p>
            <Link to={`/jobs?company=${job.company}`} className="text-primary-600 text-xs font-black hover:underline uppercase tracking-widest">
              View all openings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
