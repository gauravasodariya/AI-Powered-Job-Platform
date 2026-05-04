import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle2, XCircle, AlertCircle, MapPin, Sparkles, Building2 } from 'lucide-react';

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('/applications/my-applications');
        setApplications(res.data.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-50 text-green-700 border-green-200';
      case 'hired': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shortlisted':
      case 'hired': return <CheckCircle2 className="h-4 w-4 mr-1.5" />;
      case 'rejected': return <XCircle className="h-4 w-4 mr-1.5" />;
      default: return <Clock className="h-4 w-4 mr-1.5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Application History</h1>
        <p className="text-gray-500 mt-1">Track the status of your job applications and AI match scores.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No applications yet</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            You haven't applied for any jobs yet. Explore opportunities and start your journey!
          </p>
          <Link 
            to="/jobs"
            className="mt-8 inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            Find Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Job Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Applied On</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">AI Match</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-lg mr-4 group-hover:bg-primary-100 transition-colors">
                        {app.job?.company?.charAt(0) || 'J'}
                      </div>
                      <div>
                        <Link to={`/jobs/${app.job?._id}`} className="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors">
                          {app.job?.title || 'Untitled'}
                        </Link>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                          {app.job?.company || 'Unknown'} • {app.job?.location || 'Remote'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-500 text-center">
                    {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="text-sm font-black text-primary-600 mb-1 flex items-center">
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        {app.matchScore}%
                      </div>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${app.matchScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="capitalize">{app.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <Link 
                      to={`/jobs/${app.job?._id}`}
                      className="inline-flex items-center px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))} 
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
