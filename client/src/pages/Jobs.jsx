import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  Sparkles,
  Filter,
  X,
  ChevronDown,
  DollarSign,
  Building2,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    skills: "",
    experience: "",
    experienceMin: "",
    experienceMax: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    industry: "",
    company: "",
    education: "",
    jobType: [],
    employerType: "",
    freshness: "",
    sort: "latest",
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search.trim()) params.append("search", filters.search.trim());
      if (filters.skills.trim()) params.append("skills", filters.skills.trim());
      if (filters.experience.trim())
        params.append("experience", filters.experience.trim());
      if (filters.experienceMin.trim())
        params.append("experienceMin", filters.experienceMin.trim());
      if (filters.experienceMax.trim())
        params.append("experienceMax", filters.experienceMax.trim());
      if (filters.location.trim())
        params.append("location", filters.location.trim());
      if (filters.salaryMin.trim())
        params.append("salaryMin", filters.salaryMin.trim());
      if (filters.salaryMax.trim())
        params.append("salaryMax", filters.salaryMax.trim());
      if (filters.industry.trim())
        params.append("industry", filters.industry.trim());
      if (filters.company.trim())
        params.append("company", filters.company.trim());
      if (filters.education.trim())
        params.append("education", filters.education.trim());
      if (filters.jobType.length > 0)
        params.append("jobType", filters.jobType.join(","));
      if (filters.employerType)
        params.append("employerType", filters.employerType);
      if (filters.freshness) params.append("freshness", filters.freshness);
      if (filters.sort) params.append("sort", filters.sort);

      const res = await axios.get(`/jobs?${params.toString()}`);
      
      let jobsData = res.data.data;
      
      setJobs(jobsData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch jobs";
      setError(errorMessage);
      console.error("Fetch Jobs Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleApply = async (jobId) => {
    setError("");
    setSuccess("");
    if (!user) {
      setError("Please login to apply for jobs");
      clearMessages();
      return;
    }
    if (user.role !== "seeker") {
      setError("Only job seekers can apply for jobs");
      clearMessages();
      return;
    }

    setApplying(jobId);
    try {
      await axios.post(`/jobs/${jobId}/apply`);
      setSuccess("Application sent successfully");
      clearMessages();
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Application failed");
      clearMessages();
    } finally {
      setApplying(null);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleJobType = (type) => {
    setFilters((prev) => ({
      ...prev,
      jobType: prev.jobType.includes(type)
        ? prev.jobType.filter((t) => t !== type)
        : [...prev.jobType, type],
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      skills: "",
      experience: "",
      location: "",
      salaryMin: "",
      salaryMax: "",
      industry: "",
      company: "",
      education: "",
      jobType: [],
      employerType: "",
      freshness: "",
      sort: "latest",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center space-x-2 bg-white border border-gray-200 p-3 rounded-xl shadow-sm text-gray-700 font-medium"
          >
            <Filter className="h-5 w-5" />
            <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
          </button>

          {/* Sidebar Filters */}
          <aside
            className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-80 space-y-6`}
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary-600" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Title, company..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node, Python"
                    className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    value={filters.skills}
                    onChange={(e) =>
                      handleFilterChange("skills", e.target.value)
                    }
                  />
                </div>

                {/* Experience Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience Range (Years)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      min="0"
                      value={filters.experienceMin}
                      onChange={(e) =>
                        handleFilterChange("experienceMin", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      min="0"
                      value={filters.experienceMax}
                      onChange={(e) =>
                        handleFilterChange("experienceMax", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="City or Remote"
                      className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Salary Range (CTC)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      min="0"
                      value={filters.salaryMin}
                      onChange={(e) =>
                        handleFilterChange("salaryMin", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={filters.salaryMax}
                      min={filters.salaryMin || "0"}
                      onChange={(e) =>
                        handleFilterChange("salaryMax", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type
                  </label>
                  <div className="space-y-2">
                    {[
                      "Full-time",
                      "Part-time",
                      "Contract",
                      "Internship",
                      "Walk-in",
                      "Remote",
                    ].map((type) => (
                      <label
                        key={type}
                        className="flex items-center group cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          checked={filters.jobType.includes(type)}
                          onChange={() => toggleJobType(type)}
                        />
                        <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Employer Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employer Type
                  </label>
                  <div className="flex space-x-4">
                    {["Company", "Consultancy"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="employerType"
                          className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          checked={filters.employerType === type}
                          onChange={() =>
                            handleFilterChange("employerType", type)
                          }
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Industry & Education (Simplified) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IT, Finance"
                    className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    value={filters.industry}
                    onChange={(e) =>
                      handleFilterChange("industry", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Job List */}
          <main className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Job Opportunities
                </h1>
                <p className="text-gray-500 mt-1">
                  {loading ? "Searching..." : `Found ${jobs.length} jobs`}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 font-medium">
                  Freshness:
                </span>
                <select
                  className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none font-medium appearance-none"
                  value={filters.freshness}
                  onChange={(e) =>
                    handleFilterChange("freshness", e.target.value)
                  }
                >
                  <option value="">Any time</option>
                  <option value="1">Posted today</option>
                  <option value="3">Last 3 days</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-white border border-gray-100 rounded-2xl animate-pulse"
                  ></div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-4">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="h-14 w-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-xl shrink-0 hover:bg-primary-100 transition-colors"
                        >
                          {job.company?.charAt(0) || "J"}
                        </Link>
                        <div>
                          <Link to={`/jobs/${job._id}`}>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {job.title || "Untitled Job"}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center text-sm font-semibold text-gray-700">
                              <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                              {job.company || "Unknown Company"}
                            </span>
                            <span className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              {job.location || "Location Not Specified"}
                            </span>
                            {job.matchScore !== undefined && (
                              <span className="flex items-center px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-black rounded-lg border border-primary-100 uppercase tracking-tight">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {job.matchScore}% Match
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
                          {job.jobType}
                        </span>
                        <span className="text-xs text-gray-400 font-medium flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(job.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills?.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 5 && (
                        <span className="text-xs text-gray-400 self-center">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-50 gap-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                            Salary
                          </p>
                          <p className="text-sm font-bold text-gray-900 flex items-center">
                            ₹ {job.salary || "Competitive"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                            Exp Required
                          </p>
                          <p className="text-sm font-bold text-gray-900 flex items-center">
                            <Briefcase className="h-4 w-4 mr-1 text-orange-500" />
                            {job.experience}+ Years
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200 text-center"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleApply(job._id)}
                          disabled={applying === job._id}
                          className="flex-1 sm:flex-none px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-100 hover:shadow-primary-200 flex items-center justify-center space-x-2"
                        >
                          {applying === job._id ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Applying...</span>
                            </>
                          ) : (
                            <span>Apply Now</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 py-20 text-center shadow-sm">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  No jobs found
                </h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  We couldn't find any jobs matching your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-8 text-primary-600 font-bold hover:text-primary-700 flex items-center justify-center mx-auto"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
