'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { 
  User, 
  Mail, 
  Lock, 
  Save,
  AlertCircle,
  CheckCircle,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Users,
  Activity, Star, Info
} from 'lucide-react'
import { auth, db } from '../firebase/client'
import { 
  updateEmail, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updatePassword, onAuthStateChanged,sendEmailVerification, updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from "firebase/firestore"







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
    }`}
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
  <div className="w-64 bg-white border-r min-h-screen p-4">
    <div className="mb-8">
      <h1 className="text-xl font-bold">Dashboard</h1>
    </div>
    <nav className="space-y-2">
      <SidebarButton
        icon={LayoutDashboard}
        label="Overview"
        section="dashboard"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <SidebarButton
        icon={Settings}
        label="Account Settings"
        section="account"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <SidebarButton
        icon={User}
        label="Tutor Profile"
        section="tutor"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </nav>
  </div>
)

// Sidebar Button Component
const SidebarButton = ({ icon: Icon, label, section, activeSection, setActiveSection }) => (
  <button
    onClick={() => setActiveSection(section)}
    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      activeSection === section 
        ? 'bg-black text-white' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
)

// Dashboard Overview Component
const DashboardOverview = ({ user }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeIn}
    transition={springConfig}
    className="space-y-8"
  >
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold p-9">Dashboard Overview</h2>
      <p className="text-gray-500">Welcome back, {user.displayName}!</p>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <ActivityList />
    </div>
  </motion.div>
)

// Activity List Component
const ActivityList = () => (
  <div className="space-y-4">
    <ActivityItem color="green" text="New user registration" time="2 minutes ago" />
    <ActivityItem color="blue" text="System update completed" time="1 hour ago" />
    <ActivityItem color="yellow" text="Database backup" time="3 hours ago" />
  </div>
)

// Activity Item Component
const ActivityItem = ({ color, text, time }) => (
  <div className="flex items-center space-x-3 text-sm">
    <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
    <p>{text}</p>
    <span className="text-gray-400">{time}</span>
  </div>
)

// Account Settings Form Component
const AccountSettingsForm = ({ title, icon: Icon, inputType, name, value, onChange, loading, onSubmit, buttonText }) => (
  <motion.div
    className="bg-white p-6 rounded-xl shadow-sm"
    whileHover={{ y: -2 }}
    transition={springConfig}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <Icon className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
          placeholder={`New ${name}`}
        />
      </div>
      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Save size={20} />
          </motion.div>
        ) : (
          <>
            <Save size={20} />
            <span>{buttonText}</span>
          </>
        )}
      </motion.button>
    </form>
  </motion.div>
)

// Password Update Form Component
const PasswordUpdateForm = ({ user, loading, onChange, onSubmit }) => (
  <motion.div
    className="bg-white p-6 rounded-xl shadow-sm"
    whileHover={{ y: -2 }}
    transition={springConfig}
  >
    <h3 className="text-lg font-semibold mb-4">Update Password</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
        <div key={field} className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="password"
            name={field}
            value={user[field]}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
            placeholder={field.replace(/([A-Z])/g, ' $1').toLowerCase()}
          />
        </div>
      ))}
      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Save size={20} />
          </motion.div>
        ) : (
          <>
            <Save size={20} />
            <span>Update Password</span>
          </>
        )}
      </motion.button>
    </form>
  </motion.div>
)

// Account Settings Component
const AccountSettings = ({ user, status, loading, handleChange, handleUsernameUpdate, handleEmailUpdate, handlePasswordUpdate }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeIn}
    transition={springConfig}
    className="max-w-2xl mx-auto space-y-8"
  >
    <h2 className="text-2xl font-bold">Account Settings</h2>
    
    {status.message && <CustomAlert type={status.type} message={status.message} />}

    <AccountSettingsForm
      title="Update Username"
      icon={User}
      inputType="text"
      name="username"
      value={user.username}
      onChange={handleChange}
      loading={loading.username}
      onSubmit={handleUsernameUpdate}
      buttonText="Update Username"
    />

    <AccountSettingsForm
      title="Update Email"
      icon={Mail}
      inputType="email"
      name="email"
      value={user.email}
      onChange={handleChange}
      loading={loading.email}
      onSubmit={handleEmailUpdate}
      buttonText="Update Email"
    />

    <PasswordUpdateForm
      user={user}
      loading={loading.password}
      onChange={handleChange}
      onSubmit={handlePasswordUpdate}
    />
  </motion.div>
)
//-------------------------------------------------------- TUTOR PROFILE -----------------------------------------------------------
const TutorProfile = () => {
  // State management
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isTutor, setIsTutor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [educationalEmail, setEducationalEmail] = useState('');
  const [subjectForm, setSubjectForm] = useState({
    subject: '',
    course: '',
    description: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [ratings, setRatings] = useState([]);

  const availableSubjects = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "Computer Science", "English", "History", "Economics"
  ];

  // Fetch user profile and check tutor status when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser.uid);
        await fetchTutorRatings(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const createOrUpdateUserProfile = async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
          email: userData.email,
          displayName: userData.displayName,
          createdAt: serverTimestamp(),
          isTutor: false,
          subjects: [],
          educationalEmail: ''
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          ...userData,
          updatedAt: serverTimestamp()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error);
      throw error;
    }
  };

  // Fetch user profile details and tutor status
  const fetchUserProfile = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // If user document doesn't exist, create it with basic info
        if (user) {
          await createOrUpdateUserProfile(userId, {
            email: user.email,
            displayName: user.displayName || '',
          });
          // Fetch the newly created document
          const newUserSnap = await getDoc(userRef);
          const userData = newUserSnap.data();
          setUserProfile(userData);
          setIsTutor(userData.isTutor || false);
          setSubjects(userData.subjects || []);
          setEducationalEmail(userData.educationalEmail || '');
        }
      } else {
        const userData = userSnap.data();
        setUserProfile(userData);
        setIsTutor(userData.isTutor || false);
        setSubjects(userData.subjects || []);
        setEducationalEmail(userData.educationalEmail || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setStatus({
        type: 'error',
        message: 'Error fetching user profile. Please try again.'
      });
    }
  };

  // Fetch tutor ratings
  const fetchTutorRatings = async (userId) => {
    if (!userId) return;

    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('tutorId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setRatings([]);
        return;
      }

      const fetchedRatings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRatings(fetchedRatings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setStatus({
        type: 'error',
        message: 'Failed to fetch ratings'
      });
    }
  };

  // Handle submitting the educational email
  const handleEducationalEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!educationalEmail.endsWith('.edu')) {
        throw new Error('Please enter a valid .edu email address');
      }

      if (!auth.currentUser) {
        throw new Error("User must be signed in");
      }

      // Check if email is already in use
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('educationalEmail', '==', educationalEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('This educational email is already registered');
      }

      // Update user profile with tutor status
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        educationalEmail,
        isTutor: true,
        tutorVerified: true,
        updatedAt: serverTimestamp()
      });

      setIsTutor(true);
      setStatus({
        type: 'success',
        message: 'Successfully registered as a tutor!'
      });

      await fetchUserProfile(user.uid);
    } catch (error) {
      console.error('Error in registration:', error);
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submitting the subject form
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    
    if (!subjectForm.subject) {
      setStatus({ type: 'error', message: 'Subject is required' });
      return;
    }

    try {
      const newSubject = {
        name: subjectForm.subject,
        course: subjectForm.course || '',
        description: subjectForm.description || '',
      };

      const updatedSubjects = [...subjects, newSubject];
      
      // Update user document with new subject
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { subjects: updatedSubjects });

      setSubjects(updatedSubjects);
      setSubjectForm({ subject: '', course: '', description: '' });
      setStatus({ type: 'success', message: 'Subject added successfully!' });
    } catch (error) {
      console.error('Error adding subject:', error);
      setStatus({ type: 'error', message: 'Failed to add subject' });
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Tutor Profile</h1>
      
      {status.message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {status.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          <p>{status.message}</p>
        </div>
      )}

      {!isTutor ? (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Become a Tutor</h2>
          <form onSubmit={handleEducationalEmailSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={educationalEmail}
                onChange={(e) => setEducationalEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                placeholder="Your .edu email address"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Register as Tutor'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Add Subject Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Add Subject</h2>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select
                  value={subjectForm.subject}
                  onChange={(e) => setSubjectForm({...subjectForm, subject: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select a subject</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Course Number (Optional)</label>
                <input
                  type="text"
                  value={subjectForm.course}
                  onChange={(e) => setSubjectForm({...subjectForm, course: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., MATH101"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                  className="w-full p-2 border rounded-lg h-24"
                  placeholder="Describe your experience with this subject..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800"
              >
                Add Subject
              </button>
            </form>
          </div>

          {/* Subjects List */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your Subjects</h2>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium">{subject.name}</h3>
                  {subject.course && (
                    <p className="text-sm text-gray-500">Course: {subject.course}</p>
                  )}
                  {subject.description && (
                    <p className="text-sm mt-2">{subject.description}</p>
                  )}
                </div>
              ))}
              {subjects.length === 0 && (
                <p className="text-gray-500">No subjects added yet.</p>
              )}
            </div>
          </div>

          {/* Ratings Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Ratings</h2>
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400" />
                <span className="font-medium">{calculateAverageRating()}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(rating.createdAt)}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-gray-700">{rating.comment}</p>
                  )}
                  {rating.subject && (
                    <p className="text-xs text-gray-500 mt-2">
                      Subject: {rating.subject}
                    </p>
                  )}
                </div>
              ))}
              {ratings.length === 0 && (
                <p className="text-gray-500">No ratings yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ---------------------------------------Main Dashboard Component -------------------------------------------------
export default function Dashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [user, setUser] = useState({
    username: '',
    email: '',
    displayName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    educationalEmail: ''
  })

  const [status, setStatus] = useState({
    type: '',
    message: ''
  })

  const [loading, setLoading] = useState({
    username: false,
    email: false,
    password: false
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(prevUser => ({
          ...prevUser,
          username: currentUser.displayName || 'No Username',
          email: currentUser.email || '',
          displayName: currentUser.displayName || ''
        }))
      } else {
        setStatus({ type: 'error', message: 'User not authenticated' })
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleUsernameUpdate = async (e) => {
    e.preventDefault()
    
    if (!user.username.trim()) {
      setStatus({
        type: 'error',
        message: 'Username cannot be empty'
      })
      return
    }
  
    try {
      setLoading({ ...loading, username: true })
      
      // Get current user
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }
  
      // Update the profile
      await updateProfile(currentUser, {
        displayName: user.username
      })
  
      // Update local state
      setUser(prevUser => ({
        ...prevUser,
        displayName: user.username
      }))
  
      setStatus({
        type: 'success',
        message: 'Username updated successfully!'
      })
    } catch (error) {
      console.error('Error updating username:', error)
      setStatus({
        type: 'error',
        message: error.message || 'Failed to update username'
      })
    } finally {
      setLoading({ ...loading, username: false })
    }
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    
    if (!user.email.trim()) {
      setStatus({
        type: 'error',
        message: 'Email cannot be empty'
      })
      return
    }

    try {
      setLoading({ ...loading, email: true })
      
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }

      // Update the email
      await updateEmail(currentUser, user.email)

      setStatus({
        type: 'success',
        message: 'Email updated successfully!'
      })
    } catch (error) {
      console.error('Error updating email:', error)
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/requires-recent-login') {
        setStatus({
          type: 'error',
          message: 'Please log out and log back in to update your email'
        })
      } else {
        setStatus({
          type: 'error',
          message: error.message || 'Failed to update email'
        })
      }
    } finally {
      setLoading({ ...loading, email: false })
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    if (!user.currentPassword || !user.newPassword || !user.confirmPassword) {
      setStatus({
        type: 'error',
        message: 'All password fields are required'
      })
      return
    }

    if (user.newPassword !== user.confirmPassword) {
      setStatus({
        type: 'error',
        message: 'New passwords do not match!'
      })
      return
    }

    if (user.newPassword.length < 6) {
      setStatus({
        type: 'error',
        message: 'New password must be at least 6 characters long'
      })
      return
    }

    try {
      setLoading({ ...loading, password: true })
      
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        user.currentPassword
      )
      
      await reauthenticateWithCredential(currentUser, credential)

      await updatePassword(currentUser, user.newPassword)

      setStatus({
        type: 'success',
        message: 'Password updated successfully!'
      })

      setUser({
        ...user,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      
      if (error.code === 'auth/wrong-password') {
        setStatus({
          type: 'error',
          message: 'Current password is incorrect'
        })
      } else if (error.code === 'auth/requires-recent-login') {
        setStatus({
          type: 'error',
          message: 'Please log out and log back in to update your password'
        })
      } else {
        setStatus({
          type: 'error',
          message: error.message || 'Failed to update password'
        })
      }
    } finally {
      setLoading({ ...loading, password: false })
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="flex-1 p-8">
          {activeSection === 'dashboard' ? (
            <DashboardOverview user={user} />
          ) : activeSection === 'tutor' ? (
            <TutorProfile
              user={user}
              status={status}
              setStatus={setStatus}
              loading={loading}
              handleChange={handleChange}
            />
          ) : (
            <AccountSettings
              user={user}
              status={status}
              loading={loading}
              handleChange={handleChange}
              handleUsernameUpdate={handleUsernameUpdate}
              handleEmailUpdate={handleEmailUpdate}
              handlePasswordUpdate={handlePasswordUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}