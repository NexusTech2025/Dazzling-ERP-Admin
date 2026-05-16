import React from 'react';

/**
 * FullScreenSplash: A visually appealing, full-screen loading state.
 * Used by HydrationGuard during Strategy 1 (App Initialization).
 */
const FullScreenSplash = ({ message = "Initializing Dazzling ERP..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center">
        {/* Animated Logo/Icon Container */}
        <div className="relative mb-8">
          <div className="size-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 animate-bounce-slow">
            <span className="material-symbols-outlined text-white text-5xl">rocket_launch</span>
          </div>
          
          {/* Circular Rings */}
          <div className="absolute -inset-4 border-2 border-primary/20 rounded-full animate-ping-slow"></div>
          <div className="absolute -inset-8 border-2 border-primary/10 rounded-full animate-ping-slow delay-700"></div>
        </div>

        {/* Text and Progress */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-main dark:text-white tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-text-secondary font-medium animate-pulse">
            {message}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-10 w-64 h-1.5 bg-border-light dark:bg-border-dark rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary rounded-full animate-progress-indeterminate shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"></div>
        </div>
      </div>

      {/* Footer Badge */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full shadow-sm">
        <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
          Secure Connection Established
        </span>
      </div>
    </div>
  );
};

export default FullScreenSplash;
