import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Edit3,
  Trash2,
  MapPin,
  Briefcase,
  PlusCircle,
  AlertCircle,
  Sparkles,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import JobCard from "./JobCard";

const ManageJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const res = await axios.get("/jobs");
        if (res.data.success && user) {
          const myJobs = res.data.data.filter(
            (job) =>
              job.recruiter === user._id ||
              job.recruiter?._id === user._id ||
              (job.recruiter?.email && job.recruiter.email === user.email),
          );
          setJobs(myJobs);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchMyJobs();
    }
  }, [user]);

  const stats = useMemo(() => {
    return {
      totalJobs: jobs.length,
      totalApplicants: jobs.reduce(
        (sum, job) => sum + (job.applicantCount || 0),
        0,
      ),
      activeJobs: jobs.filter((job) => job.status !== "closed").length,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [jobs, searchQuery]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/jobs/${id}`);
      setJobs(jobs.filter((job) => job._id !== id));
      setShowDeleteModal(null);
      setSuccess("Job deleted successfully");
      clearMessages();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job");
      clearMessages();
      setShowDeleteModal(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="bg-red-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-8 ring-red-50/50">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-900 mb-3 tracking-tight">
              Delete Posting?
            </h3>
            <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
              This will permanently remove the job listing and all associated
              application data. This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-4 px-6 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/50 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 py-4 px-6 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
              Managed Jobs
            </h2>
            <p className="text-slate-500 font-bold text-lg max-w-2xl">
              Search your posted roles, open a specific job, and review
              applicants from one place.
            </p>
          </div>
          <Link
            to="/recruiter-dashboard/post"
            className="inline-flex items-center justify-center px-5 py-4 bg-primary-600 text-white rounded-[1.5rem] font-black hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-600/30 transition-all duration-300 group active:scale-95"
          >
            Post a New Job
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: "Active Postings",
              value: stats.activeJobs,
              color: "primary",
              icon: Briefcase,
            },
            {
              label: "Total Applicants",
              value: stats.totalApplicants,
              color: "blue",
              icon: Users,
            },
            {
              label: "Avg. Match Rate",
              value: jobs.length
                ? `${Math.round(
                    jobs.reduce((sum, job) => {
                      const applicants = job.applicants || [];
                      if (!applicants.length) return sum;
                      const jobAverage =
                        applicants.reduce(
                          (innerSum, applicant) =>
                            innerSum + (applicant.matchScore || 0),
                          0,
                        ) / applicants.length;
                      return sum + jobAverage;
                    }, 0) / jobs.length,
                  )}%`
                : "0%",
              color: "purple",
              icon: Sparkles,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-6 hover:shadow-md transition-shadow"
            >
              <div
                className={`h-16 w-16 rounded-2xl bg-${stat.color === "primary" ? "primary-50" : stat.color + "-50"} flex items-center justify-center text-${stat.color === "primary" ? "primary-600" : stat.color + "-600"}`}
              >
                <stat.icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm mb-10">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by job title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-primary-500/50 
              focus:bg-white transition-all text-sm font-bold text-slate-600 
              placeholder:text-slate-400"
/>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 bg-white border border-slate-100 rounded-[3rem] animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onDelete={(id) => setShowDeleteModal(id)}
            />
          ))}

          {filteredJobs.length === 0 && (
            <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm">
              <div className="bg-slate-50 h-32 w-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 ring-1 ring-slate-100 group">
                <Briefcase className="h-14 w-14 text-slate-300 group-hover:text-primary-400 transition-colors" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">
                No jobs found
              </h3>
              <p className="text-slate-500 mb-12 max-w-md mx-auto font-bold text-xl leading-relaxed">
                {searchQuery
                  ? `We couldn't find any jobs matching "${searchQuery}"`
                  : "You haven't posted any jobs yet. Start building your team today!"}
              </p>
              <Link
                to="/recruiter-dashboard/post"
                className="inline-flex items-center px-12 py-6 bg-primary-600 text-white font-black rounded-[1.5rem] hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 active:scale-95"
              >
                <PlusCircle className="h-6 w-6 mr-3" />
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
