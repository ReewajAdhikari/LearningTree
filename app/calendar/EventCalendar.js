import clsx from "clsx";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
} from "date-fns";
import { useMemo, useState } from 'react';
import EventPopUp from './EventPopUp';
import DayPopUp from './DayPopUp';
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EventCalendar = ({ events }) => {
  const currentDate = new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  // Pop up for event
  const [showEventPopup, setshowEventPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Pop up for the day
  const [showDayPopup, setshowDayPopup] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingDayIndex = getDay(firstDayOfMonth);

  const eventsByDate = useMemo(() => {
    return events.reduce((acc, event) => {
      const dateKey = format(new Date(event.date), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events]);

  const handleEventClick = (event, e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setSelectedEvent(event);
    setshowEventPopup(true);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setshowDayPopup(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-center">{format(currentDate, "MMMM yyyy")}</h2>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="font-bold text-center">{day}</div>
        ))}
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="border rounded-md p-2 text-center" />
        ))}
        {daysInMonth.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const todaysEvents = eventsByDate[dateKey] || [];
          return (
            <div
              key={index}
              className={clsx("border rounded-md p-2 text-center", {
                "bg-gray-200": isToday(day),
                "text-gray-900": isToday(day),
              })} onClick={() => handleDayClick(day)}>
              {format(day, "d")}
              {todaysEvents.map((event) => (
                <div
                  key={event.title}
                  className="bg-green-500 rounded-md text-gray-900 hover:bg-green-600"
                  onClick={(e) => handleEventClick(event, e)}>
                    {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <EventPopUp
        isOpen={showEventPopup}
        onClose={() => setshowEventPopup(false)}
        event={selectedEvent}
      />
      <DayPopUp
        isOpen={showDayPopup}
        onClose={() => setshowDayPopup(false)}
        events={eventsByDate[format(selectedDay, "yyyy-MM-dd")]}
      />
    </div>
  );
};

export default EventCalendar;