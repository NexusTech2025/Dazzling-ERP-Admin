import React from 'react';
import { useAuth } from '../../context/AuthContextCore';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const appVersion = import.meta.env.VITE_APP_VERSION || '0.0.1';
  const appStage = import.meta.env.VITE_APP_STAGE || 'dev';

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border-light bg-surface-light dark:bg-surface-dark dark:border-border-dark px-4 lg:px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-4 lg:gap-8">
        <button 
          onClick={onMenuClick}
          className="flex items-center justify-center lg:hidden p-1.5 rounded-lg text-text-secondary hover:bg-background-light dark:hover:bg-border-dark transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="size-8 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">school</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-text-main dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Dazzling ERP</h2>
            <span className="bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
              v{appVersion} • {appStage}
            </span>
          </div>
        </div>
        
        {/* Search Bar */}
        <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none text-text-main dark:text-white focus:ring-0 placeholder:text-text-secondary text-sm font-normal outline-none" 
              placeholder="Search..." 
            />
          </div>
        </label>
      </div>

      <div className="flex flex-1 justify-end gap-6 items-center">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-full size-10 hover:bg-background-light dark:hover:bg-border-dark text-text-secondary transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          <span className="material-symbols-outlined">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        <button className="relative flex items-center justify-center rounded-full size-10 hover:bg-background-light dark:hover:bg-border-dark text-text-secondary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text-main dark:text-white">{user?.username || 'Admin'}</p>
            <p className="text-xs text-text-secondary capitalize">{user?.role || 'Administrator'}</p>
          </div>
          <div className="bg-slate-200 rounded-full size-10 border-2 border-primary flex items-center justify-center overflow-hidden">
             <span className="material-symbols-outlined text-slate-500">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
