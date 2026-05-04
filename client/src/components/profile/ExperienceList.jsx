import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, Briefcase } from 'lucide-react';

const ExperienceList = ({ experience, onEdit, onDelete }) => {
  if (!experience || experience.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Briefcase className="h-12 w-12 mx-auto mb-4" />
        <p>No experience entries yet. Add your work history!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {experience.map((exp) => (
        <div key={exp._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
          <div className="flex-shrink-0 bg-blue-50 text-blue-600 p-3 rounded-lg">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
            <p className="text-slate-700 font-medium">{exp.company} {exp.location && `(${exp.location})`}</p>
            <p className="text-slate-500 text-sm mt-1">
              {format(new Date(exp.startDate), 'MMM yyyy')} - {exp.current ? 'Present' : format(new Date(exp.endDate), 'MMM yyyy')}
            </p>
            {exp.description && <p className="text-slate-600 mt-2 text-sm">{exp.description}</p>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(exp)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
              title="Edit Experience"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(exp._id)}
              className="p-2 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
              title="Delete Experience"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceList;