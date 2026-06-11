import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logout from '../ui/btn/Logout';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Batches', path: '/admin/batches', icon: 'groups' },
    { name: 'Schedule', path: '/admin/schedule', icon: 'calendar_month' },
    { 
      name: 'Courses', 
      icon: 'menu_book',
      subItems: [
        { name: 'Course Catalog', path: '/admin/courses' },
        { name: 'Packages', path: '/admin/packages' },
        { name: 'Course Categories', path: '/admin/courses/types' }
      ]
    },
    { 
      name: 'Finance', 
      icon: 'payments',
      subItems: [
        { name: 'Finance Dashboard', path: '/admin/finance' },
        { name: 'Fee Installment', path: '/admin/finance/installments' },
        { name: 'Transactions', path: '/admin/finance/transactions' },
        { name: 'OverDue', path: '/admin/finance/overdue' }
      ]
    },
    { 
      name: 'Students', 
      icon: 'school',
      subItems: [
        { name: 'Student Directory', path: '/admin/students' },
        { name: 'Student Leads', path: '/admin/students/leads' },
        { name: 'New Registration', path: '/admin/students/add' }
      ]
    },
    { name: 'Teachers', path: '/admin/teachers', icon: 'person_apron' },
  ];

  const adminItems = [
    { name: 'Branches', path: '/admin/branches', icon: 'hub' },
    { name: 'Roles & Permissions', path: '/admin/roles', icon: 'admin_panel_settings' },
    { name: 'Reports', path: '/admin/reports', icon: 'bar_chart' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
    { name: 'Test Page', path: '/admin/test-pages/prototype', icon: 'science' },
  ];

  // Auto-expand menu if sub-item is active
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => location.pathname === sub.path)) {
        setExpandedMenus(prev => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  const toggleMenu = (name) => {
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const renderItem = (item) => {
    if (item.subItems) {
      const isExpanded = expandedMenus[item.name];
      const hasActiveSub = item.subItems.some(sub => location.pathname === sub.path);

      return (
        <div key={item.name} className="flex flex-col">
          <button 
            onClick={() => toggleMenu(item.name)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              hasActiveSub 
                ? 'text-primary' 
                : 'text-text-secondary hover:bg-background-light dark:hover:bg-background-dark hover:text-text-main dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm font-semibold">{item.name}</span>
            </div>
            <span className={`material-symbols-outlined transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} text-lg`}>
              expand_more
            </span>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-1 mt-1 ml-9 pb-2 border-l border-border-light dark:border-border-dark pl-3">
              {item.subItems.map(subItem => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `text-sm py-2 px-3 rounded-md transition-colors ${
                      isActive
                        ? 'text-primary font-bold bg-primary/5'
                        : 'text-text-secondary hover:text-text-main dark:hover:text-white'
                    }`
                  }
                >
                  {subItem.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-text-secondary hover:bg-background-light dark:hover:bg-background-dark hover:text-text-main dark:hover:text-white'
          }`
        }
      >
        <span className="material-symbols-outlined text-xl">{item.icon}</span>
        <span className="text-sm font-semibold">{item.name}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 lg:static flex flex-col w-72 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark py-6 px-4 h-full overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end lg:hidden mb-4 px-2">
          <button 
            onClick={onClose}
            className="flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:bg-background-light dark:hover:bg-border-dark transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <p className="px-4 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Main Menu</p>
          {menuItems.map(renderItem)}

          <p className="px-4 text-xs font-bold text-text-secondary uppercase tracking-wider mt-6 mb-2">Administration</p>
          {adminItems.map(renderItem)}
        </div>

        <div className="mt-auto pt-6 border-t border-border-light dark:border-border-dark">
          <Logout />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
