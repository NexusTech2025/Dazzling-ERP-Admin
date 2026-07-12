import React from 'react';
import { SearchInput } from '../../../../components/ui/filters';
import { Dropdown } from '../../../../components/ui/v2/SelectDropdown';
import LowDensityCard from '../../../../components/ui/v2/cards/LowDensityCard';

export const AttendanceFilterBar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  batches,
  selectedBatchId,
  setSelectedBatchId,
  selectedDate,
  setSelectedDate,
}) => {
  return (
    <>
      <div className="col-span-12 md:col-span-4 relative">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search teacher..."
        />
      </div>
      
      <div className="col-span-12 md:col-span-8 flex flex-wrap gap-3 items-center justify-start md:justify-end w-full">
        {/* Status Selection Pill Buttons Row */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 border border-border-light dark:border-white/5 rounded-xl">
          {['ALL', 'P', 'A', 'L'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                statusFilter === st 
                  ? 'bg-white dark:bg-slate-700 text-text-main dark:text-white shadow-sm ring-1 ring-black/5' 
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'P' ? 'Present' : st === 'A' ? 'Absent' : 'Late'}
            </button>
          ))}
        </div>

        {/* Academic Cohort Selection Dropdown */}
        <div className="w-[180px]">
          <Dropdown
            items={batches}
            selectedId={selectedBatchId}
            onChange={setSelectedBatchId}
            idProp="batch_id"
            labelProp="batch_name"
            searchFields={["batch_name"]}
          >
            <Dropdown.Trigger placeholder="Select Batch" labelProp="batch_name" dropdownWidth="w-[340px] md:w-[420px]" />
            <Dropdown.Menu dropdownWidth="w-[340px] md:w-[420px]">
              <Dropdown.Search />
              <Dropdown.Items>
                {(item, index, { setIsOpen, setSearchTerm, selectedId, idProp }) => (
                  <Dropdown.Item
                    key={item.batch_id}
                    item={item}
                    index={index}
                    idProp={idProp}
                    selectedId={selectedId}
                    onClick={() => {
                      setSelectedBatchId(item.batch_id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <LowDensityCard 
                      variant="selection-card"
                      title={item.batch_name}
                      subtitle1={`Class ${item.class_level || 11}`}
                      avatarText={item.batch_name ? item.batch_name.substring(0, 2).toUpperCase() : "BT"}
                      isSelected={String(item.batch_id) === String(selectedId)}
                    />
                  </Dropdown.Item>
                )}
              </Dropdown.Items>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Date Ingestion Selection Field */}
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-4 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
        />
      </div>
    </>
  );
};
