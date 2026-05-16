import React from 'react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/v2/Button';

/**
 * TeacherDocumentsCard: Lists teacher's documents from schema.
 */
const TeacherDocumentsCard = ({ documents = [] }) => {
  return (
    <Card className="h-full">
      <Card.Header className="flex items-center justify-between border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl">description</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Documents & Attachments
          </h3>
        </div>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded">
          {documents.length} FILES
        </span>
      </Card.Header>
      
      <Card.Body className="p-0">
        <div className="divide-y divide-border-light dark:divide-border-dark">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-background-light dark:bg-background-dark flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">
                      {doc.type === 'id_proof' ? 'badge' : 'article'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main dark:text-white">{doc.name}</p>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Uploaded on {doc.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="text" size="sm" startIcon="visibility">View</Button>
                  <Button variant="text" size="sm" startIcon="download">Get</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-slate-300 text-4xl">folder_off</span>
              <p className="text-sm text-text-secondary font-medium">No documents uploaded yet.</p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeacherDocumentsCard;
