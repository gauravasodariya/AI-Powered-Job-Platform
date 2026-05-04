import React from 'react';
import { Sparkles, Target, Users, Shield, Eye, HeartHandshake, UserCircle } from 'lucide-react';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Aarav Sharma',
      role: 'CEO & Founder',
      description: 'Visionary leader passionate about connecting talent with opportunity through AI.'
    },
    {
      name: 'Ishaan Gupta',
      role: 'Chief Technology Officer',
      description: 'Drives innovation and develops cutting-edge AI matching algorithms.'
    },
    {
      name: 'Ananya Iyer',
      role: 'Head of Talent Acquisition',
      description: 'Ensures a seamless experience for recruiters and job seekers alike.'
    },
    {
      name: 'Rohan Verma',
      role: 'Lead AI Scientist',
      description: 'Specializes in machine learning and natural language processing for job matching.'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">About SmartHire</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Empowering Careers with AI
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            We're on a mission to revolutionize recruitment at SmartHire using cutting-edge AI technology.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-primary-600 rounded-lg p-3 inline-block">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Our Mission</h3>
              <p className="mt-2 text-gray-600">
                To bridge the gap between job seekers and recruiters through intelligent matching, reducing the time-to-hire and improving career alignment.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-blue-500 rounded-lg p-3 inline-block">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Our Vision</h3>
              <p className="mt-2 text-gray-600">
                To be the global leader in AI-powered recruitment, creating a future where every individual finds their ideal career path effortlessly.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-green-500 rounded-lg p-3 inline-block">
                <HeartHandshake className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Our Values</h3>
              <p className="mt-2 text-gray-600">
                Innovation, Integrity, Empathy, and Excellence. We believe in fair opportunities and continuous improvement for all.
              </p>
            </div>
          </div>
        </div>

        {/* Meet Our Team Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">Meet Our Team</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Behind AI JobHub is a dedicated team of innovators, engineers, and talent specialists.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                <div className="mx-auto h-32 w-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:bg-primary-50 transition-colors">
                  <UserCircle className="h-20 w-20 text-gray-300 group-hover:text-primary-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-primary-600 font-medium text-sm">{member.role}</p>
                <p className="mt-3 text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 bg-primary-900 rounded-3xl overflow-hidden">
          <div className="px-6 py-12 md:px-12 md:py-16 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to take the next step?
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-100 max-w-2xl mx-auto">
              Join thousands of professionals who are using AI JobHub to find their next career milestone.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <a
                href="/register"
                className="bg-white text-primary-900 hover:bg-primary-50 px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
              >
                Get Started
              </a>
              <a
                href="/contact"
                className="bg-primary-800 text-white hover:bg-primary-700 px-8 py-3 rounded-xl font-bold border border-primary-700 transition-all"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
