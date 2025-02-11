'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react';
import { 
  CalendarDays,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  BookOpen,
  GraduationCap,
  Trash2,
  FileText as TestIcon,
  Plus,
  Calendar as CalendarIcon,
  Download,
  Clock,
  Save
} from 'lucide-react'
import { motion } from 'framer-motion'
import { deleteDoc, doc, getFirestore, query, collection, where, onSnapshot,  } from 'firebase/firestore'
import { auth, db } from '../firebase/client'
import { onAuthStateChanged } from 'firebase/auth'

const DeleteEvent = ({ event, handleDeleteEvent, setStatus, onClose }) => (
  <button
    onClick={() => {
      handleDeleteEvent(event.id, setStatus, onClose);
    }}
    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
    type="button"
  >
    <Trash2 className="h-4 w-4" />
    <span className="sr-only">Delete event</span>
  </button>
);

const EventPopUp = ({ isOpen, onClose, event }) => {
  const [events, setEvents] = useState([])
  const router = useRouter();
  const [status, setStatus] = useState({ type: '', message: '' });
  const db = getFirestore();

  useEffect(() => {
    let eventsUnsubscribe = null;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Clean up existing subscription
      if (eventsUnsubscribe) {
        eventsUnsubscribe();
        eventsUnsubscribe = null;
      }

      if (!currentUser) {
        router.push('/login');
        // Clear events when user logs out
        setEvents([]);
        return;
      }

      // Only subscribe to events if user is logged in
      const q = query(
        collection(db, 'events'),
        where('userId', '==', currentUser.uid)
      );

      eventsUnsubscribe = onSnapshot(q, 
        (snapshot) => {
          const eventsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEvents(eventsList);
        },
        (error) => {
          console.error("Firestore subscription error:", error);
          setStatus({
            type: 'error',
            message: 'Failed to load events'
          });
          // If permission error occurs during subscription, clear events
          if (error.code === 'permission-denied') {
            setEvents([]);
          }
        }
      );
    });

    // Cleanup function
    return () => {
      if (eventsUnsubscribe) {
        eventsUnsubscribe();
      }
      unsubscribe();
    };
  }, [router, db]);

  if (!isOpen) return null;

  const generateGoogleCalendarLinks = (events) => {
    return events.map((event) => {
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        console.error(`Invalid date value: ${event}`);
        return '';
      }

      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 1);

      const details = `${event.type.toUpperCase()}: ${event.title}`;

      const googleUrl = new URL('https://calendar.google.com/calendar/render');
      googleUrl.searchParams.append('action', 'TEMPLATE');
      googleUrl.searchParams.append('text', details);
      googleUrl.searchParams.append('dates',
        `${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` +
        '/' +
        `${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
      );

      return googleUrl.toString();
    });
  };

  const handleDeleteEvent = async (id, setStatus, onClose) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      setStatus({
        type: 'success',
        message: 'Event deleted successfully!'
      });
      onClose(); // Close the popup after deleting the event
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to delete event'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg relative min-w-[300px] max-w-md">
        <span 
          className="absolute top-2 right-2 cursor-pointer text-2xl hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </span>
        <h2 className="text-xl font-bold mb-4">{event?.title}</h2>
        {event && (
          <div className="space-y-2">
            <p><span className="font-semibold">Date:</span> {event.date}</p>
            <p><span className="font-semibold">Description:</span> {event.description || "No description"}</p>
            <AddToGoogleCalendar events={[event]} generateGoogleCalendarLinks={generateGoogleCalendarLinks} />
            <DeleteEvent event={event} handleDeleteEvent={handleDeleteEvent} setStatus={setStatus} onClose={onClose} />
          </div>
        )}
      </div>
    </div>
  );
};

const AddToGoogleCalendar = ({ events, generateGoogleCalendarLinks }) => {
  return (
    <div className="flex gap-2">
      {generateGoogleCalendarLinks(events).map((link, index) => (
        <a
          key={index}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          Add to Google Calendar
        </a>
      ))}
    </div>
  );
};

export default EventPopUp;