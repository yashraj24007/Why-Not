import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, FileText, Tag, Trash2, Save } from 'lucide-react';
import { CalendarEvent, CreateEventRequest, EventType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useResponsive } from '../../hooks/useResponsive';
import { disableBodyScroll, enableBodyScroll } from '../../utils/mobileOptimization';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  selectedDate?: Date;
  onSave: (eventData: CreateEventRequest) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isMobile } = useResponsive();
  const isPlacementOfficer = user?.role === 'PLACEMENT_OFFICER';
  const isEditMode = !!event;
  const isReadOnly = !isPlacementOfficer;
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>(EventType.ANNOUNCEMENT);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Focus management and keyboard support
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
      if (isMobile) {
        disableBodyScroll();
      } else {
        document.body.style.overflow = 'hidden';
      }

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);

      return () => {
        document.removeEventListener('keydown', handleEsc);
        if (isMobile) {
          enableBodyScroll();
        } else {
          document.body.style.overflow = 'unset';
        }
      };
    }
  }, [isOpen, onClose, isMobile]);

  // Initialize form with event data or selected date
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setEventType(event.event_type);

      const start = new Date(event.start_date);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().substring(0, 5));

      if (event.end_date) {
        const end = new Date(event.end_date);
        setEndDate(end.toISOString().split('T')[0]);
        setEndTime(end.toTimeString().substring(0, 5));
      }
    } else if (selectedDate) {
      setStartDate(selectedDate.toISOString().split('T')[0]);
      setStartTime('09:00');
    } else {
      const now = new Date();
      setStartDate(now.toISOString().split('T')[0]);
      setStartTime('09:00');
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPlacementOfficer) {
      showToast('error', 'Only placement officers can create/edit events');
      return;
    }

    if (!title.trim()) {
      showToast('error', 'Event title is required');
      return;
    }

    try {
      setLoading(true);

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`) : undefined;

      const eventData: CreateEventRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        event_type: eventType,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime?.toISOString(),
      };

      await onSave(eventData);
      showToast(
        'success',
        isEditMode ? 'Event updated successfully' : 'Event created successfully'
      );
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      showToast('error', 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setLoading(true);
      await onDelete(event.id);
      showToast('success', 'Event deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('error', 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: EventType): string => {
    switch (type) {
      case EventType.DEADLINE:
        return 'bg-rose-500/20 border-rose-500 text-rose-400';
      case EventType.INTERVIEW:
        return 'bg-neon-purple/20 border-neon-purple text-neon-purple';
      case EventType.DRIVE:
        return 'bg-neon-purple/20 border-neon-purple text-neon-purple';
      case EventType.ANNOUNCEMENT:
        return 'bg-amber-500/20 border-amber-500 text-amber-400';
      default:
        return 'bg-slate-500/20 border-slate-500 text-slate-400';
    }
  };

  const getEventTypeIcon = (type: EventType): string => {
    switch (type) {
      case EventType.DEADLINE:
        return '⏰';
      case EventType.INTERVIEW:
        return '🎯';
      case EventType.DRIVE:
        return '🚀';
      case EventType.ANNOUNCEMENT:
        return '📢';
      default:
        return '📅';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? '100%' : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? '100%' : 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 flex items-center justify-center ${isMobile ? 'inset-0' : 'inset-0 p-4'}`}
            onClick={e => e.target === e.currentTarget && onClose()}
          >
            <div
              className={`relative w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-2xl overflow-y-auto ${
                isMobile ? 'h-full max-w-none rounded-none' : 'max-w-2xl rounded-2xl max-h-[90vh]'
              }`}
            >
              {/* Header */}
              <div
                className={`sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 flex items-center justify-between ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <h2
                  className={`font-bold flex items-center gap-3 ${isMobile ? 'text-lg' : 'text-2xl'}`}
                >
                  <Calendar className={`text-neon-purple ${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`} />
                  {isReadOnly ? 'Event Details' : isEditMode ? 'Edit Event' : 'Create Event'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.values(EventType).map(type => (
                      <button
                        key={type}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setEventType(type)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          eventType === type
                            ? getEventTypeColor(type)
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <div className="text-2xl mb-1">{getEventTypeIcon(type)}</div>
                        <div className="text-xs font-medium capitalize">{type.toLowerCase()}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="e.g., Application Deadline - Google"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple transition-colors disabled:opacity-60"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Add event details, location, or instructions..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple transition-colors resize-none disabled:opacity-60"
                  />
                </div>

                {/* Start Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple transition-colors disabled:opacity-60"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple transition-colors disabled:opacity-60"
                      required
                    />
                  </div>
                </div>

                {/* End Date & Time (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      End Date <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple transition-colors disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      End Time <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple transition-colors disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {!isReadOnly && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
                    </button>

                    {isEditMode && onDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-6 py-3 bg-rose-500/20 text-rose-400 border border-rose-500 rounded-lg font-semibold hover:bg-rose-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete
                      </button>
                    )}
                  </div>
                )}

                {isReadOnly && (
                  <div className="text-center text-sm text-slate-400 bg-white/5 border border-white/10 rounded-lg p-4">
                    📋 Read-only view. Only placement officers can create or edit events.
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventModal;
