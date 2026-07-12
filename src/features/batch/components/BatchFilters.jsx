/**
 * @file BatchFilters.jsx
 * @description Atomic decomposed filter components for the ERP register sheets.
 * Allows pages to selectively import and assemble only the filters they need.
 */

import React from 'react';
import { SearchInput } from '../../../components/ui/filters';
import { Dropdown } from '../../../components/ui/v2/SelectDropdown';
import LowDensityCard from '../../../components/ui/v2/cards/LowDensityCard';

// 1. ATOMIC SEARCH FILTER
export function SearchFilter({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="md:col-span-3 relative">
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

// 2. ATOMIC ATTENDANCE STATUS FILTER
export function AttendanceStatusFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 border border-border-light dark:border-white/5 rounded-xl">
      {['ALL', 'P', 'A', 'L'].map(st => (
        <button
          key={st}
          onClick={() => onChange(st)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${value === st
            ? 'bg-white dark:bg-slate-700 text-text-main dark:text-white shadow-sm ring-1 ring-black/5'
            : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
            }`}
        >
          {st === 'ALL' ? 'All' : st === 'P' ? 'Present' : st === 'A' ? 'Absent' : 'Late'}
        </button>
      ))}
    </div>
  );
}

// 3. ATOMIC SEGMENT FILTER
export function SegmentFilter({ value, onChange, segments = [] }) {
  return (
    <div className="w-[160px]">
      <Dropdown
        items={segments.map(seg => ({ id: seg, name: seg }))}
        selectedId={value}
        onChange={onChange}
        idProp="id"
        labelProp="name"
        searchFields={["name"]}
      >
        <Dropdown.Trigger placeholder="All Segments" labelProp="name" />
        <Dropdown.Menu>
          <Dropdown.Search />
          <Dropdown.Items>
            {(item, index, { setIsOpen, setSearchTerm, selectedId, idProp }) => {
              const isSelected = String(item.id) === String(selectedId);
              return (
                <Dropdown.Item
                  key={item.id}
                  item={item}
                  index={index}
                  idProp={idProp}
                  selectedId={selectedId}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="py-2.5 px-4 text-xs font-bold text-text-main dark:text-white flex items-center justify-between">
                    <span>{item.name}</span>
                    {isSelected && <span className="material-symbols-outlined text-sm text-primary">check</span>}
                  </div>
                </Dropdown.Item>
              );
            }}
          </Dropdown.Items>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

// 4. ATOMIC CLASS FILTER
export function ClassFilter({ value, onChange, classes = [] }) {
  return (
    <div className="w-[140px]">
      <Dropdown
        items={classes.map(cl => ({ id: cl, name: `Class ${cl}` }))}
        selectedId={value}
        onChange={onChange}
        idProp="id"
        labelProp="name"
        searchFields={["name"]}
      >
        <Dropdown.Trigger placeholder="All Classes" labelProp="name" />
        <Dropdown.Menu>
          <Dropdown.Search />
          <Dropdown.Items>
            {(item, index, { setIsOpen, setSearchTerm, selectedId, idProp }) => {
              const isSelected = String(item.id) === String(selectedId);
              return (
                <Dropdown.Item
                  key={item.id}
                  item={item}
                  index={index}
                  idProp={idProp}
                  selectedId={selectedId}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="py-2.5 px-4 text-xs font-bold text-text-main dark:text-white flex items-center justify-between">
                    <span>{item.name}</span>
                    {isSelected && <span className="material-symbols-outlined text-sm text-primary">check</span>}
                  </div>
                </Dropdown.Item>
              );
            }}
          </Dropdown.Items>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

// 5. ATOMIC BOARD FILTER
export function BoardFilter({ value, onChange, boards = [] }) {
  return (
    <div className="w-[140px]">
      <Dropdown
        items={boards.map(b => ({ id: b, name: b }))}
        selectedId={value}
        onChange={onChange}
        idProp="id"
        labelProp="name"
        searchFields={["name"]}
      >
        <Dropdown.Trigger placeholder="All Boards" labelProp="name" />
        <Dropdown.Menu>
          <Dropdown.Search />
          <Dropdown.Items>
            {(item, index, { setIsOpen, setSearchTerm, selectedId, idProp }) => {
              const isSelected = String(item.id) === String(selectedId);
              return (
                <Dropdown.Item
                  key={item.id}
                  item={item}
                  index={index}
                  idProp={idProp}
                  selectedId={selectedId}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="py-2.5 px-4 text-xs font-bold text-text-main dark:text-white flex items-center justify-between">
                    <span>{item.name}</span>
                    {isSelected && <span className="material-symbols-outlined text-sm text-primary">check</span>}
                  </div>
                </Dropdown.Item>
              );
            }}
          </Dropdown.Items>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

// 6. ATOMIC BATCH FILTER
export function BatchFilter({ value, onChange, batches = [], dropdownWidth = "w-[380px] md:w-[420px]" }) {
  return (
    <div className="w-[180px]">
      <Dropdown
        items={batches}
        selectedId={value}
        onChange={onChange}
        idProp="batch_id"
        labelProp="batch_name"
        searchFields={["batch_name"]}
      >
        <Dropdown.Trigger
          placeholder="Select Batch"
          labelProp="batch_name"
          dropdownWidth={dropdownWidth}
        />
        <Dropdown.Menu dropdownWidth={dropdownWidth}>
          <Dropdown.Search />
          <Dropdown.Items itemHeight={85} maxItems={3}>
            {(item, index, { setIsOpen, setSearchTerm, selectedId, idProp }) => {
              const isSelected = String(item.batch_id) === String(selectedId);
              const initials = item.batch_name ? item.batch_name.substring(0, 2).toUpperCase() : "BT";
              return (
                <Dropdown.Item
                  key={item.batch_id}
                  item={item}
                  index={index}
                  idProp={idProp}
                  selectedId={selectedId}
                  onClick={() => {
                    onChange(item.batch_id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <LowDensityCard
                    variant="selection-card"
                    title={item.batch_name}
                    subtitle1={`Class ${item.class_level || 11}`}
                    subtitle2={`${item.course?.metadata?.medium || 'English'} • ${item.branch_name || 'Main Campus'}`}
                    avatarText={initials}
                    enrolled={item.enrolled_students || 0}
                    capacity={item.capacity || 30}
                    isSelected={isSelected}
                  />
                </Dropdown.Item>
              );
            }}
          </Dropdown.Items>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
