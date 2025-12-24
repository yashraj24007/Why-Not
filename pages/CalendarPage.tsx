import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Download, AlertCircle, Sparkles, Clock } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';
import EventModal from '../components/EventModal';
import { CalendarEvent, CreateEventRequest, EventType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getAllCalendarEvents,
  getTodaysEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  downloadICalFile
} from '../services/calendarService';

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isPlacementOfficer = user?.role === 'PLACEMENT_OFFICER';

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Load events
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const [allEvents, todayEvents] = await Promise.all([
        getAllCalendarEvents(),
        getTodaysEvents()
      ]);
      setEvents(allEvents);
      setTodaysEvents(todayEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      showToast('error', 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setShowEventModal(true);
  };

  const handleDateClick = (date: Date) => {
    if (isPlacementOfficer) {
      setSelectedEvent(null);
      setSelectedDate(date);
      setShowEventModal(true);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(new Date());
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData: CreateEventRequest) => {
    try {
      if (selectedEvent) {
        // Update existing event
        await updateCalendarEvent(selectedEvent.id, eventData);
      } else {
        // Create new event
        await createCalendarEvent(eventData);
      }
      await loadEvents();
    } catch (error) {
      throw error; // Let EventModal handle the error
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendarEvent(eventId);
      await loadEvents();
    } catch (error) {
      throw error; // Let EventModal handle the error
    }
  };

  const handleExportCalendar = () => {
    try {
      downloadICalFile(events, 'why-not-calendar.ics');
      showToast('success', 'Calendar exported successfully');
    } catch (error) {
      console.error('Error exporting calendar:', error);
      showToast('error', 'Failed to export calendar');
    }
  };

  const getEventTypeColor = (type: EventType): string => {
    switch (type) {
      case EventType.DEADLINE:
        return 'bg-rose-500/20 border-rose-500 text-rose-400';
      case EventType.INTERVIEW:
        return 'bg-neon-blue/20 border-neon-blue text-neon-blue';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-slate-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <CalendarIcon className="w-10 h-10 text-neon-blue" />
                Calendar
              </h1>
              <p className="text-slate-400">
                {isPlacementOfficer
                  ? 'Manage application deadlines, interviews, and campus drives'
                  : 'Track important dates, deadlines, and upcoming events'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportCalendar}
                className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2 font-medium"
              >
                <Download className="w-5 h-5" />
                Export
              </button>

              {isPlacementOfficer && (
                <button
                  onClick={handleCreateEvent}
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-105 transition-transform flex items-center gap-2 font-semibold shadow-lg shadow-neon-blue/30"
                >
                  <Plus className="w-5 h-5" />
                  Create Event
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Today's Events Highlight */}
        {todaysEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/5 border-2 border-neon-blue/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-neon-blue" />
              <h2 className="text-xl font-bold">Today's Events</h2>
              <span className="px-3 py-1 rounded-full bg-neon-blue/20 text-neon-blue text-sm font-semibold">
                {todaysEvents.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todaysEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all ${getEventTypeColor(
                    event.event_type
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold mb-1 truncate">{event.title}</div>
                      <div className="flex items-center gap-2 text-sm opacity-75">
                        <Clock className="w-4 h-4" />
                        {new Date(event.start_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                      {event.description && (
                        <p className="text-xs opacity-75 mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Info for Students */}
        {!isPlacementOfficer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-neon-blue mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Student View:</span> Click on any event to view
                details. Only placement officers can create or edit events.
              </p>
            </div>
          </motion.div>
        )}

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 p-6 shadow-2xl"
        >
          {events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarIcon className="w-20 h-20 text-slate-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No Events Yet</h3>
              <p className="text-slate-400 mb-6">
                {isPlacementOfficer
                  ? 'Create your first event to help students track important dates'
                  : 'No events have been scheduled yet'}
              </p>
              {isPlacementOfficer && (
                <button
                  onClick={handleCreateEvent}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-105 transition-transform font-semibold"
                >
                  Create First Event
                </button>
              )}
            </div>
          ) : (
            <CalendarGrid
              events={events}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
        </motion.div>

        {/* Event Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-sm font-semibold mb-4 text-slate-400">EVENT TYPES</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(EventType).map((type) => (
              <div key={type} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${getEventTypeColor(type)}`}>
                  <span className="text-xl">{getEventTypeIcon(type)}</span>
                </div>
                <div>
                  <div className="font-medium capitalize text-sm">{type.toLowerCase()}</div>
                  <div className="text-xs text-slate-400">
                    {type === EventType.DEADLINE && 'Application ends'}
                    {type === EventType.INTERVIEW && 'Interview scheduled'}
                    {type === EventType.DRIVE && 'Campus recruitment'}
                    {type === EventType.ANNOUNCEMENT && 'Important update'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setSelectedDate(undefined);
        }}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default CalendarPage;
