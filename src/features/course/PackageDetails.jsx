import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Core UI & Layout Components
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';

// Responsive hook & shared footer
import useIsMobile from '../../hooks/useIsMobile';
import ActionFooter from '../../components/ui/v2/ActionFooter';

// Data queries
import { queryKeys } from '../../lib/react-query/queryKeys';
import { 
  usePackageDetailQuery, 
  usePackageEnrollmentsQuery, 
  usePackageFeeAccountsQuery,
  useDeletePackageMutation
} from './hooks/usePackageQueries';

// Decoupled sub-tab components
import { PackageOverviewTab } from './tabs/PackageOverviewTab';
import { PackageCoursesTab } from './tabs/PackageCoursesTab';
import { PackageEnrollmentsTab } from './tabs/PackageEnrollmentsTab';
import { PackageRevenueTab } from './tabs/PackageRevenueTab';

// Immutable configuration data outside render scope
const CRUMBS_TEMPLATE = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
  { label: 'Courses', path: '/admin/courses' },
  { label: 'Packages', path: '/admin/packages' }
];

const TABS_CONFIG = [
  { id: 'Overview', label: 'Overview', icon: 'dashboard' },
  { id: 'Included Courses', label: 'Included Courses', icon: 'list_alt' },
  { id: 'Enrollments', label: 'Enrollments', icon: 'group' },
  { id: 'Revenue', label: 'Revenue', icon: 'payments' }
];

/**
 * PackageDetails View - Renders package metadata, financial stats, and bundle options.
 */
