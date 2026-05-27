import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePackageDetailQuery } from './hooks/useCourseQueries';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import Badge from '../../components/ui/Badge';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const { data: pkg, isLoading, error } = usePackageDetailQuery(id);

  if (isLoading) return <LoadingState message="Fetching relational bundle data..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => navigate('/admin/courses')} />;
  if (!pkg) return <ErrorState message="Package not found" onRetry={() => navigate('/admin/courses')} />;

  const aggregateValue = pkg.courses?.reduce((sum, c) => sum + (c.base_fee || 0), 0) || 0;
  const packageFee = pkg.package_fee || pkg.base_fee || 0;
  const savingsPercent = pkg.discount_percent || Math.round(((aggregateValue - packageFee) / aggregateValue) * 100);

  const tabs = ['Overview', 'Included Courses', 'Enrollments', 'Revenue'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Breadcrumb & Header Section */}
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Link to="/admin/courses" className="hover:text-primary transition-colors">Courses</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/admin/courses" className="hover:text-primary transition-colors">Course Packages</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-text-main dark:text-white font-medium">{pkg.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">{pkg.name}</h1>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                {pkg.status}
              </span>
            </div>
            <p className="text-text-secondary font-medium font-mono text-sm">
              {pkg.package_id} <span className="mx-2 opacity-50">•</span> Created Jan 15, 2024
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to={`/admin/packages/edit/${pkg.package_id}`}
              className="flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-secondary font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Package
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-secondary font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-lg">analytics</span>
              Stats
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <span className="material-symbols-outlined text-lg">download</span>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Performance Indicators (Bento) - Moved above tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Enrolled', value: '145', icon: 'person_add', color: 'blue', sub: '+12 this month' },
          { label: 'Completion Rate', value: '92%', icon: 'monitoring', color: 'rose', sub: 'Target: 95%' },
          { label: 'Total Revenue', value: '₹57,855', icon: 'payments', color: 'emerald', sub: '(₹4.2k pending)' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-light dark:bg-surface-dark p-8 rounded-3xl border border-border-light dark:border-border-dark shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
            <div className={`size-14 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              <span className={`material-symbols-outlined text-${stat.color}-600 text-2xl`}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-black text-text-main dark:text-white">{stat.value}</p>
                <span className={`text-[10px] font-black text-${stat.color}-600`}>{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabbed Interface */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
        <div className="flex border-b border-border-light dark:border-border-dark overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50 px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-5 text-sm font-black whitespace-nowrap transition-all relative ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-10">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Overview Column */}
              <div className="lg:col-span-2 space-y-10">
                {/* Summary Stats Bento Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Subjects', value: pkg.courses?.length || 0, icon: 'list_alt' },
                    { label: 'Duration', value: `${pkg.month} Months`, icon: 'calendar_month' },
                    { label: 'Target Class', value: `Class ${pkg.target_class}`, icon: 'school' },
                    { label: 'Board', value: pkg.board, icon: 'menu_book' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-background-light dark:bg-background-dark p-5 rounded-2xl border border-border-light dark:border-border-dark flex flex-col gap-1">
                      <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{stat.label}</p>
                      <p className="text-xl font-black text-text-main dark:text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Description Card */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-text-main dark:text-white flex items-center gap-2">
                    <span className="size-2 bg-primary rounded-full"></span>
                    Course Objectives
                  </h3>
                  <div className="text-text-secondary leading-relaxed font-medium">
                    <p>{pkg.description}</p>
                    <p className="mt-4">This package integrates core disciplines with advanced foundations, ensuring students are over-prepared for academic transitions and board excellence.</p>
                  </div>
                </div>

                {/* Perks & Benefits */}
                <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 border border-primary/10">
                  <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Perks & Exclusive Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.perks?.length > 0 ? pkg.perks.map((perk) => (
                      <div key={perk.perk_id} className="flex items-start gap-4 bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white dark:border-slate-700 shadow-sm">
                        <span className="material-symbols-outlined text-primary fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <div>
                          <p className="font-black text-sm text-text-main dark:text-white">{perk.perk_title}</p>
                          <p className="text-xs text-text-secondary font-medium mt-1">{perk.perk_description}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-text-secondary italic">Standard institute support features included.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Info Column */}
              <div className="space-y-8">
                {/* Pricing Card */}
                <div className="bg-text-main dark:bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                  <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                  
                  <p className="text-xs font-black text-primary mb-8 uppercase tracking-[0.2em]">Pricing Strategy</p>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center opacity-60">
                      <span className="text-xs font-bold uppercase">Individual Value</span>
                      <span className="text-lg line-through font-mono">₹{aggregateValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-6">
                      <span className="text-sm font-bold">Package Fee</span>
                      <div className="text-right">
                        <span className="text-4xl font-black text-white tracking-tighter">₹{packageFee.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-bold text-slate-400">Total Savings</span>
                      <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                        {savingsPercent}% OFF
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-10 bg-primary py-4 rounded-2xl font-black text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 active:scale-95">
                    Enroll New Student
                  </button>
                </div>

                {/* Quick Info Card */}
                <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark p-8 rounded-3xl shadow-sm">
                  <h4 className="font-black text-xs uppercase tracking-widest text-text-secondary mb-6">Package Manager</h4>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="size-12 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center text-text-secondary">
                      <span className="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-main dark:text-white">Admin Coordinator</p>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">Academic Department</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
                      <span className="material-symbols-outlined text-base text-primary">mail</span>
                      <span>support@dazzling.edu</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
                      <span className="material-symbols-outlined text-base text-primary">call</span>
                      <span>+91 98765 43210</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Included Courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pkg.courses?.map((course) => (
                <div key={course.course_id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary transition-all group shadow-sm active:scale-95 cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-text-secondary uppercase tracking-widest">{course.short_code}</span>
                    <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">open_in_new</span>
                  </div>
                  <h4 className="font-black text-text-main dark:text-white mb-2 text-lg">{course.name}</h4>
                  <p className="text-sm text-text-secondary font-medium mb-6 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-3 border-t border-border-light dark:border-border-dark pt-5">
                    <div className="size-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                    <span className="text-xs font-black text-text-secondary uppercase tracking-tighter">Assigned Faculty</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
