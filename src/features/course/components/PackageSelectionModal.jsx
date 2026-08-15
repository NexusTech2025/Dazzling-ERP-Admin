import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextInput from '../../../components/ui/v2/TextInput';
import SelectInput from '../../../components/ui/v2/SelectInput';
import Button from '../../../components/ui/v2/Button';
import Badge from '../../../components/ui/Badge';
import { Tag } from '../../../components/ui/v2/indicators';

const boardOptions = [
  { label: 'All Boards', value: '' },
  { label: 'CBSE', value: 'CBSE' },
  { label: 'RBSE', value: 'RBSE' },
  { label: 'ICSE', value: 'ICSE' },
  { label: 'IB', value: 'IB' }
];

const classOptions = [
  { label: 'All Classes', value: '' },
  ...[...Array(12)].map((_, i) => ({
    label: `Class ${i + 1}`,
    value: String(i + 1)
  }))
];

/**
 * PackageSelectionModal - A premium responsive modal for selecting academic packages.
 * 
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Controls modal visibility.
 * @param {function} props.onClose - Callback function to close modal.
 * @param {function} props.onSelect - Callback function receiving selected package object or array.
 * @param {Array<object>|object} [props.selectedPackages=[]] - Currently selected package(s).
 * @param {Array<object>} [props.availablePackages=[]] - List of available package records.
 * @param {boolean} [props.singleSelect=true] - Switch for single vs multi-selection mode.
 */
export default function PackageSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedPackages = [],
  availablePackages = [],
  singleSelect = true
}) {
  const [tempSelected, setTempSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Normalize package array input
  const packagesList = useMemo(() => {
    if (Array.isArray(availablePackages)) return availablePackages;
    if (availablePackages && Array.isArray(availablePackages.data)) return availablePackages.data;
    if (availablePackages && Array.isArray(availablePackages.items)) return availablePackages.items;
    return [];
  }, [availablePackages]);

  // Sync tempSelected state when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('[PackageSelectionModal] Opening modal with packages:', availablePackages);
      const initial = Array.isArray(selectedPackages)
        ? selectedPackages
        : (selectedPackages ? [selectedPackages] : []);
      setTempSelected(initial);
    }
  }, [isOpen, selectedPackages, availablePackages]);

  // Filtering Logic
  const filteredPackages = useMemo(() => {
    return packagesList.filter(pkg => {
      const name = pkg.name || pkg.package_name || '';
      const id = pkg.package_id || pkg.id || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        id.toLowerCase().includes(searchQuery.toLowerCase());

      const pkgBoard = String(pkg.board || pkg.metadata?.board || '').trim();
      const matchesBoard = !boardFilter || pkgBoard.toLowerCase() === boardFilter.toLowerCase();

      const pkgClass = String(pkg.target_class || pkg.class || pkg.metadata?.class || '').trim();
      const matchesClass = !classFilter || pkgClass.toLowerCase() === classFilter.toLowerCase();

      return matchesSearch && matchesBoard && matchesClass;
    });
  }, [packagesList, searchQuery, boardFilter, classFilter]);

  if (!isOpen) return null;

  const togglePackage = (pkg) => {
    const pkgId = pkg.package_id || pkg.id;
    if (singleSelect) {
      setTempSelected([pkg]);
      return;
    }
    const isAlreadySelected = tempSelected.some(p => (p.package_id || p.id) === pkgId);
    if (isAlreadySelected) {
      setTempSelected(prev => prev.filter(p => (p.package_id || p.id) !== pkgId));
    } else {
      setTempSelected(prev => [...prev, pkg]);
    }
  };

  const handleConfirm = () => {
    onSelect(singleSelect ? (tempSelected[0] || null) : tempSelected);
    onClose();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setBoardFilter('');
    setClassFilter('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full h-[100dvh] sm:h-[85vh] md:max-w-5xl rounded-none sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                {singleSelect ? 'Select Package' : 'Package Catalog'}
              </h3>
              <p className="text-xs text-text-secondary font-medium uppercase tracking-widest mt-1.5 leading-tight">
                {singleSelect
                  ? 'Choose an academic package contract to assign to student'
                  : 'Select packages from the directory'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        </div>

        {/* Main Body - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar Filters (1/3) */}
          <aside className="w-full sm:w-72 border-r border-slate-100 dark:border-slate-800 p-6 space-y-5 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            {/* Search */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">Search</span>
              <TextInput
                placeholder="ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="search"
                className="bg-white dark:bg-slate-800"
              />
            </div>

            {/* Board Filter */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">Board</span>
              <SelectInput
                options={boardOptions}
                value={boardFilter}
                onChange={(val) => setBoardFilter(typeof val === 'object' && val?.target ? val.target.value : val)}
                placeholder="All Boards"
              />
            </div>

            {/* Class Filter */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">Grade Level</span>
              <SelectInput
                options={classOptions}
                value={classFilter}
                onChange={(val) => setClassFilter(typeof val === 'object' && val?.target ? val.target.value : val)}
                placeholder="All Classes"
              />
            </div>

            {/* Reset Filters Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              Reset Filters
            </button>
          </aside>

          {/* Right Grid Content (2/3) */}
          <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 custom-scrollbar flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400">
                Showing {filteredPackages.length} packages
              </span>
            </div>

            {filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPackages.map((pkg) => {
                  const pkgId = pkg.package_id || pkg.id;
                  const isSelected = tempSelected.some(p => (p.package_id || p.id) === pkgId);
                  const coursesCount = Array.isArray(pkg.courses)
                    ? pkg.courses.length
                    : (Array.isArray(pkg.packageitems)
                      ? pkg.packageitems.length
                      : (Array.isArray(pkg.package_items) ? pkg.package_items.length : 0));
                  const price = Number(pkg.package_fee || pkg.total_fee || pkg.fee || pkg.price || pkg.base_fee || 0);

                  return (
                    <div
                      key={pkgId}
                      onClick={() => togglePackage(pkg)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            isSelected ? 'bg-purple-500 text-white' : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            <span className="material-symbols-outlined">inventory_2</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                              {pkg.name || pkg.package_name}
                            </h4>
                            <span className="text-xs font-mono text-slate-400">{pkgId}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-purple-500 font-bold">check_circle</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {pkg.target_class && <Tag variant="info">Class {pkg.target_class}</Tag>}
                        {pkg.board && <Tag variant="default">{pkg.board}</Tag>}
                        {coursesCount > 0 && <Tag variant="primary">{coursesCount} Courses</Tag>}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-text-secondary">Package Fee</span>
                        <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                          ₹{price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-text-secondary">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                <p className="text-xs font-bold">No matching packages found.</p>
              </div>
            )}
          </main>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-text-secondary font-medium">
            {tempSelected.length > 0 ? (
              <span className="font-bold text-purple-600 dark:text-purple-400">
                1 Package Selected: {tempSelected[0]?.name || tempSelected[0]?.package_name}
              </span>
            ) : (
              <span>No package selected</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="contained"
              disabled={tempSelected.length === 0}
              onClick={handleConfirm}
              startIcon="check"
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

PackageSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedPackages: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  availablePackages: PropTypes.array,
  singleSelect: PropTypes.bool
};
