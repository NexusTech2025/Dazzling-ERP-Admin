import React from 'react';
import { NavLink } from 'react-router-dom';
import Logout from '../ui/btn/Logout';

const Sidebar = () => {

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Courses', path: '/admin/courses', icon: 'menu_book' },
    { name: 'Finance', path: '/admin/finance', icon: 'payments' },
    { name: 'Students', path: '/admin/students', icon: 'school' },
    { name: 'Teachers', path: '/admin/teachers', icon: 'person_apron' },
  ];

  const adminItems = [
    { name: 'Roles & Permissions', path: '/admin/roles', icon: 'admin_panel_settings' },
    { name: 'Reports', path: '/admin/reports', icon: 'bar_chart' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark py-6 px-4 h-full overflow-y-auto">
      <div className="flex flex-col gap-1">
        <p className="px-4 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Main Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-background-light dark:hover:bg-background-dark hover:text-text-main dark:hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-semibold">{item.name}</span>
          </NavLink>
        ))}

        <p className="px-4 text-xs font-bold text-text-secondary uppercase tracking-wider mt-6 mb-2">Administration</p>
        {adminItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-background-light dark:hover:bg-background-dark hover:text-text-main dark:hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-border-light dark:border-border-dark">
        <Logout />
      </div>
    </aside>
  );
};

export default Sidebar;
