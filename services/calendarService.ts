import { supabase } from './supabaseClient';
import { CalendarEvent, CreateEventRequest, EventReminder } from '../types';

// ============================================================================
// CALENDAR EVENTS
// ============================================================================

/**
 * Fetch all calendar events within a date range
 */
export async function getCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      opportunity:opportunities(*),
      application:applications(*)
    `)
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }

  return data as CalendarEvent[];
}

/**
 * Fetch all events (no date filter) - useful for overview
 */
export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      opportunity:opportunities(*),
      application:applications(*)
    `)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching all calendar events:', error);
    throw error;
  }

  return data as CalendarEvent[];
}

/**
 * Fetch events for today
 */
export async function getTodaysEvents(): Promise<CalendarEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getCalendarEvents(today, tomorrow);
}

/**
 * Fetch upcoming events (next 7 days)
 */
export async function getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
  const today = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return getCalendarEvents(today, future);
}

/**
 * Create a new calendar event (Placement Officer only)
 */
export async function createCalendarEvent(
  eventData: CreateEventRequest
): Promise<CalendarEvent> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      ...eventData,
      created_by: userData.user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }

  return data as CalendarEvent;
}

/**
 * Update a calendar event (Placement Officer only)
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CreateEventRequest>
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }

  return data as CalendarEvent;
}

/**
 * Delete a calendar event (Placement Officer only)
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

/**
 * Get a single event by ID
 */
export async function getEventById(eventId: string): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      opportunity:opportunities(*),
      application:applications(*)
    `)
    .eq('id', eventId)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data as CalendarEvent;
}

// ============================================================================
// EVENT REMINDERS
// ============================================================================

/**
 * Get reminders for current user
 */
export async function getUserReminders(): Promise<EventReminder[]> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('event_reminders')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('reminder_time', { ascending: true });

  if (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }

  return data as EventReminder[];
}

/**
 * Create a reminder for an event
 */
export async function createReminder(
  eventId: string,
  reminderTime: Date
): Promise<EventReminder> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('event_reminders')
    .insert({
      event_id: eventId,
      user_id: userData.user.id,
      reminder_time: reminderTime.toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }

  return data as EventReminder;
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('event_reminders')
    .delete()
    .eq('id', reminderId);

  if (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
}

/**
 * Export calendar events to iCal format
 */
export function exportToICal(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Why-Not Placement//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 3600000); // 1 hour default
    
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@why-not-placement.app`,
      `DTSTAMP:${formatICalDate(new Date())}`,
      `DTSTART:${formatICalDate(startDate)}`,
      `DTEND:${formatICalDate(endDate)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description}` : '',
      `CATEGORIES:${event.event_type}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.filter(line => line).join('\r\n');
}

/**
 * Format date for iCal format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate downloadable iCal file
 */
export function downloadICalFile(events: CalendarEvent[], filename: string = 'calendar.ics'): void {
  const icalData = exportToICal(events);
  const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
