'use client';


import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/client";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Navbar from "../components/Navbar";
import {
 Search,
 ChevronDown,
 Star,
 GraduationCap,
 X,
 Mail
} from "lucide-react";


const subjectsList = [
 "Mathematics", "Physics", "Chemistry", "Biology",
 "Computer Science", "English", "History", "Economics"
];


const fadeIn = {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: -20 }
};


const TutorCard = ({ tutor, onRatingUpdate }) => {
 const [isHovering, setIsHovering] = useState(false);
 const [isRating, setIsRating] = useState(false);
 const [ratingValue, setRatingValue] = useState(0);
 const [ratingStatus, setRatingStatus] = useState(null);
 const [currentRating, setCurrentRating] = useState(tutor.rating || 0);
 const subjects = tutor.subjects || [];
 const hasMoreSubjects = subjects.length > 3;
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


 useEffect(() => {
   const fetchInitialRating = async () => {
     const avgRating = await calculateAverageRating(tutor.id);
     setCurrentRating(avgRating);
   };
   fetchInitialRating();
 }, [tutor.id]);


 const handleEmailClick = () => {
   const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${tutor.email}`;
   window.open(mailtoLink, '_blank', 'noopener,noreferrer');
 };


 return (
   <motion.div
     variants={fadeIn}
     initial="initial"
     animate="animate"
     exit="exit"
     whileHover={{ y: -5 }}
     className="relative overflow-visible rounded-3xl bg-white shadow-lg"
   >
     <div className="relative p-8">
       <div className="flex items-start justify-between mb-6">
         <div className="flex-1">
           <h3 className="text-2xl font-semibold text-gray-900">
             {tutor.firstname} {tutor.lastname}
           </h3>
           <div className="flex items-center mt-2">
             {[...Array(5)].map((_, index) => (
               <Star
                 key={index}
                 className={`w-4 h-4 ${index < currentRating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
               />
             ))}
             <span className="ml-2 text-gray-700">{currentRating}</span>
           </div>
         </div>
         <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
           <GraduationCap className="w-8 h-8 text-white" />
         </div>
       </div>
      
       <div className="relative">
         <div className="flex flex-wrap gap-2 mb-4">
           {subjects.slice(0, 3).map((subject, idx) => (
             <span
               key={idx}
               className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded-full font-medium"
             >
               {subject.name}
             </span>
           ))}
           {hasMoreSubjects && (
             <div
               className="relative"
               onMouseEnter={() => setIsHovering(true)}
               onMouseLeave={() => setIsHovering(false)}
             >
               <span className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded-full font-medium cursor-pointer">
                 +{subjects.length - 3} more
               </span>
               {isHovering && (
                 <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl p-2 min-w-max">
                   {subjects.slice(3).map((subject, idx) => (
                     <div key={idx} className="px-3 py-1.5 text-sm text-gray-900 whitespace-nowrap">
                       {subject.name}
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}
         </div>


         {isRating ? (
           <div className="mb-4 p-4 bg-gray-50 rounded-xl">
             <div className="flex justify-center space-x-2 mb-4">
               {[1, 2, 3, 4, 5].map((star) => (
                 <button
                   key={star}
                   onClick={() => setRatingValue(star)}
                   className="focus:outline-none"
                 >
                   <Star
                     className={`w-6 h-6 ${
                       star <= ratingValue ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                     } hover:fill-yellow-300 hover:text-yellow-300 transition-colors`}
                   />
                 </button>
               ))}
             </div>
             <div className="flex justify-center space-x-2">
               <button
                 onClick={submitRating}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Submit
               </button>
               <button
                 onClick={() => {
                   setIsRating(false);
                   setRatingValue(0);
                   setRatingStatus(null);
                 }}
                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
               >
                 Cancel
               </button>
             </div>
             {ratingStatus && (
               <p className={`mt-2 text-center text-sm ${
                 ratingStatus.includes("successfully") ? "text-green-600" : "text-red-600"
               }`}>
                 {ratingStatus}
               </p>
             )}
           </div>
         ) : (
           <button
             onClick={() => setIsRating(true)}
             className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl flex items-center justify-center gap-2 mb-3 transition-colors duration-200"
           >
             <Star className="w-5 h-5" />
             <span>Rate Tutor</span>
           </button>
         )}
        
         <button
           onClick={handleEmailClick}
           className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
         >
           <Mail className="w-5 h-5" />
           <span>Contact via Gmail</span>
         </button>
       </div>
     </div>
   </motion.div>
 );
};


function Page() {
 const [tutors, setTutors] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedSubjects, setSelectedSubjects] = useState([]);
 const [subjectsDropdownOpen, setSubjectsDropdownOpen] = useState(false);


 const handleRatingUpdate = async (tutorId, newRating) => {
   try {
     setTutors(prevTutors =>
       prevTutors.map(tutor =>
         tutor.id === tutorId
           ? { ...tutor, rating: newRating }
           : tutor
       )
     );
   } catch (error) {
     console.error("Error updating rating:", error);
   }
 };


 useEffect(() => {
   const fetchTutors = async () => {
     try {
       const q = query(collection(db, "users"), where("tutorVerified", "==", true));
       const querySnapshot = await getDocs(q);
       const tutorList = querySnapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
       }));
      
       tutorList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
       setTutors(tutorList);
     } catch (error) {
       console.error("Error fetching tutors:", error);
     } finally {
       setLoading(false);
     }
   };
   fetchTutors();
 }, []);


 const toggleSubject = (subject) => {
   setSelectedSubjects((prev) =>
     prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
   );
   setSubjectsDropdownOpen(false);
 };


 const filteredTutors = tutors.filter((tutor) => {
   const matchesSearch =
     searchTerm === "" ||
     tutor.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tutor.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (tutor.subjects &&
       Array.isArray(tutor.subjects) &&
       tutor.subjects.some((subj) => subj.name.toLowerCase().includes(searchTerm.toLowerCase())));


   const matchesSubjects =
     selectedSubjects.length === 0 ||
     (tutor.subjects &&
       Array.isArray(tutor.subjects) &&
       selectedSubjects.every((subject) =>
         tutor.subjects.some((subj) => subj.name.toLowerCase() === subject.toLowerCase())
       ));


   return matchesSearch && matchesSubjects;
 });
 return (
   <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
     <div className="fixed inset-0 overflow-hidden pointer-events-none">
       <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
       <div className="absolute top-48 -right-48 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
       <div className="absolute -bottom-48 left-48 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
     </div>


     <Navbar />
    
     <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
       <div className="text-center mb-16">
         <h1 className="text-4xl sm:text-5xl mt-4 lg:text-7xl font-bold tracking-tight mb-4 text-gray-900">
           Find Your Perfect Tutor
         </h1>
         <p className="text-xl text-gray-600">
           Expert guidance tailored to your learning journey
         </p>
       </div>


       <div className="max-w-3xl mx-auto mb-16 space-y-6">
         <motion.div
           className="relative"
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
         >
           <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
           <input
             type="text"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Search by name or subject..."
             className="w-full pl-14 pr-6 py-5 bg-white shadow-lg rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow duration-200 text-gray-900 placeholder:text-gray-500"
           />
         </motion.div>


         <motion.div className="flex flex-wrap justify-center gap-4">
           <div className="relative">
             <motion.button
               onClick={() => setSubjectsDropdownOpen(!subjectsDropdownOpen)}
               className="px-6 py-4 bg-white shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200 flex items-center text-gray-900"
             >
               <span className="mr-2">Subjects</span>
               <ChevronDown className="w-4 h-4" />
             </motion.button>


             <AnimatePresence>
               {subjectsDropdownOpen && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-lg p-2 z-50"
                 >
                   {subjectsList.map((subject) => (
                     <motion.div
                       key={subject}
                       whileHover={{ x: 4 }}
                       className={`px-4 py-2 rounded-xl cursor-pointer ${
                         selectedSubjects.includes(subject)
                           ? "bg-blue-600 text-white"
                           : "hover:bg-gray-50 text-gray-900"
                       }`}
                       onClick={() => toggleSubject(subject)}
                     >
                       {subject}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>


           {(selectedSubjects.length > 0 || searchTerm) && (
             <motion.button
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               onClick={() => {
                 setSearchTerm("");
                 setSelectedSubjects([]);
               }}
               className="px-6 py-4 bg-white shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200 flex items-center text-gray-900"
             >
               <X className="w-4 h-4 mr-2" />
               Clear Filters
             </motion.button>
           )}
         </motion.div>
       </div>


       <AnimatePresence>
         {loading ? (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="text-center py-12"
           >
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
           </motion.div>
         ) : (
           <motion.div
             layout
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
           >
             {filteredTutors.length > 0 ? (
               filteredTutors.map((tutor) => (
                 <TutorCard
                   key={tutor.id}
                   tutor={tutor}
                   onRatingUpdate={handleRatingUpdate}
                 />
               ))
             ) : (
               <motion.div
                 variants={fadeIn}
                 initial="initial"
                 animate="animate"
                 exit="exit"
                 className="col-span-full text-center py-12"
               >
                 <p className="text-xl text-gray-600">No tutors found matching your criteria.</p>
               </motion.div>
             )}
           </motion.div>
         )}
       </AnimatePresence>
     </main>
   </div>
 );
}


export default Page;


