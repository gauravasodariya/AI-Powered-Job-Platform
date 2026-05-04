import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dashboardPath = useMemo(() => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin-dashboard";
    if (user.role === "recruiter") return "/recruiter-dashboard";
    return "/seeker-dashboard";
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const baseNavItems = [
    { label: "Home", to: "/" },
    { label: "Jobs", to: "/jobs" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const authNavItems = user
    ? [
        { label: "Dashboard", to: dashboardPath },
        { label: "Profile", to: "/profile" },
      ]
    : [
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
      ];

  const navClassName = (to) =>
    `px-3 py-2 text-sm font-semibold transition-colors border-b-3 ${
      location.pathname === to
        ? "text-slate-900 border-primary-600"
        : "text-slate-600 border-transparent hover:text-slate-900 hover:border-primary-300"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link to="/" className="flex items-center space-x-3 shrink-0">
              <div className="h-10 w-auto">
                <img src="/SmartHire logo.jpg" alt="SmartHire" className="h-full object-contain rounded-lg shadow-sm" style={{ width: 40, height: 40 }} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 tracking-tighter">
                  SmartHire
                </p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  AI-powered hiring
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 justify-center items-center">
            <div className="flex items-center space-x-1">
              {[...baseNavItems, ...authNavItems].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={navClassName(item.to)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center min-w-0">
            {user ? (
              <>
                <div className="ml-3 pl-3 border-l border-slate-200 text-right">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {user.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:text-red-600 hover:border-red-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>

          <div className="lg:hidden flex items-center">
            {user ? (
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {user.role}
                </p>
              </div>
            ) : (
              <Link to="/login" className={navClassName("/login")}>
                Login
              </Link>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 space-y-2">
            {user && (
              <div className="px-3 py-2 border-b border-slate-200 mb-2">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                  {user.role}
                </p>
              </div>
            )}
            {[...baseNavItems, ...authNavItems].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`${navClassName(item.to)} block`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:text-red-600 hover:border-red-300 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
