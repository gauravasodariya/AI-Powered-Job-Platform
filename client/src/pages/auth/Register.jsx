import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "seeker",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await googleLogin(credentialResponse.credential);
      setSuccess("Google Registration successful! Redirecting...");
      setTimeout(() => {
        if (res.user.role === "recruiter") {
          navigate("/recruiter-dashboard");
        } else {
          navigate("/seeker-dashboard");
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    setLoading(true);
    try {
      await register(formData);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      let message = "Something went wrong. Please try again.";

      if (err.response) {
        message = err.response.data?.message || `Error: ${err.response.status}`;
      } else if (err.request) {
        message = "Server is not responding. Please check your connection.";
      } else {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[10px] shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="bg-primary-600 py-8 px-10 text-center flex flex-col items-center">
            <h2 className="text-3xl font-black text-white">Create Account</h2>
            <p className="text-primary-100 mt-2 text-sm font-medium">
              Join SmartHire and access our AI-powered platform.
            </p>
          </div>

          <div className="p-8 md:p-10 pt-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-slate-700 ml-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-700 ml-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-700 ml-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="role"
                  className="block text-sm font-bold text-slate-700 ml-1"
                >
                  I want to
                </label>
                <select
                  id="role"
                  name="role"
                  className="input-field appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="seeker">Find a Job (Job Seeker)</option>
                  <option value="recruiter">Hire Talent (Recruiter)</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Register"
                )}
              </motion.button>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-6">
              <div className="w-full flex items-center justify-center space-x-2">
                <div className="h-px bg-slate-200 flex-grow"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-2">
                  Or continue with
                </span>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>

              {googleClientId ? (
                <div className="w-full flex justify-center google-login-container">
                  <div style={{ width: "100%" }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google Login Failed")}
                      theme="outline"
                      shape="rectangular"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-medium text-center">
                  Google sign-in is currently unavailable.
                </p>
              )}
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-bold underline underline-offset-4 transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;
