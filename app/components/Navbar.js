'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Home, LayoutDashboard, LogOut, Calendar as CalendarIcon, Telescope } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = user
    ? [
        { name: 'HOME', href: '/', icon: Home },
        { name: 'EXPLORE', href: '/explore', icon:  Telescope},
        { name: 'CALENDAR', href: '/calendar', icon: CalendarIcon },
        { name: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard }
      ]
    : [
        { name: 'HOME', href: '/', icon: Home }
        
      ];

  return (
    <motion.nav 
      initial={false}
      animate={{
        y: scrolled ? -10 : 0,
        height: scrolled ? '4rem' : '5rem'
      }}
      className="fixed w-full z-50 px-4 transition-all duration-200"
    >
      <motion.div 
        className={`
          max-w-2xl mx-auto rounded-2xl flex items-center justify-between px-6 py-3
          ${scrolled 
            ? 'bg-white/90 backdrop-blur-lg shadow-lg' 
            : 'bg-white shadow-xl'}
        `}
      >
        <nav className="flex items-center gap-1">
          <AnimatePresence mode="wait">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative"
                >
                  <Link 
                    href={item.href}
                    className={`
                      block flex items-center gap-2 px-4 py-2 rounded-xl font-bold
                      transition-all duration-200 text-sm
                      ${pathname === item.href 
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 -z-10"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>

        <AnimatePresence mode="wait">
          {user ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
                bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg
                hover:shadow-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Link 
                href="/authentication"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
                  bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg
                  hover:shadow-xl transition-all duration-200"
              >
                LOGIN
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  );
}

export default Navbar;