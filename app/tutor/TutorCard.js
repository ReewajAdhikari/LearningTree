import React, { useState, useEffect } from "react";
import { FaEnvelope, FaUserGraduate, FaStar } from "react-icons/fa";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/client";
import { getAuth } from "firebase/auth";

const TutorCard = ({ tutor, onRatingUpdate }) => {
  const [isRating, setIsRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingStatus, setRatingStatus] = useState(null);
  const [currentRating, setCurrentRating] = useState(tutor.rating || 0);
  const auth = getAuth();

  const calculateAverageRating = async (tutorId) => {
    try {
      const ratingsRef = collection(db, "ratings");
      const q = query(ratingsRef, where("tutorId", "==", tutorId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 0;
      }

      const ratings = querySnapshot.docs.map(doc => doc.data().rating);
      const average = ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;
      return Number(average.toFixed(1));
    } catch (error) {
      console.error("Error calculating average rating:", error);
      return 0;
    }
  };

  const submitRating = async () => {
    if (!auth.currentUser) {
      setRatingStatus("Please sign in to rate tutors");
      return;
    }

    if (ratingValue === 0) {
      setRatingStatus("Please select a rating");
      return;
    }

    try {
      const ratingData = {
        tutorId: tutor.id,
        userId: auth.currentUser.uid,
        rating: ratingValue,
        timestamp: new Date()
      };

      // Check if user has already rated this tutor
      const ratingsRef = collection(db, "ratings");
      const q = query(
        ratingsRef, 
        where("tutorId", "==", tutor.id),
        where("userId", "==", auth.currentUser.uid)
      );
      const existingRatings = await getDocs(q);

      if (!existingRatings.empty) {
        setRatingStatus("You have already rated this tutor");
        return;
      }

      await addDoc(collection(db, "ratings"), ratingData);
      
      // Calculate new average rating
      const newAverageRating = await calculateAverageRating(tutor.id);
      setCurrentRating(newAverageRating);
      
      if (onRatingUpdate) {
        onRatingUpdate(tutor.id, newAverageRating);
      }

      setRatingStatus("Rating submitted successfully!");
      setIsRating(false);
      setRatingValue(0);
      
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRatingStatus("Failed to submit rating. Please try again.");
    }
  };

  // Initial rating fetch
  useEffect(() => {
    const fetchInitialRating = async () => {
      const avgRating = await calculateAverageRating(tutor.id);
      setCurrentRating(avgRating);
    };
    fetchInitialRating();
  }, [tutor.id]);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-md transform transition duration-200 hover:scale-105 hover:shadow-lg">
      <div className="flex justify-between items-center">
        <FaUserGraduate className="text-4xl text-blue-400" />
        <div className="text-right">
          <h3 className="text-xl font-semibold text-white">
            {tutor.firstname} {tutor.lastname}
          </h3>
          <p className="text-gray-400">
            {tutor.subjects?.map((s) => s.name).join(", ") || "No subjects listed"}
          </p>
          <p className="text-yellow-400">
            {currentRating ? `⭐ ${currentRating}/5` : "No rating yet"}
          </p>
        </div>
      </div>

      {isRating ? (
        <div className="mt-4 bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRatingValue(star)}
                className="focus:outline-none"
              >
                <FaStar
                  className={`text-2xl ${
                    star <= ratingValue ? "text-yellow-400" : "text-gray-400"
                  } hover:text-yellow-300 transition-colors`}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-center space-x-2">
            <button
              onClick={submitRating}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Submit Rating
            </button>
            <button
              onClick={() => {
                setIsRating(false);
                setRatingValue(0);
                setRatingStatus(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
          {ratingStatus && (
            <p className={`mt-2 text-center text-sm ${
              ratingStatus.includes("successfully") ? "text-green-400" : "text-red-400"
            }`}>
              {ratingStatus}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsRating(true)}
          className="mt-4 px-4 py-2 w-full text-center rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 mb-2"
        >
          <FaStar /> Rate Tutor
        </button>
      )}

      <a
        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${tutor.email}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 px-4 py-2 w-full inline-block text-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-2"
      >
        <FaEnvelope className="text-lg" /> Email Tutor
      </a>
    </div>
  );
};

export default TutorCard;