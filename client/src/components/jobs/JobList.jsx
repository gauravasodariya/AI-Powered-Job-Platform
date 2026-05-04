import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Clock, Briefcase, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/jobs');
        setJobs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    setError('');
    setSuccess('');
    setApplying(jobId);
    try {
      await axios.post(`/jobs/${jobId}/apply`);
      setSuccess('Application successful!');
      clearMessages();
      // Update UI or refetch
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
      clearMessages();
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Opportunities</h1>
          <p className="text-gray-500 mt-1">Found {filteredJobs.length} jobs matching your profile</p>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, skills, or companies..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-lg">
                    {job.company?.charAt(0) || 'J'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {job.title || 'Untitled Job'}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{job.company || 'Unknown Company'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    {job.jobType}
                  </span>
                  <span className="text-xs text-gray-400 mt-2 font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center font-semibold text-primary-600">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  AI Match Score: {job.matchScore !== undefined ? `${job.matchScore}%` : 'Calculating...'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <p className="text-sm font-bold text-gray-900">{job.salary || 'Competitive Pay'}</p>
                <button
                  onClick={() => handleApply(job._id)}
                  disabled={applying === job._id}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md hover:shadow-primary-200"
                >
                  {applying === job._id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-20">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default JobList;