const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = useCallback((e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
  }, []);

  const { data: pkg, isLoading, error } = usePackageDetailQuery(id);
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = usePackageEnrollmentsQuery(id);
  const { data: feeAccounts = [], isLoading: isFeeLoading } = usePackageFeeAccountsQuery(id);
  const deletePackageMutation = useDeletePackageMutation();

  // Memoized relational reductions
  const aggregateValue = useMemo(() => {
    return pkg?.courses?.reduce((sum, c) => sum + (c.base_fee || 0), 0) || 0;
  }, [pkg]);

  const packageFee = useMemo(() => {
    return pkg?.package_fee || pkg?.base_fee || 0;
  }, [pkg]);

  const savingsPercent = useMemo(() => {
    if (!pkg || !aggregateValue) return 0;
    return pkg.discount_percent || Math.round(((aggregateValue - packageFee) / aggregateValue) * 100);
  }, [pkg, aggregateValue, packageFee]);

  const revenueStats = useMemo(() => {
    const totalRevenue = feeAccounts.reduce((s, a) => s + (a.total_fee || 0), 0);
    const collected    = feeAccounts.reduce((s, a) => s + (a.amount_paid || 0), 0);
    const pending      = feeAccounts.reduce((s, a) => s + (a.balance_due || 0), 0);
    return { totalRevenue, collected, pending };
  }, [feeAccounts]);

  const crumbs = useMemo(() => {
    if (!pkg) return [];
    return [...CRUMBS_TEMPLATE, { label: pkg.name }];
  }, [pkg]);

  // Mutation and router callbacks
  const handleEnrollStudent = useCallback(() => {
    navigate(`/admin/students/register?package_id=${id}`);
  }, [id, navigate]);

  const handleDeletePackage = useCallback(async () => {
    if (window.confirm('Are you sure you want to permanently delete this package? This action cannot be undone.')) {
      try {
        await deletePackageMutation.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: queryKeys.package.lists() });
        navigate('/admin/packages');
      } catch (err) {
        console.error('[PackageDetails] Failed to delete package:', err);
      }
    }
  }, [id, deletePackageMutation, navigate, queryClient]);

  const handleInvalidateDetails = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.package.detail(id) });
  }, [queryClient, id]);

  // Tab Registry (Hashmap sub-view memoization)
  const tabRegistry = useMemo(() => {
    if (!pkg) return {};
    
    return {
      Overview: (
        <PackageOverviewTab
          pkg={pkg}
          aggregateValue={aggregateValue}
          packageFee={packageFee}
          savingsPercent={savingsPercent}
          onEnroll={handleEnrollStudent}
          isMobile={isMobile}
        />
      ),
      'Included Courses': (
        <PackageCoursesTab
          courses={pkg.packageitems}
          isMobile={isMobile}
        />
      ),
      Enrollments: (
        <PackageEnrollmentsTab
          enrollments={enrollments}
          isLoading={isEnrollmentsLoading}
          isMobile={isMobile}
        />
      ),
      Revenue: (
        <PackageRevenueTab
          feeAccounts={feeAccounts}
          isLoading={isFeeLoading}
          totalRevenue={revenueStats.totalRevenue}
          collected={revenueStats.collected}
          pending={revenueStats.pending}
          isMobile={isMobile}
        />
      )
    };
  }, [
    pkg,
    aggregateValue,
    packageFee,
    savingsPercent,
    handleEnrollStudent,
    enrollments,
    isEnrollmentsLoading,
    feeAccounts,
    isFeeLoading,
    revenueStats,
    isMobile
  ]);

  // Mobile action bar configuration (WCAG compliant)
  const mobileActions = useMemo(() => [
    { 
      label: 'Edit', 
      icon: 'edit', 
      onClick: () => navigate(`/admin/packages/edit/${id}`), 
      variant: 'outlined' 
    },
    { 
      label: 'Add', 
      icon: 'add', 
      onClick: handleEnrollStudent, 
      variant: 'contained' 
    },
    { 
      label: 'Delete', 
      icon: 'delete', 
      onClick: handleDeletePackage, 
      variant: 'danger',
      loading: deletePackageMutation.isPending 
    }
  ], [id, navigate, handleEnrollStudent, handleDeletePackage, deletePackageMutation.isPending]);

  if (isLoading) return <LoadingState message="Fetching relational bundle data..." />;
  if (error) return <ErrorState message={error.message} onRetry={handleInvalidateDetails} />;
  if (!pkg) return <ErrorState message="Package not found" onRetry={handleInvalidateDetails} />;

  // Mobile layout viewport shell
  if (isMobile) {
    return (
      <MainLayout
        onBodyScroll={handleBodyScroll}
        header={
          <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky ? 'opacity-100 translate-y-0 shadow-md' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between rounded-b-xl">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => navigate('/admin/packages')} className="p-1 -ml-1 text-text-main dark:text-white">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">{pkg.name}</span>
              </div>
            </div>
          </div>
        }
        body={
          <div className="px-4 pt-4 pb-16 space-y-4 w-full text-text-main dark:text-white">
            {/* Mobile Header Block */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => navigate('/admin/packages')} className="p-1 -ml-2 text-text-main dark:text-white active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                  </button>
                  <div>
                    <h1 className="text-lg font-black tracking-tight leading-tight">{pkg.name}</h1>
                    <p className="text-[10px] font-mono text-text-secondary mt-0.5">{pkg.package_id}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black tracking-wider px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 rounded-full uppercase shrink-0">
                  {pkg.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Package Price Gradient Card with SVG Illustration */}
            <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/15 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm flex items-center justify-between overflow-hidden relative min-h-[120px]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Package Price</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                    ₹{packageFee.toLocaleString()}
                  </h2>
                  <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/30 uppercase tracking-wide">
                    {savingsPercent}% OFF
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary line-through font-medium">
                  ₹{aggregateValue.toLocaleString()}
                </p>
              </div>

              {/* Books & Graduation Cap Vector SVG Illustration */}
              <div className="w-28 h-20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 80" className="w-full h-full text-primary select-none" fill="currentColor">
                  {/* Stacked Book 1 (Blue) */}
                  <path d="M10,60 L90,60 L80,68 L20,68 Z" fill="#3b82f6" opacity="0.9" />
                  <rect x="20" y="68" width="60" height="4" fill="#1d4ed8" />
                  {/* Stacked Book 2 (Red) */}
                  <path d="M15,48 L85,48 L75,56 L25,56 Z" fill="#ef4444" opacity="0.9" />
                  <rect x="25" y="56" width="50" height="4" fill="#b91c1c" />
                  {/* Graduation Cap Box */}
                  <path d="M50,20 L80,30 L50,40 L20,30 Z" fill="#1e293b" />
                  <polygon points="50,30 50,48 53,48 53,30" fill="#1e293b" />
                  {/* Tassel */}
                  <path d="M50,30 L25,35 L24,45 L26,45 Z" fill="#eab308" />
                </svg>
              </div>
            </div>

            {/* $2x2 Stat Chips Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">group</span>
                </div>
                <div>
                  <p className="text-sm font-black">{isEnrollmentsLoading ? '...' : enrollments.length}</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Enrolled</p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">list_alt</span>
                </div>
                <div>
                  <p className="text-sm font-black">{pkg.courses?.length || 0}</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Subjects</p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                </div>
                <div>
                  <p className="text-sm font-black">{pkg.month} m</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Duration</p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <div>
                  <p className="text-sm font-black">Class {pkg.target_class || 'N/A'}</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Target</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Header */}
            <div className="sticky top-0 z-40 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark -mx-4 px-4 overflow-x-auto no-scrollbar">
              <nav className="flex space-x-6 py-1">
                {TABS_CONFIG.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-0.5 border-b-2 font-black text-xs flex items-center gap-1.5 transition-all whitespace-nowrap focus:outline-none ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
                  >
                    <span className="material-symbols-outlined text-base">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Views Persistent Viewport */}
            <div className="pt-2">
              {Object.entries(tabRegistry).map(([tabId, componentInstance]) => (
                <div 
                  key={tabId} 
                  className={activeTab === tabId ? "block animate-in fade-in duration-200" : "hidden"}
                >
                  {componentInstance}
                </div>
              ))}
            </div>
          </div>
        }
        footer={<ActionFooter actions={mobileActions} />}
      />
    );
  }

  // Desktop View layout
  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
            isSticky
              ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center gap-2 rounded-b-xl">
            <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
            <span className="text-sm font-bold text-text-main dark:text-white">{pkg.name}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase">{pkg.package_id}</span>
          </div>
        </div>
      }
      body={
        <div className="pt-6 lg:pt-10 pb-6 space-y-8 animate-in fade-in duration-500">
          
          {/* Breadcrumb & Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <Breadcrumbs items={crumbs} className="mb-1" />
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">{pkg.name}</h1>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                    {pkg.status}
                  </span>
                </div>
                <p className="text-text-secondary font-medium font-mono text-sm">
                  {pkg.package_id}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/admin/packages/edit/${pkg.package_id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-secondary font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 animate-in fade-in"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Edit Package
                </Link>
                <button 
                  type="button" 
                  onClick={handleDeletePackage}
                  disabled={deletePackageMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-950/30 transition-all shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Performance Indicators (Bento) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Total Enrolled', value: enrollments.length || '—', icon: 'person_add', color: 'blue', sub: 'Active enrollments' },
              { label: 'Completion Rate', value: '92%', icon: 'monitoring', color: 'rose', sub: 'Target: 95%' },
              { label: 'Total Revenue', value: revenueStats.totalRevenue ? `₹${revenueStats.totalRevenue.toLocaleString()}` : '—', icon: 'payments', color: 'emerald', sub: revenueStats.pending ? `(₹${revenueStats.pending.toLocaleString()} pending)` : 'No pending dues' }
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
              {TABS_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-5 text-sm font-black whitespace-nowrap transition-all relative ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-10">
              {/* Render all tabs in parallel using CSS visibility flags */}
              <div className="tabs-content-wrapper">
                {Object.entries(tabRegistry).map(([tabId, componentInstance]) => (
                  <div
                    key={tabId}
                    className={activeTab === tabId ? 'block' : 'hidden'}
                  >
                    {componentInstance}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default PackageDetails;
