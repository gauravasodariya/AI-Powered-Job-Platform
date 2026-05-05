import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { PlusCircle, List, Users, LayoutDashboard, Briefcase, TrendingUp, CheckCircle, LogOut, Bell, XCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PostJob from '../components/jobs/PostJob';
import ManageJobs from '../components/jobs/ManageJobs';
import ViewApplicants from '../components/jobs/ViewApplicants';
import JobDetails from '../components/jobs/JobDetails';

const RecruiterDashboard = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    pending: 0,
    monthlyData: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('/jobs/recruiter/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchDashboardStats();
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/recruiter-dashboard' },
    { icon: List, label: 'Managed Jobs', path: '/recruiter-dashboard/jobs' },
    { icon: PlusCircle, label: 'Post New Job', path: '/recruiter-dashboard/post' },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 text-slate-600 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-[10px] shadow-sm">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 tracking-tight">AI JobHub</p>
                <p className="text-sm text-slate-500">Recruiter workspace</p>
              </div>
            </Link>
            <button 
              className="md:hidden p-2 hover:bg-slate-100 rounded-[10px] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <XCircle className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Main Menu</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-[10px] text-sm font-bold transition-all duration-200 border ${
                    isActive
                      ? 'bg-primary-50 border-primary-100 text-primary-700'
                      : 'border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 space-y-4">
            <button 
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-[10px] text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
          <div className="flex items-center flex-1">
            <button 
              className="md:hidden p-2 mr-4 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <List className="h-6 w-6" />
            </button>
            <div>
              <p className="text-lg font-bold text-slate-900">Recruiter Dashboard</p>
              <p className="text-sm text-slate-500">Jobs, applicants, and hiring analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-[10px] transition-all border border-slate-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center space-x-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'Recruiter'}</p>
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter mt-1">Hiring Manager</p>
              </div>
              <div className="h-10 w-10 rounded-[10px] bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-black shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || <Users className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
            <Routes>
              <Route index element={
                <div className="space-y-8 animate-in fade-in duration-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Hiring Overview</h3>
                      <p className="text-slate-500 mt-1 font-medium text-sm">Real-time insights into your recruitment pipeline</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'primary' },
                      { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'blue' },
                      { label: 'Shortlisted', value: stats.shortlisted, icon: CheckCircle, color: 'green' },
                      { label: 'Hired Applicants', value: stats.hired, icon: TrendingUp, color: 'purple' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-2xl bg-${item.color === 'primary' ? 'primary-50' : item.color + '-50'} text-${item.color === 'primary' ? 'primary-600' : item.color + '-600'} group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-1">{item.label}</p>
                        <h4 className="text-3xl font-black text-slate-900">{item.value}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              } />
              <Route path="jobs" element={<ManageJobs />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="post" element={<PostJob />} />
              <Route path="edit/:jobId" element={<PostJob />} />
              <Route path="applicants/:jobId" element={<ViewApplicants />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
