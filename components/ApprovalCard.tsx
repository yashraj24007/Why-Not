import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { sendNotification } from '../services/notificationService';

interface ApprovalCardProps {
  application: any;
  onApprovalComplete: () => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ application, onApprovalComplete }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          mentor_approved: true,
          status: 'APPLIED' // Move to applied status after mentor approval
        })
        .eq('id', application.id);

      if (error) throw error;

      // Send notification to student
      await sendNotification({
        userId: application.student_id,
        title: 'Application Approved',
        message: `Your mentor has approved your application for ${application.opportunity.title}`,
        type: 'profile_update',
        relatedId: application.id
      });

      showToast('success', 'Application approved');
      onApprovalComplete();
    } catch (error) {
      console.error('Error approving:', error);
      showToast('error', 'Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      showToast('warning', 'Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          mentor_approved: false,
          status: 'REJECTED',
          rejection_reason: `Mentor feedback: ${comment}`
        })
        .eq('id', application.id);

      if (error) throw error;

      // Send notification to student
      await sendNotification({
        userId: application.student_id,
        title: 'Application Not Approved',
        message: `Your mentor has provided feedback on your application for ${application.opportunity.title}`,
        type: 'profile_update',
        relatedId: application.id
      });

      showToast('success', 'Feedback sent to student');
      onApprovalComplete();
    } catch (error) {
      console.error('Error rejecting:', error);
      showToast('error', 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{application.student.name}</h3>
          <p className="text-sm text-slate-400">{application.student.email}</p>
          <p className="text-sm text-slate-500">{application.student.department}</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-sm">
          Pending Review
        </span>
      </div>

      {/* Opportunity Details */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
        <h4 className="font-medium mb-2">{application.opportunity.title}</h4>
        <div className="flex gap-4 text-sm text-slate-400">
          <span>Company: {application.opportunity.company_name}</span>
          <span>Type: {application.opportunity.type}</span>
        </div>
      </div>

      {/* Cover Letter */}
      {application.cover_letter && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2 text-slate-400">Cover Letter:</p>
          <p className="text-sm text-slate-300 bg-slate-800/30 p-3 rounded-lg">
            {application.cover_letter}
          </p>
        </div>
      )}

      {/* Applied Date */}
      <p className="text-sm text-slate-500 mb-4">
        Applied: {new Date(application.created_at).toLocaleDateString()}
      </p>

      {/* Comment Box (for rejection) */}
      {showCommentBox && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Feedback for Student <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Provide constructive feedback to help the student improve..."
            rows={3}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors resize-none"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!showCommentBox ? (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={() => setShowCommentBox(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <MessageSquare size={18} />
              Provide Feedback
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setShowCommentBox(false);
                setComment('');
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ApprovalCard;
