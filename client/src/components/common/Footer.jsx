import React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-[10px] shadow-sm">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 tracking-tight">
                  AI JobHub
                </p>
                <p className="text-sm text-slate-500">
                  Professional AI hiring platform
                </p>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Empowering careers through AI-driven matching. Find the perfect
              job or the ideal candidate with precision and ease.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="p-2 bg-slate-50 rounded-[10px] text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-50 rounded-[10px] text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/jobs"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Join as Seeker
                </Link>
              </li>
              <li>
                <Link
                  to="/register?role=recruiter"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Join as Recruiter
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  AI Matching Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-primary-600 text-sm transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                <span className="text-slate-500 text-sm">
                  Gandhinagar, Gujarat
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                <span className="text-slate-500 text-sm">
                  aipoweredjobplatform@gmail.com
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500 shrink-0" />
                <span className="text-slate-500 text-sm">+91 8799300210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} AI JobHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
