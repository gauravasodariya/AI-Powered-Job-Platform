import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, GraduationCap } from 'lucide-react';

const EducationList = ({ education, onEdit, onDelete }) => {
  if (!education || education.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <GraduationCap className="h-12 w-12 mx-auto mb-4" />
        <p>No education entries yet. Add your academic history!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {education.map((edu) => (
        <div key={edu._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
          <div className="flex-shrink-0 bg-primary-50 text-primary-600 p-3 rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h3>
            <p className="text-slate-700 font-medium">{edu.institution}</p>
            <p className="text-slate-500 text-sm mt-1">
              {format(new Date(edu.startDate), 'MMM yyyy')} - {edu.endDate ? format(new Date(edu.endDate), 'MMM yyyy') : 'Present'}
            </p>
            {edu.description && <p className="text-slate-600 mt-2 text-sm">{edu.description}</p>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(edu)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
              title="Edit Education"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(edu._id)}
              className="p-2 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
              title="Delete Education"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationList;