import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const ExperienceForm = ({ experience, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false,
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || '',
        company: experience.company || '',
        location: experience.location || '',
        startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
        endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
        description: experience.description || '',
        current: experience.current || false,
      });
    }
  }, [experience]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{experience ? 'Edit Experience' : 'Add New Experience'}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-1">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Software Engineer"
            required
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-bold text-slate-700 mb-1">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Google"
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-bold text-slate-700 mb-1">Location (Optional)</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-bold text-slate-700 mb-1">End Date (or check 'Current')</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input-field"
              disabled={formData.current}
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="current"
            name="current"
            checked={formData.current}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
          />
          <label htmlFor="current" className="ml-2 block text-sm text-slate-900">I currently work here</label>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
            placeholder="Key responsibilities, achievements, etc."
          ></textarea>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center"
            disabled={loading}
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {experience ? 'Update Experience' : 'Add Experience'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExperienceForm;