import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [editedSkills, setEditedSkills] = useState([]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get('/resumes/me');
        if (res.data.data.resumeUrl) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchResume();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadData = res.data.data;
      setData(uploadData);
      
      if (uploadData.aiParsed && uploadData.extractedSkills?.length > 0) {
        setEditedSkills(uploadData.extractedSkills);
        setIsReviewing(true);
      } else {
        setSuccess('Resume uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSkills = async () => {
    setLoading(true);
    try {
      await axios.put('/auth/updateprofile', {
        profile: {
          skills: editedSkills
        }
      });
      setSuccess('Profile skills updated successfully!');
      setIsReviewing(false);
      // Update local data to reflect confirmed skills
      setData({ ...data, skills: editedSkills });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...editedSkills];
    newSkills[index] = value;
    setEditedSkills(newSkills);
  };

  const removeSkill = (index) => {
    setEditedSkills(editedSkills.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    setEditedSkills([...editedSkills, '']);
  };

  const getResumeName = () => {
    if (file?.name) return file.name;
    if (data?.resumeKey) {
      const keyParts = data.resumeKey.split('/');
      return keyParts[keyParts.length - 1];
    }
    return 'Uploaded Resume.pdf';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Review Modal */}
      {isReviewing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Review Extracted Skills</h3>
                <p className="text-sm text-slate-500 font-medium">We found these skills in your resume. Edit or confirm them.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {editedSkills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100 group">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 p-1"
                    />
                    <button 
                      onClick={() => removeSkill(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={addSkill}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-primary-400 hover:text-primary-500 transition-all flex items-center justify-center space-x-2"
              >
                <span>+ Add another skill</span>
              </button>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-slate-50">
              <button
                onClick={() => setIsReviewing(false)}
                className="flex-1 py-4 px-6 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/50 active:scale-95"
              >
                Skip for now
              </button>
              <button
                onClick={handleConfirmSkills}
                disabled={loading}
                className="flex-1 py-4 px-6 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Confirm Skills</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Resume</h2>
        <p className="text-gray-500 mb-8">Upload your resume to get AI-powered job matches and skill analysis.</p>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-[10px] cursor-pointer transition-all ${
              file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-primary-500 mb-4" />
                    <p className="text-sm text-primary-600 font-medium">{file.name}</p>
                    <p className="text-xs text-primary-400 mt-1">Ready to upload</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF (MAX. 5MB)</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-[10px]">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-[10px]">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing with AI...' : 'Upload & Analyze'}
          </button>
        </form>

        {data?.resumeUrl && (
          <div className="mt-6 rounded-[10px] border border-primary-100 bg-primary-50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-[10px] bg-white text-primary-600 flex items-center justify-center shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Current Uploaded Resume</p>
                <p className="text-xs text-slate-500 break-all">{getResumeName()}</p>
              </div>
            </div>
            <a
              href={data.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-[10px] bg-white text-primary-600 border border-primary-100 font-semibold hover:bg-primary-100 transition-all"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Resume
            </a>
          </div>
        )}
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Skills Section */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900">Extracted Skills</h3>
              </div>
              {data.ats_score > 0 && (
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ATS Score</p>
                  <div className={`text-2xl font-black ${data.ats_score > 80 ? 'text-green-600' : data.ats_score > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {data.ats_score}%
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.extractedSkills || data.skills)?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full border border-primary-100"
                >
                  {skill}
                </span>
              ))}
              {!(data.extractedSkills || data.skills)?.length && <p className="text-gray-400 italic">No skills detected yet.</p>}
            </div>
          </div>

          {/* AI Feedback Section */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-8">
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-bold text-gray-900">AI Feedback</h3>
            </div>
            <ul className="space-y-4">
              {data.suggestions?.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3 text-sm text-gray-600">
                  <div className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-primary-500" />
                  <span>{suggestion}</span>
                </li>
              ))}
              {(!data.suggestions || data.suggestions.length === 0) && (
                <li className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Great resume! No major improvements suggested.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {data?.resumeUrl && (
        <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900">Resume Preview</h3>
          </div>
          <iframe
            src={`${data.resumeUrl}#toolbar=0`}
            title="Uploaded Resume Preview"
            className="w-full h-[70vh] rounded-[10px] border border-slate-200"
          />
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
