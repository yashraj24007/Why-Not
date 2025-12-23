import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Book, Award, FileText, Edit, MapPin, Calendar, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PageTransition from '../components/PageTransition';
import ResumeUpload from '../components/ResumeUpload';
import { supabase } from '../services/supabaseClient';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    cgpa: user?.cgpa || 0,
    major: user?.major || '',
    year: user?.year || 0,
    semester: user?.semester || 0
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          department: formData.department
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // Update student_profiles table
      const { error: studentError } = await supabase
        .from('student_profiles')
        .update({
          cgpa: formData.cgpa,
          major: formData.major,
          year: formData.year,
          semester: formData.semester
        })
        .eq('id', user!.id);

      if (studentError) throw studentError;

      await refreshUser();
      showToast('success', 'Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || '',
      cgpa: user?.cgpa || 0,
      major: user?.major || '',
      year: user?.year || 0,
      semester: user?.semester || 0
    });
    setEditMode(false);
  };

  const handleResumeUpload = async (url: string) => {
    await refreshUser();
  };

  const handleResumeDelete = async () => {
    await refreshUser();
  };

  if (!user) return null;

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-4xl mx-auto min-h-screen">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-slate-400">Manage your personal and academic information.</p>
          </div>
          {!editMode ? (
            <button 
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                <X size={16} />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue text-black hover:bg-neon-blue/80 transition-colors text-sm font-medium disabled:opacity-50">
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-8">
          {/* Header Card */}
          <div className="glass-panel p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple p-[2px]">
              <div className="w-full h-full rounded-full bg-black overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              {editMode ? (
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="text-3xl font-bold mb-2 bg-white/5 border border-white/10 rounded px-3 py-1 w-full md:w-auto"
                />
              ) : (
                <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  {user.email}
                </div>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Phone number"
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-32"
                    />
                  </div>
                ) : user.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    {user.phone}
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <User size={16} />
                  {user.role}
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {user.skills?.map((skill: any, index: number) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20 text-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Academic Info */}
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Book className="text-neon-purple" />
                Academic Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">Department</span>
                  {editMode ? (
                    <input 
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="font-medium bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-40 text-right"
                    />
                  ) : (
                    <span className="font-medium">{user.department || 'Not set'}</span>
                  )}
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">Year / Semester</span>
                  {editMode ? (
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        min="1"
                        max="5"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        className="font-medium bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-16 text-right"
                      />
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                        className="font-medium bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-16 text-right"
                      />
                    </div>
                  ) : (
                    <span className="font-medium">{user.year ? `${user.year} Year` : '-'} / {user.semester ? `Sem ${user.semester}` : '-'}</span>
                  )}
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">CGPA</span>
                  {editMode ? (
                    <input 
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({...formData, cgpa: parseFloat(e.target.value)})}
                      className="font-bold text-emerald-400 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-20 text-right"
                    />
                  ) : (
                    <span className="font-bold text-emerald-400">{user.cgpa || 'Not set'}</span>
                  )}
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">College ID</span>
                  <span className="font-medium">{user.id.substring(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Preferences & Resume */}
            <div className="space-y-8">
              <div className="glass-panel p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Award className="text-amber-400" />
                  Preferences
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">Preferred Roles</span>
                    <span className="font-medium text-right">{user.preferences?.roles?.join(', ') || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">Preferred Locations</span>
                    <span className="font-medium text-right">{user.preferences?.locations?.join(', ') || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">Expected Stipend</span>
                    <span className="font-medium">₹{user.preferences?.minStipend?.toLocaleString() || 0}+</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="text-rose-400" />
                  Resume
                </h3>
                
                <ResumeUpload 
                  userId={user.id}
                  currentResumeUrl={user.resume_url}
                  onUploadComplete={handleResumeUpload}
                  onDelete={handleResumeDelete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;