import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  FileText,
  History,
  TrendingUp,
  Upload,
  CheckCircle2,
  Sparkles,
  Search,
  Bell,
  UserCircle2,
} from "lucide-react";
import axios from "axios";
import ResumeUpload from "../components/profile/ResumeUpload";
import AppliedJobs from "../components/jobs/AppliedJobs";

const SeekerDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    appliedCount: 0,
    topMatch: 0,
    shortlistedCount: 0,
    hasResume: false,
    skillsCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appRes, resumeRes] = await Promise.all([
          axios.get("/applications/my-applications"),
          axios.get("/resumes/me"),
        ]);

        const applications = appRes.data.data || [];
        const topMatch = applications.length
          ? Math.max(...applications.map((app) => app.matchScore || 0))
          : 0;
        const shortlistedCount = applications.filter(
          (app) => app.status === "shortlisted",
        ).length;
        const resumeData = resumeRes.data.data || {};

        setStats({
          appliedCount: applications.length,
          topMatch,
          shortlistedCount,
          hasResume: Boolean(resumeData.resumeUrl),
          skillsCount: resumeData.skills?.length || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    { icon: TrendingUp, label: "Overview", path: "/seeker-dashboard" },
    { icon: FileText, label: "My Resume", path: "/seeker-dashboard/resume" },
    {
      icon: History,
      label: "Applications",
      path: "/seeker-dashboard/applications",
    },
  ];

  const Overview = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-[10px] border border-slate-200 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Seeker Overview</h1>
        <p className="text-slate-500 mt-2">
          Track your resume readiness, application progress, and best AI matches
          in one place.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: "Applications",
            value: stats.appliedCount,
            icon: History,
            tone: "text-primary-600 bg-primary-50",
          },
          {
            label: "Top Match",
            value: `${stats.topMatch}%`,
            icon: Sparkles,
            tone: "text-amber-600 bg-amber-50",
          },
          {
            label: "Shortlisted",
            value: stats.shortlistedCount,
            icon: CheckCircle2,
            tone: "text-green-600 bg-green-50",
          },
          {
            label: "Skills Found",
            value: stats.skillsCount,
            icon: FileText,
            tone: "text-primary-600 bg-primary-50",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-[10px] border border-slate-200 p-6 shadow-sm"
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.tone}`}
            >
              <item.icon className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500 mt-4">{item.label}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[10px] border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Resume Status</h2>
          <p className="text-slate-500 mt-2">
            {stats.hasResume
              ? "Your resume is uploaded and ready for AI matching."
              : "Upload your resume to unlock accurate AI match scores and recruiter visibility."}
          </p>
          <Link
            to="/seeker-dashboard/resume"
            className="inline-flex items-center mt-6 px-5 py-3 rounded-[10px] bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all"
          >
            <Upload className="h-4 w-4 mr-2" />
            {stats.hasResume ? "View Resume" : "Upload Resume"}
          </Link>
        </div>

        <div className="bg-white rounded-[10px] border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Application Progress
          </h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Applications submitted</span>
              <span className="font-bold text-slate-900">
                {stats.appliedCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Shortlisted applications</span>
              <span className="font-bold text-slate-900">
                {stats.shortlistedCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Best AI match</span>
              <span className="font-bold text-primary-600">
                {stats.topMatch}%
              </span>
            </div>
          </div>
          <Link
            to="/seeker-dashboard/applications"
            className="inline-flex items-center mt-6 px-5 py-3 rounded-[10px] border border-slate-200 text-slate-700 font-semibold hover:bg-gray-50 transition-all"
          >
            <History className="h-4 w-4 mr-2" />
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="mb-8">
            <p className="text-lg font-extrabold text-slate-900">AI JobHub</p>
            <p className="text-sm text-slate-500">Seeker workspace</p>
          </div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </h2>
          <nav className="mt-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-[10px] text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary-50 text-primary-700 border border-primary-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 shadow-sm px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                Job Seeker Dashboard
              </p>
              <p className="text-sm text-slate-500">
                Resume, applications, and AI match insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[10px] text-sm text-slate-500">
                <Search className="h-4 w-4" />
                Search
              </button>
              <button className="h-10 w-10 inline-flex items-center justify-center bg-white border border-slate-200 rounded-[10px] text-slate-500">
                <Bell className="h-4 w-4" />
              </button>
              <div className="h-10 w-10 rounded-[10px] bg-primary-100 text-primary-700 flex items-center justify-center">
                <UserCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="resume" element={<ResumeUpload />} />
            <Route path="applications" element={<AppliedJobs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SeekerDashboard;

// In SeekerDashboard componrntent, replace the placeholder components with actual implementations and ensure the API endpoints are correct. The test file for RecruiterDashboard can be used as a reference for structuring tests for SeekerDashboard.
