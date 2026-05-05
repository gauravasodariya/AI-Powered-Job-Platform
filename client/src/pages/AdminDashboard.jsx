import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Users,
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  MoreVertical,
  ArrowRight,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import {
  AdminStats,
  UserManagement,
  JobManagement,
  ApplicationManagement,
  InquiryManagement,
  AnalyticsView,
} from "./AdminSubComponents";

const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
  };

  const fetchData = async (type = "all") => {
    try {
      setLoading(true);
      
      if (type === "all" || type === "stats") {
        const res = await axios.get("/admin/stats");
        setStats(res.data);
      }
      
      if (type === "all" || type === "users") {
        const res = await axios.get("/admin/users");
        setUsers(res.data.data || []);
      }
      
      if (type === "all" || type === "jobs") {
        const res = await axios.get("/admin/jobs");
        setJobs(res.data.data || []);
      }
      
      if (type === "all" || type === "applications") {
        const res = await axios.get("/admin/applications");
        setApplications(res.data.data || []);
      }
      
      if (type === "all" || type === "inquiries") {
        const res = await axios.get("/admin/inquiries");
        setInquiries(res.data.data || []);
      }
    } catch (err) {
      console.error(`Admin Dashboard Fetch Error (${type}):`, err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch dashboard data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load: fetch stats and inquiries (for notification badge)
    const initialFetch = async () => {
      try {
        setLoading(true);
        const [statsRes, inqRes] = await Promise.all([
          axios.get("/admin/stats"),
          axios.get("/admin/inquiries"),
        ]);
        setStats(statsRes.data);
        setInquiries(inqRes.data.data || []);
      } catch (err) {
        console.error("Admin Dashboard Initial Fetch Error:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    initialFetch();
  }, []);

  // Fetch specific data when navigating to different tabs
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/users") && users.length === 0) fetchData("users");
    else if (path.includes("/jobs") && jobs.length === 0) fetchData("jobs");
    else if (path.includes("/applications") && applications.length === 0) fetchData("applications");
    else if (path.includes("/inquiries") && inquiries.length === 0) fetchData("inquiries");
  }, [location.pathname]);

  const handleResolveInquiry = async (id) => {
    try {
      const res = await axios.put(`/admin/inquiries/${id}/resolve`);
      if (res.data.success) {
        setInquiries(
          inquiries.map((i) =>
            i._id === id ? { ...i, status: "resolved" } : i,
          ),
        );
        setSuccess("Inquiry resolved successfully");
        clearMessages();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resolve inquiry");
      clearMessages();
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin-dashboard" },
    { icon: Users, label: "Users", path: "/admin-dashboard/users" },
    { icon: Briefcase, label: "Jobs", path: "/admin-dashboard/jobs" },
    {
      icon: FileText,
      label: "Applications",
      path: "/admin-dashboard/applications",
    },
    {
      icon: MessageSquare,
      label: "Inquiries",
      path: "/admin-dashboard/inquiries",
    },
    { icon: BarChart3, label: "Analytics", path: "/admin-dashboard/analytics" },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Dashboard Error
          </h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={fetchData}
            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="bg-white border-r border-slate-100 flex flex-col relative z-20 transition-all duration-300">
        <div className="p-6 flex items-center border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-800">Admin</h1>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 transition-all ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {isSidebarOpen && (
                <span className="ml-3 font-medium text-sm">{item.label}</span>
              )}
              {item.label === "Inquiries" &&
                inquiries.filter((i) => i.status !== "resolved").length > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                    {inquiries.filter((i) => i.status !== "resolved").length}
                  </span>
                )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
          >
            {isSidebarOpen ? (
              <MoreVertical className="h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {location.pathname.split("/").pop() || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-bold font-medium text-gray-900">Admin</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-8 mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-8 mt-4 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8">
          <Routes>
            <Route
              index
              element={
                <AdminStats
                  stats={stats?.stats}
                  recentUsers={stats?.recentUsers}
                  recentJobs={stats?.recentJobs}
                />
              }
            />
            <Route path="users" element={<UserManagement users={users} />} />
            <Route path="jobs" element={<JobManagement jobs={jobs} />} />
            <Route
              path="applications"
              element={<ApplicationManagement applications={applications} />}
            />
            <Route
              path="inquiries"
              element={
                <InquiryManagement
                  inquiries={inquiries}
                  onResolve={handleResolveInquiry}
                />
              }
            />
            <Route
              path="analytics"
              element={<AnalyticsView stats={stats?.stats} />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
