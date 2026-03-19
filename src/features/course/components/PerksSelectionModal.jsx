import React, { useState } from 'react';
import masterPerksData from '../../../mockdata/academic/masterPerks.json';

/**
 * Modern Perks Selection Modal
 * Supports multi-selection from a library and custom perk creation.
 */
const PerksSelectionModal = ({ isOpen, onClose, onSelect, selectedPerks = [] }) => {
  const [tempSelected, setTempSelected] = useState(selectedPerks);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  if (!isOpen) return null;

  const togglePerk = (perk) => {
    const isAlreadySelected = tempSelected.find(p => p.perk_title === perk.perk_title);
    if (isAlreadySelected) {
      setTempSelected(prev => prev.filter(p => p.perk_title !== perk.perk_title));
    } else {
      setTempSelected(prev => [...prev, perk]);
    }
  };

  const handleAddCustom = () => {
    if (!customTitle) return;
    const newPerk = {
      perk_id: `CP-${Date.now()}`,
      perk_title: customTitle,
      perk_description: customDesc,
      icon: 'stars'
    };
    setTempSelected(prev => [...prev, newPerk]);
    setCustomTitle('');
    setCustomDesc('');
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Select Package Perks</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Value-added benefits library</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          {/* Library Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masterPerksData.MasterPerks.map((perk) => {
              const isSelected = tempSelected.find(p => p.perk_title === perk.perk_title);
              return (
                <button
                  key={perk.perk_id}
                  onClick={() => togglePerk(perk)}
                  className={`p-4 rounded-2xl border text-left transition-all flex gap-4 items-start relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-primary/40'
                  }`}
                >
                  <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-400 group-hover:text-primary'}`}>
                    <span className="material-symbols-outlined text-lg">{perk.icon}</span>
                  </div>
                  <div className="flex-1 pr-4">
                    <p className={`text-sm font-black transition-colors ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{perk.perk_title}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">{perk.perk_description}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-200">
                      <span className="material-symbols-outlined text-sm font-black">check_circle</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Perk Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Add Custom Perk</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="Perk Title (e.g. Weekly Workshop)" 
              />
              <input 
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="Brief Description" 
              />
            </div>
            <button 
              onClick={handleAddCustom}
              disabled={!customTitle}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95"
            >
              Add Custom Benefit
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            <span className="text-primary font-black">{tempSelected.length}</span> perks selected for this bundle
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
            <button onClick={handleConfirm} className="px-8 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerksSelectionModal;
