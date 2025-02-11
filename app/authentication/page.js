'use client'


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase/client';
import { useRouter } from 'next/navigation';
import { setDoc, doc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { User, Mail, Lock, Loader } from 'lucide-react';


export default function Authentication() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [displayName, setDisplayName] = useState('');
 const [error, setError] = useState('');
 const [firstname, setFirstName] = useState('');
 const [lastname, setLastName] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [mode, setMode] = useState('login');
 const router = useRouter();


 const handleSubmit = async (e) => {
   e.preventDefault();
   setError('');
   setIsLoading(true);


   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) {
     setError('Please enter a valid email address');
     setIsLoading(false);
     return;
   }


   try {
     if (mode === 'signup') {
       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       const user = userCredential.user;
    
       await setDoc(doc(db, 'users', user.uid), {
         displayName,
         firstname,
         lastname,
         email,
         createdAt: new Date(),
       });
    
       router.push('/dashboard');
     } else if (mode === 'login') {
       await signInWithEmailAndPassword(auth, email, password);
       router.push('/dashboard');
     } else if (mode === 'forgotPassword') {
       await sendPasswordResetEmail(auth, email);
       setError('Password reset email sent. Check your inbox.');
       setMode('login');
     }
   } catch (error) {
     const errorMap = {
       'auth/invalid-email': 'Invalid email address.',
       'auth/user-not-found': 'No account found with this email.',
       'auth/wrong-password': 'Incorrect password.',
       'auth/email-already-in-use': 'Email already in use.',
       'auth/weak-password': 'Password is too weak.',
       'auth/network-request-failed': 'Network error. Please check your connection.',
     };
     setError(errorMap[error.code] || error.message);
   } finally {
     setIsLoading(false);
   }
 };


 const inputBaseClasses = "w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200";
 const iconBaseClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5";


 return (
   <>
     <Navbar />
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6 }}
         className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
       >
         <motion.h2
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-3xl font-bold mb-8 text-center text-gray-900"
         >
           {mode === 'signup' ? 'Create Account' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
         </motion.h2>
  
         {error && (
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6"
           >
             {error}
           </motion.div>
         )}
  
         <form onSubmit={handleSubmit} className="space-y-6">
           {mode === 'signup' && (
             <div className="space-y-4">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="relative"
               >
                 <User className={`${iconBaseClasses} text-pink-500`} strokeWidth={1.5} />
                 <input
                   type="text"
                   placeholder="Display Name"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   required
                   className={inputBaseClasses}
                 />
               </motion.div>
              
               <div className="grid grid-cols-2 gap-4">
                 <motion.div className="relative">
                   <User className={`${iconBaseClasses} text-pink-500`} strokeWidth={1.5} />
                   <input
                     type="text"
                     placeholder="First Name"
                     value={firstname}
                     onChange={(e) => setFirstName(e.target.value)}
                     required
                     className={inputBaseClasses}
                   />
                 </motion.div>
                
                 <motion.div className="relative">
                   <User className={`${iconBaseClasses} text-pink-500`} strokeWidth={1.5} />
                   <input
                     type="text"
                     placeholder="Last Name"
                     value={lastname}
                     onChange={(e) => setLastName(e.target.value)}
                     required
                     className={inputBaseClasses}
                   />
                 </motion.div>
               </div>
             </div>
           )}
  
           <motion.div className="relative">
             <Mail className={`${iconBaseClasses} text-purple-500`} strokeWidth={1.5} />
             <input
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               className={inputBaseClasses}
             />
           </motion.div>
  
           {mode !== 'forgotPassword' && (
             <motion.div className="relative">
               <Lock className={`${iconBaseClasses} text-blue-500`} strokeWidth={1.5} />
               <input
                 type="password"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 className={inputBaseClasses}
               />
             </motion.div>
           )}
  
           <motion.button
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             type="submit"
             disabled={isLoading}
             className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg
               disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200
               hover:shadow-xl hover:from-blue-600 hover:to-purple-600 flex justify-center items-center"
           >
             {isLoading ? (
               <div className="inline-flex items-center justify-center">
                 <Loader className="h-5 w-5 animate-spin mr-2" />
                 Processing...
               </div>
             ) : (
               mode === 'signup' ? 'Create Account' :
               mode === 'login' ? 'Log In' :
               'Reset Password'
             )}
           </motion.button>
         </form>
  
         <div className="text-center mt-8 space-y-3">
           {mode === 'login' && (
             <motion.button
               whileHover={{ scale: 1.05 }}
               onClick={() => setMode('forgotPassword')}
               className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
             >
               Forgot Password?
             </motion.button>
           )}
  
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
             className="block w-full text-gray-600 hover:text-gray-900 transition-colors"
           >
             {mode === 'signup' ? 'Already have an account? Log In' :
              mode === 'login' ? "Don't have an account? Sign Up" :
              'Back to Log In'}
           </motion.button>
         </div>
       </motion.div>
     </div>
   </>
 );
}



