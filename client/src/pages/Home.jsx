import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  Users,
  Building2,
  Clock,
  Code,
  LineChart,
  Palette,
  ShieldCheck,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";
import axios from "axios";

const Home = () => {
  const [latestJobs, setLatestJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalCompanies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SmartHire | AI-Powered Job Platform";
    const fetchData = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          axios.get("/jobs?limit=6"),
          axios.get("/jobs/stats"),
        ]);
        setLatestJobs(jobsRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Simple Hero Section */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Find your next career move with SmartHire
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Browse {stats.totalJobs || "thousands"} of jobs from{" "}
            {stats.totalCompanies || "top"} companies.
          </p>

          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto relative mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                className="w-full pl-12 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-8 font-bold text-gray-600 font-medium">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary-600" />
              <span>{stats.totalJobs} Live Jobs</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-600" />
              <span>{stats.totalCompanies} Companies</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-600" />
              <span>{stats.totalApplications} Applications</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "Technology",
                icon: Code,
                count: "1.2k+",
                color: "bg-blue-50 text-blue-600",
              },
              {
                name: "Marketing",
                icon: LineChart,
                count: "800+",
                color: "bg-green-50 text-green-600",
              },
              {
                name: "Design",
                icon: Palette,
                count: "500+",
                color: "bg-purple-50 text-purple-600",
              },
              {
                name: "Management",
                icon: Briefcase,
                count: "400+",
                color: "bg-orange-50 text-orange-600",
              },
            ].map((cat, i) => (
              <Link
                key={i}
                to={`/jobs?industry=${cat.name}`}
                className="p-8 border border-gray-100 rounded-2xl hover:border-primary-200 hover:shadow-sm transition-all text-center group"
              >
                <div
                  className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {cat.count} Jobs
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between mb-10">
      <h2 className="text-2xl font-bold text-gray-900">
        Latest Job Openings
      </h2>
      <Link
        to="/jobs"
        className="text-primary-600 font-semibold flex items-center gap-1"
      >
        View all jobs <ArrowRight className="h-4 w-4" />
      </Link>
    </div>

    {loading ? (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-50 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    ) : (
      <div className="grid gap-4">
        {latestJobs.map((job) => (
          <Link
            key={job._id}
            to={`/jobs/${job._id}`}
            className="block p-6 bg-white border border-gray-100 rounded-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center text-primary-600 font-bold text-lg">
                  {job.company?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-gray-500 font-medium">
                    {job.company}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="text-gray-900 font-bold">
                  {job.salary || "Competitive"}
                </div>
                <div>
                  <ArrowRight className="h-5 w-5 text-primary-600" />
                </div>

              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
</section>

      {/* Core Features */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Why choose SmartHire?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We use advanced technology to make hiring simple, fair, and fast
              for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Smart Matching",
                desc: "Our neural networks analyze your actual skills and potential, not just keywords, to find the best fit.",
                icon: Sparkles,
                color: "text-primary-600",
                bg: "bg-primary-50",
              },
              {
                title: "Verified Opportunities",
                desc: "Every company and job posting is manually vetted to ensure a professional and safe environment.",
                icon: ShieldCheck,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                title: "Growth Focused",
                desc: "Get deep insights into skill gaps and personalized recommendations to accelerate your career.",
                icon: Award,
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all text-center"
              >
                <div
                  className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-8`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
