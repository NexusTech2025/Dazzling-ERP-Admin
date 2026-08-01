import React from 'react';
import PropTypes from 'prop-types';
import ProfileHero from '../../../../components/domain/ProfileHero';
import ScrollableRibbon from '../../../../components/ui/v2/ScrollableRibbon';
import DescriptionSection from '../../../../components/ui/v2/DescriptionSection';
import KeyValuePair from '../../../../components/ui/v2/KeyValuePair';
import SlottedEntityCard from '../../../../components/ui/v2/cards/SlottedEntityCard';
import KpiCard from '../../../../components/ui/v2/KpiCard';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/v2/Button';
import Avatar from '../../../../components/ui/v2/Avatar';
import { Timeline } from '../../../../components/ui/v2/Timeline';

import { StickyHeader } from '../../../../components/ui/v2/StickyHeader';
import IconButton from '../../../../components/ui/v2/IconButton';

import { parseISO, format, isValid } from 'date-fns';
import { enrollmentRepo } from '../../utils/enrollmentCacheHelper';
import { studentRepo } from '../../utils/studentCacheHelper';

const VALID_TABS = ['Overview', 'Attendance', 'Fees', 'Performance', 'Documents'];

function safeFormatDate(dateStr, formatPattern = 'MMM d, yyyy') {
  if (!dateStr) return 'N/A';
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return 'N/A';
    return format(parsed, formatPattern);
  } catch {
    return 'N/A';
  }
}

function extractEnrollmentFeeSummary(enr) {
  const enrId = enr.enrollment_id || enr.id;
  const repoEnr = enrollmentRepo.getByEnrollmentId(enrId);
  const feeAccounts = (enr.studentfeeaccounts && enr.studentfeeaccounts.length > 0)
    ? enr.studentfeeaccounts
    : (enr.StudentFeeAccount && enr.StudentFeeAccount.length > 0)
      ? enr.StudentFeeAccount
      : (repoEnr?.studentfeeaccounts || repoEnr?.StudentFeeAccount || []);

  if (!Array.isArray(feeAccounts) || feeAccounts.length === 0) {
    return null;
  }
  let totalDue = 0;
  feeAccounts.forEach((acc) => {
    totalDue += Number(acc.balance_due || 0);
  });
  return {
    totalDue,
    isPaid: totalDue === 0,
    label: totalDue === 0 ? 'Paid in Full' : `₹${totalDue.toLocaleString()} Due`
  };
}

function extractOverallFeeSummary(student) {
  if (!student || !Array.isArray(student.enrollments) || student.enrollments.length === 0) {
    return null;
  }
  let totalDue = 0;
  let hasAccounts = false;
  student.enrollments.forEach((enr) => {
    const enrId = enr.enrollment_id || enr.id;
    const repoEnr = enrollmentRepo.getByEnrollmentId(enrId);
    const feeAccounts = (enr.studentfeeaccounts && enr.studentfeeaccounts.length > 0)
      ? enr.studentfeeaccounts
      : (enr.StudentFeeAccount && enr.StudentFeeAccount.length > 0)
        ? enr.StudentFeeAccount
        : (repoEnr?.studentfeeaccounts || repoEnr?.StudentFeeAccount || []);

    feeAccounts.forEach((acc) => {
      hasAccounts = true;
      totalDue += Number(acc.balance_due || 0);
    });
  });

  if (!hasAccounts) return null;
  return {
    totalDue,
    isPaid: totalDue === 0,
    label: totalDue === 0 ? 'Paid' : `₹${totalDue.toLocaleString()}`
  };
}

/**
 * MobileStudentProfile: Pure presentation component for mobile viewport student profiles.
 */
