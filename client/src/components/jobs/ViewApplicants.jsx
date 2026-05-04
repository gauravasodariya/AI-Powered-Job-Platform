import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, FileText, Sparkles, AlertCircle, CheckCircle, XCircle, ArrowLeft, Loader2, Mail, Eye } from 'lucide-react';

const ViewApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          axios.get(`/jobs/${jobId}`),
          axios.get(`/applications/job/${jobId}`)
        ]);
        setJob(jobRes.data.data);
        setApplicants(appRes.data.data);
      } catch (err) {
        console.error(err);
        setNotification({ type: 'error', message: 'Failed to fetch applicants' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleStatusUpdate = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await axios.put(`/applications/${appId}/status`, { status: newStatus });
      
      setApplicants(applicants.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
      
      setNotification({ 
        type: 'success', 
        message: `Applicant ${newStatus === 'shortlisted' ? 'shortlisted' : 'rejected'} successfully!` 
      });

      // Auto-clear notification after 3s
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update status' });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted':
        return <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-green-100/50">Shortlisted</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-red-100/50">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-primary-100/50">Pending</span>;
    }
  };

  const getScoreTone = (score = 0) => {
    if (score >= 80) return 'text-green-600 bg-green-500';
    if (score >= 50) return 'text-amber-600 bg-amber-500';
    return 'text-red-600 bg-red-500';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Analyzing applicants with AI...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-primary-50 text-primary-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100">
              Active Campaign
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              {applicants.length} Total Applicants
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
            {job?.title || 'Software Developer'}
          </h1>
          <p className="text-slate-500 font-bold text-sm md:text-base flex items-center">
            <Sparkles className="h-4 w-4 text-primary-500 mr-2" />
            Reviewing {applicants.length} applicants ranked by AI matching accuracy.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center space-x-3 min-w-[130px]">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
              <p className="text-xl font-black text-slate-900">{applicants.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center space-x-3 min-w-[130px]">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Shortlisted</p>
              <p className="text-xl font-black text-slate-900">
                {applicants.filter(a => a.status === 'shortlisted').length}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center space-x-3 min-w-[130px]">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Best Match</p>
              <p className="text-xl font-black text-slate-900">
                {applicants.length ? Math.max(...applicants.map((a) => a.matchScore || 0)) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {applicants.length > 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applicant</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resume</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Match</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Skill Gaps</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map((app, index) => {
                  const scoreTone = getScoreTone(app.matchScore || 0);
                  const scoreText = scoreTone.split(' ')[0];
                  const scoreBar = scoreTone.split(' ')[1];

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-3 min-w-[220px]">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {index === 0 ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <p className="text-sm font-black text-slate-900">
                                {app.seeker?.name || 'Anonymous Applicant'}
                              </p>
                              {(app.matchScore || 0) >= 95 && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-100">
                                  Elite
                                </span>
                              )}
                            </div>
                            <a
                              href={`mailto:${app.seeker?.email}`}
                              className="inline-flex items-center mt-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                            >
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              {app.seeker?.email || 'No email'}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {app.resumeUrl ? (
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <button
                              onClick={() => setShowResumeModal(app.resumeUrl)}
                              className="inline-flex items-center justify-center px-3 py-3 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold hover:bg-primary-100 transition-all align-top mt-1"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No resume</span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="min-w-[120px]">
                          <p className={`text-lg font-black ${scoreText}`}>{app.matchScore || 0}%</p>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                            <div
                              className={`h-full rounded-full ${scoreBar}`}
                              style={{ width: `${app.matchScore || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-1.5 min-w-[220px] max-w-[320px]">
                          {app.skillGap && app.skillGap.length > 0 ? (
                            app.skillGap.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full border border-red-100"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full border border-green-100">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              No major gaps
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {updatingId === app._id ? (
                          <div className="h-9 flex items-center">
                            <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 min-w-[130px]">
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                              disabled={app.status === 'shortlisted'}
                              className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                app.status === 'shortlisted'
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                              }`}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'rejected')}
                              disabled={app.status === 'rejected'}
                              className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                app.status === 'rejected'
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                              }`}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 px-8 py-32 text-center shadow-sm">
          <div className="bg-slate-50 h-20 w-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-slate-100">
            <User className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No applicants yet</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">Applicants will appear here once they apply to this position.</p>
        </div>
      )}

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-50 p-2 rounded-xl">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900">Applicant Resume</h3>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href={showResumeModal} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-100 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Open in New Tab</span>
                </a>
                <button 
                  onClick={() => setShowResumeModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-4 overflow-hidden">
              <div className="w-full h-full bg-white rounded-2xl shadow-inner relative flex flex-col items-center justify-center">
                <iframe 
                  src={`${showResumeModal}#toolbar=0`} 
                  className="w-full h-full rounded-2xl border-none"
                  title="Resume Preview"
                />
                {/* Fallback info if iframe doesn't show properly */}
                <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <p className="font-bold text-slate-500 mb-2">Resume Preview Loading...</p>
                  <p className="text-sm max-w-xs">If the resume doesn't appear, please use the button above to open it in a new tab.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;
