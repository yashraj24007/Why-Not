import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { notifyInterviewScheduled } from '../services/notificationService';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  studentId: string;
  studentName: string;
  opportunityTitle: string;
  onScheduled: () => void;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  studentId,
  studentName,
  opportunityTitle,
  onScheduled
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    mode: 'ONLINE' as 'ONLINE' | 'OFFLINE',
    location: '',
    meetingLink: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const interviewDateTime = new Date(`${formData.date}T${formData.time}`);

      // Update application with interview details
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'INTERVIEW_SCHEDULED',
          interview_date: interviewDateTime.toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Send notification to student
      await notifyInterviewScheduled(
        studentId,
        opportunityTitle,
        interviewDateTime.toISOString(),
        applicationId
      );

      showToast('success', 'Interview scheduled and student notified');
      onScheduled();
      onClose();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      showToast('error', 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-neon-blue" size={24} />
            <h2 className="text-2xl font-bold">Schedule Interview</h2>
          </div>
          <p className="text-slate-400">
            {studentName} • {opportunityTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Interview Mode <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="ONLINE"
                    checked={formData.mode === 'ONLINE'}
                    onChange={(e) => setFormData({ ...formData, mode: 'ONLINE' })}
                    className="text-neon-blue"
                  />
                  <span>Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="OFFLINE"
                    checked={formData.mode === 'OFFLINE'}
                    onChange={(e) => setFormData({ ...formData, mode: 'OFFLINE' })}
                    className="text-neon-blue"
                  />
                  <span>Offline</span>
                </label>
              </div>
            </div>

            {/* Meeting Link (for online) */}
            {formData.mode === 'ONLINE' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meeting Link <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required={formData.mode === 'ONLINE'}
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>
            )}

            {/* Location (for offline) */}
            {formData.mode === 'OFFLINE' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required={formData.mode === 'OFFLINE'}
                  placeholder="Room 301, Admin Block"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                rows={3}
                placeholder="Any special instructions or preparation required..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
