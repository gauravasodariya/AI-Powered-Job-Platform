import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Briefcase, FileText, Save, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';

import ResumeUpload from '../components/profile/ResumeUpload';
import EducationList from '../components/profile/EducationList';
import EducationForm from '../components/profile/EducationForm';
import ExperienceList from '../components/profile/ExperienceList';
import ExperienceForm from '../components/profile/ExperienceForm';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    location: '',
    skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  const fetchEducation = useCallback(async () => {
    try {
      const res = await axios.get('/profile/education');
      setEducation(res.data.data);
    } catch (err) {
      console.error('Error fetching education:', err);
    }
  }, []);

  const fetchExperience = useCallback(async () => {
    try {
      const res = await axios.get('/profile/experience');
      setExperience(res.data.data);
    } catch (err) {
      console.error('Error fetching experience:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        title: user.profile?.title || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        skills: user.profile?.skills?.join(', ') || '',
      });
      fetchEducation();
      fetchExperience();
    }
  }, [user, fetchEducation, fetchExperience]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    try {
      await axios.put('/auth/updateprofile', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Education Handlers
  const handleAddEducation = async (eduData) => {
    setLoading(true);
    try {
      if (editingEducation) {
        await axios.put(`/profile/education/${editingEducation._id}`, eduData);
      } else {
        await axios.post('/profile/education', eduData);
      }
      fetchEducation();
      setShowEducationForm(false);
      setEditingEducation(null);
    } catch (err) {
      console.error('Error saving education:', err);
      setError(err.response?.data?.message || 'Failed to save education');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEducation = (edu) => {
    setEditingEducation(edu);
    setShowEducationForm(true);
  };

  const handleDeleteEducation = async (id) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      try {
        await axios.delete(`/profile/education/${id}`);
        fetchEducation();
      } catch (err) {
        console.error('Error deleting education:', err);
        setError(err.response?.data?.message || 'Failed to delete education');
      }
    }
  };

  // Experience Handlers
  const handleAddExperience = async (expData) => {
    setLoading(true);
    try {
      if (editingExperience) {
        await axios.put(`/profile/experience/${editingExperience._id}`, expData);
      } else {
        await axios.post('/profile/experience', expData);
      }
      fetchExperience();
      setShowExperienceForm(false);
      setEditingExperience(null);
    } catch (err) {
      console.error('Error saving experience:', err);
      setError(err.response?.data?.message || 'Failed to save experience');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExperience = (exp) => {
    setEditingExperience(exp);
    setShowExperienceForm(true);
  };

  const handleDeleteExperience = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience entry?')) {
      try {
        await axios.delete(`/profile/experience/${id}`);
        fetchExperience();
      } catch (err) {
        console.error('Error deleting experience:', err);
        setError(err.response?.data?.message || 'Failed to delete experience');
      }
    }
  };

  if (authLoading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary-600 h-32 relative"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="h-32 w-32 bg-white rounded-[10px] p-1 shadow-sm border border-slate-200 flex items-center justify-center text-primary-600">
              <User className="h-16 w-16" />
            </div>
            <div className="mt-4">
              <h1 className="text-3xl font-extrabold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 font-medium capitalize">{user?.role}</p>
            </div>
          </div>

          {success && (
            <div className="mb-8 flex items-center bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">
              <CheckCircle className="h-5 w-5 mr-3" />
              <span className="font-medium">Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-8 flex items-center bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
              <AlertCircle className="h-5 w-5 mr-3" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-[10px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Professional Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-[10px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. San Francisco, CA"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-[10px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Skills (comma-separated)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="skills"
                    placeholder="React, Node.js, AWS..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-[10px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                rows="4"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[10px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-8 py-3 rounded-[10px] font-bold hover:bg-primary-700 transition-all shadow-sm flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Resume Upload */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume</h2>
            <ResumeUpload />
          </div>

          {/* Education Section */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Education</h2>
              <button
                onClick={() => { setShowEducationForm(true); setEditingEducation(null); }}
                className="btn-primary flex items-center"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Education
              </button>
            </div>
            {showEducationForm && (
              <EducationForm
                education={editingEducation}
                onSubmit={handleAddEducation}
                onCancel={() => { setShowEducationForm(false); setEditingEducation(null); }}
                loading={loading}
              />
            )}
            <EducationList education={education} onEdit={handleEditEducation} onDelete={handleDeleteEducation} />
          </div>

          {/* Experience Section */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
              <button
                onClick={() => { setShowExperienceForm(true); setEditingExperience(null); }}
                className="btn-primary flex items-center"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Experience
              </button>
            </div>
            {showExperienceForm && (
              <ExperienceForm
                experience={editingExperience}
                onSubmit={handleAddExperience}
                onCancel={() => { setShowExperienceForm(false); setEditingExperience(null); }}
                loading={loading}
              />
            )}
            <ExperienceList experience={experience} onEdit={handleEditExperience} onDelete={handleDeleteExperience} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
