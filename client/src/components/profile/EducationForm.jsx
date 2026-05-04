import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const EducationForm = ({ education, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    if (education) {
      setFormData({
        institution: education.institution || '',
        degree: education.degree || '',
        fieldOfStudy: education.fieldOfStudy || '',
        startDate: education.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
        endDate: education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '',
        description: education.description || '',
      });
    }
  }, [education]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{education ? 'Edit Education' : 'Add New Education'}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="institution" className="block text-sm font-bold text-slate-700 mb-1">Institution</label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            className="input-field"
            placeholder="University Name"
            required
          />
        </div>
        <div>
          <label htmlFor="degree" className="block text-sm font-bold text-slate-700 mb-1">Degree</label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Bachelor's, Master's"
            required
          />
        </div>
        <div>
          <label htmlFor="fieldOfStudy" className="block text-sm font-bold text-slate-700 mb-1">Field of Study</label>
          <input
            type="text"
            id="fieldOfStudy"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Computer Science"
            required
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
            <label htmlFor="endDate" className="block text-sm font-bold text-slate-700 mb-1">End Date (or leave blank if ongoing)</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>
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
            placeholder="Relevant coursework, achievements, etc."
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
            {education ? 'Update Education' : 'Add Education'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationForm;