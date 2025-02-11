import React from 'react';

const DayPopUp = ({ isOpen, onClose, events }) => {
  if (!isOpen) return null;
  console.log(events);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg relative min-w-[300px] max-w-md">
        <span 
          className="absolute top-2 right-2 cursor-pointer text-2xl hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </span>
        <h2 className="text-xl font-bold mb-4">Events</h2>
        {events && events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p><span className="font-semibold">Date:</span> {event.date}</p>
              <p><span className="font-semibold">Description:</span> deez</p>
            </div>
          ))
        ) : (
          <p>No events available</p>
        )}
      </div>
    </div>
  );
};

export default DayPopUp;