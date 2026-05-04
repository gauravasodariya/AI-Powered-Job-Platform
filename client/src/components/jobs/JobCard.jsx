import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Edit3, Trash2, MapPin, Briefcase, Clock, DollarSign, Eye, Building2 } from 'lucide-react';

const JobCard = ({ job, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
      <div className="absolute -top-12 -right-12 h-40 w-40 bg-primary-50 rounded-full opacity-100 transition-opacity duration-700 blur-3xl"></div>
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="bg-primary-600 p-3 rounded-xl text-white shadow-lg shadow-primary-200 transition-all duration-500">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="flex items-center space-x-2 opacity-100 transition-all duration-500">
          <button 
            onClick={() => navigate(`/recruiter-dashboard/edit/${job._id}`)}
            className="p-3 text-primary-600 bg-primary-50 rounded-xl transition-all active:scale-95 border border-primary-100"
            title="Edit Posting"
          >
            <Edit3 className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onDelete(job._id)}
            className="p-3 text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 border border-red-100"
            title="Delete Posting"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mb-5 flex-1 relative z-10">
        <div className="flex items-center space-x-2 mb-3 flex-wrap">
          <span className="text-primary-600 bg-primary-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-100/50">
            {job.jobType || 'Full-time'}
          </span>
          <span className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
            <Clock className="h-3 w-3 mr-1.5" />
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 transition-colors leading-tight tracking-tight">
          {job.title}
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center text-sm font-bold text-slate-500 bg-slate-50/50 p-2 rounded-xl transition-all">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center mr-2.5 shadow-sm">
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            {job.company}
          </div>
          <div className="flex items-center text-sm font-bold text-slate-500 bg-slate-50/50 p-2 rounded-xl transition-all">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center mr-2.5 shadow-sm">
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            {job.location}
          </div>
          {job.salary && (
            <div className="flex items-center text-sm font-bold text-slate-500 bg-slate-50/50 p-2 rounded-xl transition-all">
              <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center mr-2.5 shadow-sm">
  <span className="text-primary-500 font-bold text-sm">₹</span>
</div>
{job.salary}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 relative z-10 mt-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mr-3 shadow-sm group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-slate-900 leading-none">
                {job.applicantCount || 0}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {job.applicantCount === 1 ? 'Applicant' : 'Applicants'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => navigate(`/recruiter-dashboard/edit/${job._id}`)}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-100 transition-all active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/recruiter-dashboard/jobs/${job._id}`}
            className="inline-flex items-center justify-center space-x-2 px-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-[1rem] text-xs font-black hover:bg-slate-50 transition-all duration-300 active:scale-95"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </Link>
          <Link
            to={`/recruiter-dashboard/applicants/${job._id}`}
            className="inline-flex items-center justify-center space-x-2 px-3 py-2.5 bg-slate-900 text-white rounded-[1rem] text-xs font-black hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-600/20 transition-all duration-300 active:scale-95"
          >
            <Users className="h-4 w-4" />
            <span>View Applicants</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
