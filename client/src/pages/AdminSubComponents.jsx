import React, { useState } from "react";
import {
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  X,
  Search as SearchIcon,
} from "lucide-react";

export const AdminStats = ({ stats, recentUsers = [], recentJobs = [] }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white shadow-sm border border-gray-200">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            Total Users
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalUsers || 0}
          </h3>
        </div>
        <div className="p-6 bg-white shadow-sm border border-gray-200">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            Active Jobs
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalJobs || 0}
          </h3>
        </div>
        <div className="p-6 bg-white shadow-sm border border-gray-200">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            Applications
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalApplications || 0}
          </h3>
        </div>
        <div className="p-6 bg-white shadow-sm border border-gray-200">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            New Inquiries
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalInquiries || 0}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Recent Users
          </h3>
          <div className="space-y-2">
            {recentUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-md">
                    {user.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Recent Jobs
          </h3>
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-md">
                    {job.title}
                  </p>
                  <p className="text-sm text-gray-500">{job.company}</p>
                </div>
                <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManagement = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">User Management</h3>
            <p className="text-gray-500 text-sm">Manage platform users</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="seeker">Seekers</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 border-b border-gray-200">Name</th>
                <th className="px-6 py-3 border-b border-gray-200">Email</th>
                <th className="px-6 py-3 border-b border-gray-200">Role</th>
                <th className="px-6 py-3 border-b border-gray-200">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-70">
                      {user.name || "Unknown User"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-md text-gray-600">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[12px] font-bold uppercase ${
                        user.role === "recruiter"
                          ? "bg-purple-100 text-purple-600"
                          : user.role === "admin"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const JobManagement = ({ jobs }) => (
  <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Job Management</h3>
        <p className="text-gray-500 text-sm">Review job postings</p>
      </div>
      <div className="bg-gray-50 px-3 py-1 border border-gray-200">
        <span className="text-sm font-bold text-gray-700">
          {jobs.length} Total
        </span>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3 border-b border-gray-200">
              Job Title & Company
            </th>
            <th className="px-6 py-3 border-b border-gray-200">Posted By</th>
            <th className="px-6 py-3 border-b border-gray-200">Status</th>
            <th className="px-6 py-3 border-b border-gray-200">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-700">{job.title}</p>
                <p className="text-xs text-gray-500">{job.company}</p>
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-700">
                  {job.recruiter?.name || "Unknown"}
                </p>
                <p className="text-[14px] text-gray-500">
                  {job.recruiter?.email}
                </p>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-600 text-[12px] font-bold uppercase">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td colSpan="4" className="p-12 text-center text-gray-500">
                No jobs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const ApplicationManagement = ({ applications }) => (
  <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Applications</h3>
        <p className="text-gray-500 text-sm">Monitor activity</p>
      </div>
      <div className="bg-amber-50 px-3 py-1 border rounded border-amber-200">
        <span className="text-xs font-bold text-amber-600 uppercase">
          {applications.length} Total
        </span>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3 border-b border-gray-200">Name</th>
            <th className="px-6 py-3 border-b border-gray-200">Email</th>
            <th className="px-6 py-3 border-b border-gray-200">Job Details</th>
            <th className="px-6 py-3 border-b border-gray-200">Status</th>
            <th className="px-6 py-3 border-b border-gray-200">Applied</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-700">
                  {app.seeker?.name}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-md text-gray-600">{app.seeker?.email}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-md font-semibold text-gray-700">
                  {app.job?.title}
                </p>
                <p className="text-[14px] text-gray-500">{app.job?.company}</p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-0.5 rounded text-[12px] font-bold uppercase ${
                    app.status === "hired"
                      ? "bg-green-100 text-green-600"
                      : app.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : app.status === "shortlisted"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {app.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-500">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </span>
              </td>
            </tr>
          ))}
          {applications.length === 0 && (
            <tr>
              <td colSpan="5" className="p-12 text-center text-gray-500">
                No applications found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const InquiryManagement = ({ inquiries, onResolve }) => {
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Inquiry Management
          </h3>
          <p className="text-gray-500 text-sm">Manage messages</p>
        </div>
        <div className="bg-pink-50 px-3 py-1 border border-pink-200 rounded">
          <span className="text-sm font-bold text-pink-600">
            {inquiries.length} Messages
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 border-b border-gray-200">Name</th>
              <th className="px-6 py-3 border-b border-gray-200">Email</th>
              <th className="px-6 py-3 border-b border-gray-200">Message</th>
              <th className="px-6 py-3 border-b border-gray-200">Date</th>
              <th className="px-6 py-3 border-b border-gray-200">Status</th>
              <th className="px-6 py-3 border-b border-gray-200 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <tr key={inquiry._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-700">{inquiry.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-md text-gray-500">{inquiry.email}</p>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <p className="text-md text-gray-700 truncate">
                    {inquiry.message}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[12px] font-bold uppercase ${
                      inquiry.status === "resolved"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {inquiry.status || "new"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded text-sm font-bold"
                    >
                      View
                    </button>
                    {inquiry.status !== "resolved" && (
                      <button
                        onClick={() => onResolve(inquiry._id)}
                        className="px-3 py-1 text-green-600 hover:bg-green-50 border border-green-200 rounded text-xs font-bold"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  No inquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white shadow-xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-lg font-bold text-gray-800">
                Inquiry Details
              </h4>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Name
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedInquiry.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Email
                </p>
                <p className="text-sm text-gray-700">{selectedInquiry.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Message
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Date
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase text-right">
                    Status
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedInquiry.status === "resolved"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {selectedInquiry.status || "new"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 hover:bg-gray-50 text-sm font-bold"
              >
                Close
              </button>
              {selectedInquiry.status !== "resolved" && (
                <button
                  onClick={() => {
                    onResolve(selectedInquiry._id);
                    setSelectedInquiry(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 text-sm font-bold"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AnalyticsView = ({ stats }) => {
  const data = [
    {
      name: "Users",
      value: stats?.totalUsers || 0,
      color: "#3B82F6",
      icon: Users,
    },
    {
      name: "Jobs",
      value: stats?.totalJobs || 0,
      color: "#10B981",
      icon: Briefcase,
    },
    {
      name: "Apps",
      value: stats?.totalApplications || 0,
      color: "#F59E0B",
      icon: FileText,
    },
    {
      name: "Inquiries",
      value: stats?.totalInquiries || 0,
      color: "#8B5CF6",
      icon: MessageSquare,
    },
  ];

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Platform Analytics
            </h3>
            <p className="text-gray-500 text-sm">Activity metrics</p>
          </div>
          <div className="flex space-x-1">
            {["7D", "1M", "3M", "1Y"].map((t) => (
              <button
                key={t}
                className={`px-3 py-1 rounded text-xs font-bold ${t === "1M" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map((item) => (
            <div key={item.name} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <item.icon
                    className="h-4 w-4"
                    style={{ color: item.color }}
                  />
                  <span className="font-bold text-gray-700 text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {item.value}
                </span>
              </div>

              <div className="h-24 flex items-end bg-gray-50 p-2">
                <div
                  className="w-full"
                  style={{
                    backgroundColor: item.color,
                    height: `${(item.value / maxValue) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-green-500">+12.5%</span>
                <span className="text-gray-400 uppercase">Growth</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Avg. Daily Users", value: "1.2k" },
          { label: "Conversion Rate", value: "4.8%" },
          { label: "Retention Rate", value: "82%" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white p-6 shadow-sm border border-gray-200"
          >
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <h4 className="text-2xl font-bold text-gray-900">{card.value}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};
