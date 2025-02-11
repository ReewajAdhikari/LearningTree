'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import EventCalendar from './EventCalendar'
import EventPopUp from './EventPopUp'
import {addDays, format, subDays} from "date-fns";
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
import { auth } from '../firebase/client'
import { onAuthStateChanged } from 'firebase/auth'
import { 
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getFirestore
} from 'firebase/firestore'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// Animation configs
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
}

// Custom Alert Component
const CustomAlert = ({ type, message }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`p-4 rounded-lg flex items-center space-x-2 ${
      type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
    } mb-4`}
  >
    {type === 'error' ? (
      <AlertCircle className="h-5 w-5" />
    ) : (
      <CheckCircle className="h-5 w-5" />
    )}
    <p>{message}</p>
  </motion.div>
)

// Sidebar Component
const Sidebar = ({ activeSection, setActiveSection }) => (
  <aside className="w-64 bg-white border-r min-h-screen p-4">
    <div className="mb-8">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <CalendarDays className="h-6 w-6" />
        Academic Calendar
      </h1>
    </div>
    <nav className="space-y-2 pd-9">
      <SidebarButton
        icon={BookOpen}
        label="My Schedule"
        section="schedule"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <SidebarButton
        icon={PlusCircle}
        label="Add Events"
        section="add"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </nav>
  </aside>
)

const SidebarButton = ({ icon: Icon, label, section, activeSection, setActiveSection }) => (
  <button
    onClick={() => setActiveSection(section)}
    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      activeSection === section 
        ? 'bg-black text-white' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
    type="button"
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
)

// Schedule Overview Component


// Add Event Form Component
const AddEventForm = ({ date, title, type, description, handleDateSelect, handleTitleChange, handleTypeChange, handleDescriptionChange, handleAddEvent, loading }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeIn}
    transition={springConfig}
    className="max-w-2xl mx-auto space-y-8"
  >
    <h2 className="text-2xl font-bold flex items-center gap-2">
      <Plus className="h-7 w-7" />
      Add New Event
    </h2>

    <form onSubmit={(e) => {
      e.preventDefault()
      handleAddEvent()
    }} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter the title of the event"
          className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
          required
        />
      </div>

      <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Type</label>
      <input
          id="type"
          type="text"
          value={type}
          onChange={handleTypeChange}
          placeholder="Enter type of event"
          className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
          required
        />
      </div>

      <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Description</label>
      <input
          id="type"
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Enter description of event"
          className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
          required
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <DatePicker
          id="date"
          selected={date}
          onChange={handleDateSelect}
          className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Save className="h-5 w-5" />
          </motion.div>
        ) : (
          <>
            <Plus className="h-5 w-5" />
            Add to Calendar
          </>
        )}
      </button>
    </form>
  </motion.div>
)

export default function MainCalendar() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('schedule')
  const [events, setEvents] = useState([])
  const [date, setDate] = useState(new Date())
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  
  const db = getFirestore()

  useEffect(() => {
    let eventsUnsubscribe = null

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Clean up existing subscription
      if (eventsUnsubscribe) {
        eventsUnsubscribe()
        eventsUnsubscribe = null
      }

      if (!currentUser) {
        router.push('/login')
        // Clear events when user logs out
        setEvents([])
        return
      }

      // Only subscribe to events if user is logged in
      const q = query(
        collection(db, 'events'),
        where('userId', '==', currentUser.uid)
      )

      eventsUnsubscribe = onSnapshot(q, 
        (snapshot) => {
          const eventsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setEvents(eventsList)
        },
        (error) => {
          console.error("Firestore subscription error:", error)
          setStatus({
            type: 'error',
            message: 'Failed to load events'
          })
          // If permission error occurs during subscription, clear events
          if (error.code === 'permission-denied') {
            setEvents([])
          }
        }
      )
    })

    // Cleanup function
    return () => {
      if (eventsUnsubscribe) {
        eventsUnsubscribe()
      }
      unsubscribe()
    }
  }, [router, db])

  const handleAddEvent = async () => {
    if (!title.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter an event title'
      })
      return
    }

    try {
      setLoading(true)
      const eventData = {
        title: title.trim(),
        date: date.toISOString(),
        type: type.trim(),
        description: description.trim(),
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString()
      }

      if (!eventData.userId) {
        throw new Error('You must be logged in to add events')
      }

      await addDoc(collection(db, 'events'), eventData)
      setTitle('')
      setStatus({
        type: 'success',
        message: 'Event added successfully!'
      })
      setActiveSection('schedule')
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to add event'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (id) => {
    try {
      await deleteDoc(doc(db, 'events', id))
      setStatus({
        type: 'success',
        message: 'Event deleted successfully!'
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to delete event'
      })
    }
  }


  const generateAppleCalendarLink = ({events}) => {
    console.log(events);
    const eventDate = new Date(event.date)
    const endDate = new Date(eventDate)
    endDate.setHours(endDate.getHours() + 1)

    const details = `${event.type.toUpperCase()}: ${event.title}`
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${details}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n')

    return URL.createObjectURL(new Blob([icsData], { type: 'text/calendar;charset=utf-8' }))
  }
  var calendarEvents = [];
  for(var i = 0; i < events.length; i++) {
   calendarEvents[i] = {title: events[i].title, date: subDays(new Date(events[i].date))};
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        <main className="flex-1 p-8 mt-8">
          {status.message && (
            <CustomAlert 
              type={status.type} 
              message={status.message} 
            />
          )}
          
          {activeSection === 'schedule' ? (
            <EventCalendar events = {events}/>
          ) : (
            <AddEventForm
              date={date}
              title={title}
              type={type}
              handleDateSelect={setDate}
              handleTitleChange={(e) => setTitle(e.target.value)}
              handleTypeChange={(e) => setType(e.target.value)}
              handleDescriptionChange={(e) => setDescription(e.target.value)}
              handleAddEvent={handleAddEvent}
              loading={loading}
            />
          )}
        </main>

        
      </div>
    </div>
  )
}


//<ScheduleOverviewevents={events}handleDeleteEvent={handleDeleteEvent}generateGoogleCalendarLink={generateGoogleCalendarLink}generateAppleCalendarLink={generateAppleCalendarLink}/>