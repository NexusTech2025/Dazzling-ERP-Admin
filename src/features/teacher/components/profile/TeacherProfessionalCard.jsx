import React from 'react';
import Card from '../../../../components/ui/Card';
import KeyValuePair from '../../../../components/ui/v2/KeyValuePair';

/**
 * TeacherProfessionalCard: Displays HR and professional history details.
 * New component to cover missing schema fields.
 */
const TeacherProfessionalCard = ({ teacher }) => {
  return (
    <Card className="h-full">
      <Card.Header className="flex items-center gap-2 border-b border-border-light dark:border-border-dark">
        <span className="material-symbols-outlined text-text-secondary text-xl">work</span>
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Professional Background
        </h3>
      </Card.Header>
      
      <Card.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <KeyValuePair 
            label="Experience" 
            value={teacher.experience_years ? `${teacher.experience_years} Years` : 'N/A'} 
            icon="history"
          />
          <KeyValuePair 
            label="Qualification" 
            value={teacher.designation} 
            icon="school"
          />
          <KeyValuePair 
            label="Specialization" 
            value={teacher.specialization} 
            icon="psychology"
            className="col-span-2"
          />
          <KeyValuePair 
            label="Previous Institute" 
            value={teacher.previous_institute} 
            icon="corporate_fare"
            fallback="No record provided"
            className="col-span-2"
          />
        </div>
      </Card.Body>
      
      {teacher.metadata?.internal_notes && (
        <Card.Footer bg className="border-t border-border-light dark:border-border-dark">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Administrative Notes</span>
            <p className="text-xs text-text-main dark:text-slate-300 italic font-medium leading-relaxed">
              "{teacher.metadata.internal_notes}"
            </p>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default TeacherProfessionalCard;
