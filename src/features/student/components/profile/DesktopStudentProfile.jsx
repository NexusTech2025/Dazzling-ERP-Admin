import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../../components/ui/Breadcrumbs';
import ProfileHeader from './ProfileHeader';

const VALID_TABS = ['Overview', 'Attendance', 'Fees', 'Performance', 'Documents'];

/**
 * DesktopStudentProfile: Pure presentation component for desktop viewport student profiles.
 */
export default function DesktopStudentProfile({
  student,
  activeTab,
  onTabChange,
  onOpenEdit,
  onDelete,
  breadcrumbItems,
  tabRegistry
}) {
  if (!student) return null;

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumbs items={breadcrumbItems} />

      <ProfileHeader
        student={student}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onEdit={onOpenEdit}
        onDelete={onDelete}
      />

      <div className="min-h-[400px]">
        {VALID_TABS.map((tabKey) => {
          const tabNode = tabRegistry?.[tabKey];

          if (!tabNode) {
            // Render Fallback Template for In-Development Tabs
            return (
              <div
                key={tabKey}
                className={activeTab === tabKey ? 'block animate-in fade-in zoom-in-95' : 'hidden'}
              >
                <div className="py-20 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                  <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">construction</span>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">{tabKey} Section</h3>
                  <p className="text-text-secondary">This module is currently under development.</p>
                </div>
              </div>
            );
          }

          return (
            <div key={tabKey} className={activeTab === tabKey ? 'block' : 'hidden'}>
              {tabNode}
            </div>
          );
        })}
      </div>
    </div>
  );
}

DesktopStudentProfile.propTypes = {
  student: PropTypes.object.isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onOpenEdit: PropTypes.func.isRequired,
  breadcrumbItems: PropTypes.array.isRequired,
  tabRegistry: PropTypes.object
};
