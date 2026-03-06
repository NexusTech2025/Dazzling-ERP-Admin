import React from 'react';
import Card from '../../../components/ui/Card';
import { FeeComponentInput, TaxInput } from './FinanceCards';
import SummarySidebar from './SummarySidebar';

const StructureStep = ({ structure, calculations, onUpdateStructure }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-2 space-y-8">
        <Card variant="background" className="p-8">
          <h3 className="text-xl font-black text-text-main dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            Base Fee Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeeComponentInput 
              label="Tuition Fee" 
              value={structure.tuition} 
              onChange={(val) => onUpdateStructure({ tuition: val })}
              icon="menu_book"
            />
            <FeeComponentInput 
              label="Admission Fee" 
              value={structure.admission} 
              onChange={(val) => onUpdateStructure({ admission: val })}
              icon="person_add"
            />
            <FeeComponentInput 
              label="Material Fee" 
              value={structure.materials} 
              onChange={(val) => onUpdateStructure({ materials: val })}
              icon="inventory_2"
            />
            <TaxInput 
              value={structure.taxPercent} 
              onChange={(val) => onUpdateStructure({ taxPercent: val })} 
            />
          </div>
        </Card>
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
          <span className="material-symbols-outlined text-primary">info</span>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">
            Define the core financial building blocks for this student. Taxes are calculated as a percentage of the total subtotal.
          </p>
        </div>
      </div>
      <div className="lg:col-span-1">
        <SummarySidebar data={{
          originalFee: calculations.subtotal,
          taxAmount: calculations.taxAmount,
          totalPayable: calculations.subtotal + calculations.taxAmount
        }} />
      </div>
    </div>
  );
};

export default StructureStep;
