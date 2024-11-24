"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Home, BarChart, Settings, Bell, LogOut, User, PieChart } from 'lucide-react';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/applications', label: 'Applications', icon: Briefcase },
    { href: '/reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: isMobile ? 20 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed ${isMobile ? 'bottom-0 left-0 right-0' : 'top-0 left-0 bottom-0'}
        bg-gray-900 border-gray-800 z-50
        ${isMobile ? 'border-t' : 'border-r'}
      `}
    >
      <div className={`
        flex 
        ${isMobile ? 'justify-around items-center p-2' : 'flex-col h-full p-4'}
      `}>
        {!isMobile && (
          <div className="mb-8 flex justify-center items-center">
            <h1 className="text-2xl font-bold text-white">
              JobTrack<span className="text-yellow-400">r</span>
            </h1>
          </div>
        )}
        
        <div className={`flex ${isMobile ? 'w-full justify-around' : 'flex-col gap-4'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  p-3 rounded-lg transition-all duration-200 relative group
                  ${isMobile ? 'flex flex-col items-center text-xs' : 'flex items-center gap-3'}
                  ${isActive 
                    ? 'bg-yellow-400/20 text-yellow-400' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <Icon className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
                {!isMobile && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isMobile && (
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-yellow-400/10 rounded-lg z-[-1]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className={`${isMobile ? '' : 'mt-auto'}`}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`
              p-3 rounded-lg transition-all duration-200 w-full
              ${isMobile ? 'flex flex-col items-center text-xs' : 'flex items-center gap-3'}
              ${showSettings 
                ? 'bg-yellow-400/20 text-yellow-400' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
            `}
          >
            <Settings className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
            {!isMobile && <span className="text-sm font-medium">Settings</span>}
            {isMobile && <span className="text-xs mt-1 font-medium">Settings</span>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute ${isMobile ? 'bottom-full right-0 mb-2 mr-2' : 'left-full ml-2 bottom-4'}
              bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-4 min-w-[240px]
            `}
          >
            {user && (
              <div className="mb-4 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-yellow-400" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user.displayName}</span>
                    <span className="text-xs text-gray-400">{user.email}</span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