export default function MobileStudentProfile({
  student,
  profileData,
  activeTab,
  onTabChange,
  onOpenEdit,
  onNavigateBack,
  tabRegistry
}) {
  if (!student) return null;

  // 1. Dynamic Active Enrollments Count
  const activeEnrollmentsCount = Array.isArray(profileData?.enrollments)
    ? profileData.enrollments.filter(e => (e.status || '').toLowerCase() === 'active').length
    : (profileData?.allocations?.length || 0);

  // 2. Dynamic Attendance Percentage from StudentRepo
  const attSummary = studentRepo.calculateSummarizedAttendanceScore(student);
  const attPercentage = attSummary.percentage !== null ? `${attSummary.percentage}%` : 'N/A';
  const attVariant = attSummary.percentage === null
    ? 'default'
    : attSummary.percentage >= 75
      ? 'success'
      : 'warning';

  // 3. Dynamic Qualification / CGPA from Education Records
  const topEdu = profileData?.education?.[0];
  const eduGrade = topEdu
    ? (topEdu.percentage_or_cgpa
      ? (Number(topEdu.percentage_or_cgpa) <= 1 && Number(topEdu.percentage_or_cgpa) > 0
        ? `${Math.round(Number(topEdu.percentage_or_cgpa) * 100)}%`
        : topEdu.percentage_or_cgpa)
      : topEdu.highest_qualification || 'N/A')
    : 'N/A';

  // 4. Dynamic Fee Status & Balance Due from EnrollmentRepo
  const feeSummary = extractOverallFeeSummary(student);
  const feeLabel = feeSummary ? feeSummary.label : 'N/A';
  const feeVariant = feeSummary ? (feeSummary.isPaid ? 'success' : 'warning') : 'default';

  return (
    <div className="space-y-6 pb-10 px-4 md:px-0">
      {/* Predefined Sticky Navigation Header */}
      <StickyHeader className="-mx-4 -mt-4 mb-7">
        <StickyHeader.Action onClick={onNavigateBack}>
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </StickyHeader.Action>
        <StickyHeader.InfoStack>
          <StickyHeader.Title>Student Profile</StickyHeader.Title>
        </StickyHeader.InfoStack>
        <StickyHeader.SideSlot>
          <IconButton icon="notifications" title="Notifications" />
          <IconButton icon="more_vert" title="Options" />
        </StickyHeader.SideSlot>
      </StickyHeader>

      {/* Slotted Profile Hero Section */}
      <ProfileHero className="shadow-md rounded-2xl p-5">
        {/* Tier 1: Identity & Avatar Slot */}
        <ProfileHero.Header>
          <Avatar
            src={student.avatarUrl}
            name={student.student_name}
            size="lg"
            status={student.status === 'active' ? 'online' : 'offline'}
          />
          <div className="flex flex-col min-w-0 flex-1 gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <ProfileHero.Title className="text-lg font-bold text-slate-900 dark:text-white">
                  {student.student_name}
                </ProfileHero.Title>
                <Badge variant={student.status === 'active' ? 'success' : 'default'} className="uppercase">
                  {student.status || 'ACTIVE'}
                </Badge>
              </div>
              <span className="material-symbols-outlined text-slate-400 hover:text-primary text-xl transition-colors shrink-0">
                chevron_right
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <ProfileHero.Identity idText={`STU-${student.student_id || student.id} • Student ID`} />
              {profileData?.enrollments?.[0]?.enrollment_id && (
                <ProfileHero.Identity idText={`ENR-${profileData.enrollments[0].enrollment_id} • Enrollment ID`} />
              )}
            </div>
          </div>
        </ProfileHero.Header>

        {/* Tier 2: Metadata Grid Slot (2x2 Grid) */}
        <ProfileHero.MetaGroup variant="grid" className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <ProfileHero.MetaItem
            icon="school"
            text={profileData?.enrollments?.[0]?.course_name || profileData?.allocations?.[0]?.course_name || 'Class 11 Physics (CBSE)'}
            iconColorClass="text-blue-500"
          />
          <ProfileHero.MetaItem
            icon="groups"
            text={profileData?.allocations?.[0]?.batch_name ? `${profileData.allocations[0].batch_name} • Morning` : 'Batch A • Morning Shift'}
            iconColorClass="text-indigo-500"
          />
          {/* <ProfileHero.MetaItem
            icon="bookmark"
            text={student.center_name || (profileData?.address?.city ? `${profileData.address.city} Center` : 'Jaipur Center')}
            iconColorClass="text-emerald-500"
          /> */}

        </ProfileHero.MetaGroup>

        {/* Tier 3: 4-KPI Metric Grid Slot */}
        <ProfileHero.KpiGrid className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <KpiCard
            label="Attendance"
            value={attPercentage}
            icon="analytics"
            variant={attVariant}
            size="sm"
          />
          <KpiCard
            label="Fee Status"
            value={feeLabel}
            icon="account_balance_wallet"
            variant={feeVariant}
            size="sm"
          />
          <KpiCard
            label="Next Due"
            value="10 Aug, 2026"
            icon="calendar_month"
            variant="info"
            size="sm"
          />
          <KpiCard
            label="Performance"
            value={eduGrade}
            icon="star"
            variant="primary"
            size="sm"
          />
        </ProfileHero.KpiGrid>

        {/* Tier 4: Quick Action Triggers Bar (5 Actions) */}
        <ProfileHero.Actions className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            size="sm"
            variant="outlined"
            startIcon="call"
            href={`tel:${student.phone || profileData?.contact?.mobile_number || ''}`}
            className="flex-1 rounded-xl text-xs h-10 border-slate-200 dark:border-slate-800"
          >
            Call
          </Button>
          <Button
            size="sm"
            variant="outlined"
            startIcon="chat"
            href={`https://wa.me/91${(student.phone || profileData?.contact?.mobile_number || '').replace(/\D/g, '')}`}
            className="flex-1 rounded-xl text-xs h-10 border-slate-200 dark:border-slate-800"
          >
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outlined"
            startIcon="edit"
            onClick={onOpenEdit}
            className="flex-1 rounded-xl text-xs h-10 border-slate-200 dark:border-slate-800"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outlined"
            startIcon="folder"
            onClick={() => onTabChange('Documents')}
            className="flex-1 rounded-xl text-xs h-10 border-slate-200 dark:border-slate-800"
          >
            Docs
          </Button>
          <Button
            size="sm"
            variant="outlined"
            startIcon="more_horiz"
            onClick={() => onTabChange('More')}
            className="w-10 shrink-0 rounded-xl h-10 px-0 border-slate-200 dark:border-slate-800"
          />
        </ProfileHero.Actions>
      </ProfileHero>

      {/* Tabs Swipe Ribbon */}
      <ScrollableRibbon className="border-b border-slate-100 dark:border-slate-800 pb-0">
        {VALID_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex items-center gap-1.5 pb-2.5 border-b-[3px] font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <span>{tab}</span>
          </button>
        ))}
      </ScrollableRibbon>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === 'Overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Personal Information */}
            <DescriptionSection
              title="Personal Information"
              icon="person"
              onActionClick={onOpenEdit}
            >
              <KeyValuePair label="Date of Birth" value={student.dob} fallback="N/A" className="items-start text-left" />
              <KeyValuePair label="Gender" value={student.gender} fallback="N/A" className="items-start text-left" />
              <KeyValuePair label="Email" value={profileData?.contact?.email || student.email} fallback="N/A" className="items-start text-left" />
              <KeyValuePair label="Phone" value={profileData?.contact?.mobile_number || student.phone} fallback="N/A" className="items-start text-left" />
              <KeyValuePair
                label="Address"
                value={
                  profileData?.address
                    ? `${profileData.address.line1 || ''}${profileData.address.line2 ? ', ' + profileData.address.line2 : ''}, ${profileData.address.city || ''}, ${profileData.address.state || ''} ${profileData.address.pin_code || ''}`
                    : 'N/A'
                }
                fallback="N/A"
                className="col-span-2 items-start text-left"
              />
            </DescriptionSection>

            {/* Guardian Information */}
            <DescriptionSection title="Guardian Information" icon="shield">
              <KeyValuePair label="Father's Name" value={student.father_name} fallback="N/A" className="items-start text-left" />
              <KeyValuePair label="Mother's Name" value={student.mother_name} fallback="N/A" className="items-start text-left" />
              <KeyValuePair label="Contact Number" value={profileData?.contact?.emergency_phone || profileData?.contact?.mobile_number || student.phone} fallback="N/A" className="items-start text-left" />
              <KeyValuePair
                label="Emergency Contact"
                value={
                  profileData?.contact?.emergency_phone
                    ? `${profileData.contact.emergency_name || 'Emergency'} (${profileData.contact.emergency_phone})`
                    : 'N/A'
                }
                fallback="N/A"
                className="items-start text-left"
              />
            </DescriptionSection>

            {/* Active Enrollments Slotted Cards */}
            {profileData?.enrollments && profileData.enrollments.length > 0 ? (
              profileData.enrollments.map((enr, idx) => {
                const enrId = enr.enrollment_id || enr.id || `ENR-${idx}`;
                const feeSummary = extractEnrollmentFeeSummary(enr);

                return (
                  <SlottedEntityCard
                    key={enrId}
                    icon="menu_book"
                    iconColor="text-primary"
                    title={enr.course_name || enr.enrollment_type || 'Active Enrollment'}
                    subtitle={`ID: ${enrId}`}
                    metaText={`Enrolled: ${safeFormatDate(enr.enrollment_date)}`}
                    badge={
                      <div className="flex flex-wrap items-center gap-1.5">
                        {feeSummary && (
                          <Badge variant={feeSummary.isPaid ? 'success' : 'warning'}>
                            {feeSummary.label}
                          </Badge>
                        )}
                        <Badge variant={(enr.status || '').toLowerCase() === 'active' ? 'success' : 'default'}>
                          {(enr.status || 'ACTIVE').toUpperCase()}
                        </Badge>
                      </div>
                    }
                  />
                );
              })
            ) : null}

            {/* Course & Batch Allocations (Placed below Active Enrollments) */}
            {profileData?.allocations && profileData.allocations.length > 0 ? (
              <DescriptionSection title="Assigned Courses & Batches" icon="groups">
                <div className="col-span-2 space-y-2.5">
                  {profileData.allocations.map((alloc, idx) => (
                    <div
                      key={alloc.allocation_id || idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-base">menu_book</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {alloc.course_name || 'Unassigned Course'}
                          </span>
                        </div>
                      </div>

                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-base">groups</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batch</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {alloc.batch_name || 'Unassigned Batch'}
                          </span>
                        </div>
                      </div>

                      <Badge variant={alloc.status === 'active' ? 'success' : 'default'} className="shrink-0 scale-90">
                        {(alloc.status || 'ACTIVE').toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </DescriptionSection>
            ) : null}

            {/* Academic Background Slotted Cards */}
            {profileData?.education && profileData.education.length > 0 ? (
              profileData.education.map((edu, idx) => (
                <SlottedEntityCard
                  key={edu.education_id || idx}
                  icon="school"
                  iconColor="text-amber-500"
                  title={edu.highest_qualification || 'Academic History'}
                  subtitle={edu.institution_name ? `Institution: ${edu.institution_name}` : 'School / College'}
                  metaText={`Passing Year: ${edu.year_of_passing || 'N/A'} • Grade: ${edu.percentage_or_cgpa || 'N/A'}`}
                />
              ))
            ) : null}

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Recent Activity</h3>
                <button type="button" className="text-sm font-semibold text-primary hover:underline">View All</button>
              </div>
              <Timeline
                items={[
                  {
                    time: 'Today, 10:45 AM',
                    title: 'Enrolled into Program',
                    description: 'Class 11 Science Bundle (CBSE) (PCM + English)',
                    color: 'bg-emerald-500',
                  },
                  {
                    time: 'Yesterday, 4:30 PM',
                    title: 'Profile Updated',
                    description: 'Personal information updated',
                    color: 'bg-primary',
                  },
                  {
                    time: '2 Days Ago',
                    title: 'Fee Received',
                    description: 'Admission fee payment received',
                    color: 'bg-amber-500',
                  },
                ]}
              />
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tags</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="info">Regular</Badge>
                <Badge variant="success">Verified</Badge>
                <Badge variant="primary">Scholarship</Badge>
                <Button size="sm" variant="outlined" startIcon="add">Add Tag</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'Overview' && (
          <div className="min-h-[300px]">
            {VALID_TABS.map((tabKey) => {
              if (tabKey === 'Overview') return null;
              const tabNode = tabRegistry?.[tabKey];

              if (!tabNode) {
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
        )}
      </div>
    </div>
  );
}

MobileStudentProfile.propTypes = {
  student: PropTypes.object.isRequired,
  profileData: PropTypes.object,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onOpenEdit: PropTypes.func.isRequired,
  onNavigateBack: PropTypes.func.isRequired,
  tabRegistry: PropTypes.object
};
