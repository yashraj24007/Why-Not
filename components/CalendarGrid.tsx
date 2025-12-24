import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CalendarEvent, EventType } from '../types';

interface CalendarGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ events, onEventClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  // Get event color based on type
  const getEventColor = (type: EventType): string => {
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

  // Get event icon based on type
  const getEventIcon = (type: EventType): string => {
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

  // Generate calendar days for month view
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Navigation
  const goToPrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date header
  const dateHeader = useMemo(() => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }, [view, currentDate, weekDays]);

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold min-w-[250px] text-center">{dateHeader}</h2>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Today
          </button>
          
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'month'
                  ? 'bg-neon-blue text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'week'
                  ? 'bg-neon-blue text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <div className="flex-1 overflow-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayEvents = getEventsForDate(date);
              const isTodayDate = isToday(date);

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => onDateClick?.(date)}
                  className={`aspect-square p-2 rounded-lg border cursor-pointer transition-all hover:border-neon-blue/50 ${
                    isTodayDate
                      ? 'bg-neon-blue/10 border-neon-blue'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isTodayDate ? 'text-neon-blue' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={`text-xs p-1 rounded border cursor-pointer truncate ${getEventColor(event.event_type)}`}
                      >
                        {getEventIcon(event.event_type)} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-400 text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="flex-1 overflow-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((date, index) => {
              const isTodayDate = isToday(date);
              return (
                <div
                  key={date.toISOString()}
                  className={`text-center py-3 rounded-lg ${
                    isTodayDate ? 'bg-neon-blue/10 border border-neon-blue' : 'bg-white/5'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-xl font-bold ${isTodayDate ? 'text-neon-blue' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events for each day */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const dayEvents = getEventsForDate(date);
              
              return (
                <div key={date.toISOString()} className="space-y-2">
                  {dayEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => onEventClick(event)}
                      className={`p-3 rounded-lg border cursor-pointer hover:scale-105 transition-all ${getEventColor(
                        event.event_type
                      )}`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-lg">{getEventIcon(event.event_type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{event.title}</div>
                          <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.start_date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-xs opacity-75 line-clamp-2 mt-1">{event.description}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
