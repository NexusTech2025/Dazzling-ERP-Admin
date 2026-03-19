import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, trend, trendValue, icon, iconBg, iconColor }) => (
  <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <h3 className="text-2xl font-bold text-text-main dark:text-white mt-2">{value}</h3>
      </div>
      <div className={`p-2 ${iconBg} rounded-lg ${iconColor}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
    <div className="flex items-center gap-1 mt-4 text-sm">
      <span className={`material-symbols-outlined ${trend === 'up' ? 'text-green-500' : 'text-red-500'} text-lg`}>
        {trend === 'up' ? 'trending_up' : 'trending_down'}
      </span>
      <span className={`${trend === 'up' ? 'text-green-600' : 'text-red-600'} font-medium`}>{trendValue}</span>
      <span className="text-text-secondary ml-1">vs last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-text-secondary mt-1">Welcome back, Administrator. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </button>
          <Link 
            to="/admin/students/add" 
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Registration
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students" 
          value="12,500" 
          trend="up" 
          trendValue="+5%" 
          icon="school" 
          iconBg="bg-blue-50 dark:bg-blue-900/20" 
          iconColor="text-blue-600 dark:text-blue-400" 
        />
        <StatCard 
          title="Active Students" 
          value="11,200" 
          trend="up" 
          trendValue="+2%" 
          icon="check_circle" 
          iconBg="bg-green-50 dark:bg-green-900/20" 
          iconColor="text-green-600 dark:text-green-400" 
        />
        <StatCard 
          title="Total Teachers" 
          value="850" 
          trend="up" 
          trendValue="+1%" 
          icon="cast_for_education" 
          iconBg="bg-purple-50 dark:bg-purple-900/20" 
          iconColor="text-purple-600 dark:text-purple-400" 
        />
        <StatCard 
          title="Revenue Snapshot" 
          value="$1.2M" 
          trend="up" 
          trendValue="+8%" 
          icon="payments" 
          iconBg="bg-yellow-50 dark:bg-yellow-900/20" 
          iconColor="text-yellow-600 dark:text-yellow-400" 
        />
      </div>

      {/* Placeholder for Charts & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 flex items-center justify-center min-h-[300px]">
           <p className="text-text-secondary">Charts Section (To be implemented)</p>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 flex items-center justify-center min-h-[300px]">
           <p className="text-text-secondary">Recent Activities (To be implemented)</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
