import React from 'react';
import Card from '../../../../components/ui/Card';

const AcademicBackground = ({ education }) => (
  <Card className="p-6">
    <h3 className="text-text-main dark:text-white text-xl font-bold mb-6">Academic Background</h3>
    <div className="space-y-4">
      {education?.length > 0 ? education.map((edu, idx) => (
        <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark">
          <div>
            <p className="font-bold text-text-main dark:text-white">{edu.highest_qualification} - {edu.institution_name}</p>
            <p className="text-xs text-text-secondary mt-0.5">Passing Year: {edu.year_of_passing}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-primary">{edu.percentage_or_cgpa}%</span>
          </div>
        </div>
      )) : (
        <p className="text-sm text-text-secondary italic">No education records found.</p>
      )}
    </div>
  </Card>
);

export default AcademicBackground;
