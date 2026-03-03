import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContextCore';

/**
 * Logout Button Component
 * 
 * Handles the asynchronous logout process with a spinning loading indicator.
 */
const Logout = () => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Auth context will clear session and redirect (via ProtectedRoute logic in AppRoutes)
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
        isLoggingOut 
          ? 'bg-red-50/50 text-red-400 cursor-not-allowed' 
          : 'text-text-secondary hover:bg-red-50 hover:text-red-600 active:scale-[0.98]'
      }`}
    >
      <div className="relative size-6 flex items-center justify-center">
        {isLoggingOut ? (
          <div className="size-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        ) : (
          <span className="material-symbols-outlined text-[24px]">logout</span>
        )}
      </div>
      <span className="text-sm font-semibold tracking-tight">
        {isLoggingOut ? 'Logging out...' : 'Log Out'}
      </span>
    </button>
  );
};

export default Logout;
