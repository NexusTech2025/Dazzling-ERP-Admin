import React from 'react';
import StudentCard from '../../features/student/components/StudentCard';
import TeacherCard from '../../features/teacher/components/TeacherCard';
import CourseCardV2 from '../../features/course/components/CourseCardV2';
import BatchCardV2 from '../../features/batch/components/BatchCardV2';
import FinanceCard from '../../features/finance/components/FinanceCard';
import { CircularProgress, BarChartTrend } from '../../components/ui/v2/cards';
import { Badge, Tag, Chip } from '../../components/ui/v2/indicators';

const TestCardsCatalog = () => {
  // Mock Data
  const studentData = {
    student_name: 'Leo Sterling',
    student_id: 'STU-001',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDmd73KtkM26k3dn3IOITvGOOODSgXEB5CTNm_sjP7-oCiSv_RVzQYTxlSybIIdVBDBgKKom5eg5yiOFCPpoF6wBh73u7ygKIMZEuwvZXlFUF05gYbh0CZkxjObF46h8WPtS1DDH9WFaAI6zklyG7vHTNS7d8wGXu6t0QN2on6BQUXOBUpe5_un3RC6B0T6qYAgCJ7cDYBAOlpk-o1kCjAdQ6TqLtX2SQcGfbGPTpX9yxVfZKGP0E27J4xlTLt8y8RfTaDFu2Jy0T_',
    email: 'leo.sterling@dazzling.com',
    phone: '+91 98765 43210',
    current_class: 'Class 12',
    stream: 'Computer Science',
    attendance_percentage: 94.2,
    joined_date: 'Aug 12, 2021',
    grade_average: '8.5/10',
    outstanding_balance: 45200,
    balance_percent: 65,
    is_registered: true,
    status: 'Active',
    board: 'CBSE'
  };

  const teacherData = {
    teacher_name: 'Dr. Silas Vane',
    teacher_id: 'TCH-882',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEgQ2xnGOJS31vq02jkC5Kl4-UjM6VAt9iKsdu6i8jnRg9JK5Kyi6zbPuWf7QdPYowLenai4MGiTfzZXzVrDiqC2g3YdYj1dZyQVYvZeJzJ8Wn1SjprQox51j3Lk1BeVnit71Y-qXWx8QQzF9MPQqJDdYYjVFDCAV2b2cf30t--oyA82m73BYsLGHkIP_ThoboE_Lc8z4A9Rgtbo-OBEw4AKpq7pGDEE8A0YyJhY_T-4Paj1g_1DxcJA',
    email: 'silas.vane@dazzling.com',
    phone: '+91 99988 87766',
    department: 'Behavioral Analytics',
    title_role: 'Chief Academic Officer',
    courses_count: 12,
    budget_access: '$2.4M (Restricted)',
    clearance_level: 'Level 5 Alpha',
    biography: 'Dr. Vane oversees the integration of quantitative assessment protocols across all financial modeling curricula. Currently managing a portfolio of 12 primary research grants totaling approximately $14.2M in annual fiscal commitments.',
    is_active: true
  };

  const courseData = {
    name: 'Advanced Quantum Physics',
    course_id: 'COURSE-M10',
    base_fee: 15000,
    instructor_name: 'Dr. Emily Blunt',
    duration_value: 12,
    duration_unit: 'Weeks',
    syllabus_completion: 78,
    status: 'Active'
  };

  const batchData = {
    batch_name: 'Quantum Physics - Morning A',
    batch_id: 'BAT-PHY-12A',
    course_name: 'Advanced Quantum Physics',
    teacher_name: 'Prof. Marcus Aurelius',
    timing: 'Mon-Wed-Fri 08:00 AM',
    branch_name: 'Main Campus',
    enrollment_count: 18,
    capacity: 30
  };

  const transactionData = {
    payment_method: 'UPI (Google Pay)',
    transaction_id: 'TXN-90281-UPI',
    amount: 12500,
    date: 'June 13, 2026, 11:30 AM',
    status: 'success',
    student_name: 'Arthur Sterling',
    category: 'Financial Analyst',
    installments_percent: 75,
    trend: { value: '12%', direction: 'up' },
    notes: 'This transaction represents tuition collection fee installment 1. Verified and settled by the automated ledger sync.'
  };

  // Sections list for side/top nav quick jump
  const sections = [
    { id: 'students', label: 'Students', icon: 'school' },
    { id: 'teachers', label: 'Teachers', icon: 'person' },
    { id: 'courses', label: 'Courses', icon: 'auto_stories' },
    { id: 'batches', label: 'Batches', icon: 'groups' },
    { id: 'finance', label: 'Finance', icon: 'payments' },
    { id: 'indicators', label: 'Indicators Suite', icon: 'badge' },
    { id: 'widgets', label: 'Dashboard Widgets', icon: 'dashboard' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-12 pb-32">
      {/* Header Banner */}
      <div className="border-b border-border-light dark:border-border-dark pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-text-main dark:text-white">Unified V2 Cards Showroom</h1>
            <p className="text-text-secondary dark:text-slate-400 mt-1.5 text-sm">
              Showcase catalog displaying all V2 component layouts, visual densities, and responsive adapters. Integrates natively with the application's light/dark modes.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Sandbox Environment
            </span>
          </div>
        </div>

        {/* Quick jump tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {sections.map(sec => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark text-xs font-bold text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/30 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">{sec.icon}</span>
              {sec.label}
            </a>
          ))}
        </div>
      </div>

      {/* Render Sections */}
      <div className="space-y-16">
        {/* STUDENTS SECTION */}
        <section id="students" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border-light/60 dark:border-border-dark/60 pb-3">
            <span className="material-symbols-outlined text-primary text-2xl">school</span>
            <h2 className="text-xl font-bold text-text-main dark:text-white">Student Cards & Densities</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Low Density</p>
                <StudentCard student={studentData} density="low" onClick={() => alert('Student Clicked')} onMessage={() => alert('Sending message to student...')} onEdit={() => alert('Editing student records...')} onHistory={() => alert('Opening student ledger history...')} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Medium Density</p>
                <StudentCard student={studentData} density="medium" onClick={() => alert('Student Clicked')} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">High Density</p>
              <StudentCard
                student={studentData}
                density="high"
                onClick={() => alert('Student Profile Clicked')}
                onMessage={() => alert('Sending message to student...')}
                onEdit={() => alert('Editing student records...')}
                onHistory={() => alert('Opening student ledger history...')}
              />
            </div>
          </div>
        </section>

        {/* TEACHERS SECTION */}
        <section id="teachers" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border-light/60 dark:border-border-dark/60 pb-3">
            <span className="material-symbols-outlined text-primary text-2xl">person</span>
            <h2 className="text-xl font-bold text-text-main dark:text-white">Teacher Cards & Densities</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Low Density</p>
                <TeacherCard teacher={teacherData} density="low" onClick={() => alert('Teacher Clicked')} onMessage={() => alert('Sending email to teacher...')} onEdit={() => alert('Editing teacher records...')} onHistory={() => alert('Opening teacher class logs...')} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Medium Density</p>
                <TeacherCard teacher={teacherData} density="medium" onClick={() => alert('Teacher Clicked')} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">High Density</p>
              <TeacherCard
                teacher={teacherData}
                density="high"
                onClick={() => alert('Teacher Profile Clicked')}
                onMessage={() => alert('Sending email to teacher...')}
                onEdit={() => alert('Editing teacher records...')}
                onHistory={() => alert('Opening teacher class logs...')}
              />
            </div>
          </div>
        </section>

        {/* COURSES SECTION */}
        <section id="courses" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border-light/60 dark:border-border-dark/60 pb-3">
            <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
            <h2 className="text-xl font-bold text-text-main dark:text-white">Course Cards & Densities</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Low Density</p>
                <CourseCardV2 course={courseData} density="low" onClick={() => alert('Course Clicked')} onAssign={() => alert('Assigning course task...')} onEdit={() => alert('Editing course...')} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Medium Density</p>
                <CourseCardV2 course={courseData} density="medium" onClick={() => alert('Course Clicked')} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">High Density</p>
              <CourseCardV2
                course={courseData}
                density="high"
                onClick={() => alert('Course Curriculum Clicked')}
                onAssign={() => alert('Assigning course task...')}
              />
            </div>
          </div>
        </section>

        {/* BATCHES SECTION */}
        <section id="batches" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border-light/60 dark:border-border-dark/60 pb-3">
            <span className="material-symbols-outlined text-primary text-2xl">groups</span>
            <h2 className="text-xl font-bold text-text-main dark:text-white">Batch Cards & Densities</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Low Density</p>
                <BatchCardV2 batch={batchData} density="low" onClick={() => alert('Batch Clicked')} onRoster={() => alert('Opening batch roster...')} onSchedule={() => alert('Opening batch scheduler...')} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Medium Density</p>
                <BatchCardV2 batch={batchData} density="medium" onClick={() => alert('Batch Clicked')} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">High Density</p>
              <BatchCardV2
                batch={batchData}
                density="high"
                onClick={() => alert('Opening batch roster...')}
                onSchedule={() => alert('Opening batch scheduler...')}
              />
            </div>
          </div>
        </section>

        {/* FINANCE SECTION */}
        <section id="finance" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border-light/60 dark:border-border-dark/60 pb-3">
            <span className="material-symbols-outlined text-primary text-2xl">payments</span>
            <h2 className="text-xl font-bold text-text-main dark:text-white">Finance / Transaction Cards & Densities</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Low Density</p>
                <FinanceCard transaction={transactionData} density="low" onClick={() => alert('Transaction Clicked')} onReceipt={() => alert('Printing invoice receipt...')} onRefund={() => alert('Processing transaction refund...')} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Medium Density</p>
                <FinanceCard transaction={transactionData} density="medium" onClick={() => alert('Transaction Clicked')} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">High Density</p>
              <FinanceCard
                transaction={transactionData}
                density="high"
                onClick={() => alert('Opening receipt details...')}
                onReceipt={() => alert('Printing invoice receipt...')}
                onRefund={() => alert('Processing transaction refund...')}
              />
            </div>
          </div>
        </section>

        {/* INDICATORS SECTION */}
        <section id="indicators" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border-light/60 dark:border-border-dark/60 pb-3">
            <span className="material-symbols-outlined text-primary text-2xl">badge</span>
            <h2 className="text-xl font-bold text-text-main dark:text-white">Indicators Component Suite (V2)</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-xl p-6 space-y-8">
            {/* BADGES */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-main dark:text-white border-b border-border-light dark:border-border-dark pb-1.5">
                Badges (&lt;Badge&gt;)
              </h3>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Status Badges (Default Size sm)</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="status" color="primary" content="Primary" />
                    <Badge variant="status" color="secondary" content="Secondary / Success" />
                    <Badge variant="status" color="warning" content="Warning" />
                    <Badge variant="status" color="error" content="Error" />
                    <Badge variant="status" color="neutral" content="Neutral" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Sizes (sm / md / lg)</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="status" color="primary" content="Small (sm)" size="sm" />
                    <Badge variant="status" color="primary" content="Medium (md)" size="md" />
                    <Badge variant="status" color="primary" content="Large (lg)" size="lg" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Numeric Counts</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="count" color="error" content="5" size="sm" />
                    <Badge variant="count" color="primary" content="99+" size="md" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Overlay Pulsing Dots</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="dot" color="secondary" pulsing={true} placement="top-right">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold">U</div>
                    </Badge>
                    <Badge variant="dot" color="error" pulsing={true} placement="top-right">
                      <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded border border-border-light dark:border-border-dark text-xs">Inbox</div>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* TAGS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-main dark:text-white border-b border-border-light dark:border-border-dark pb-1.5">
                Tags (&lt;Tag&gt;)
              </h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Subtle Style (Default Size sm)</span>
                    <div className="flex flex-wrap gap-2">
                      <Tag variant="subtle" color="primary" label="Primary" />
                      <Tag variant="subtle" color="secondary" label="Success" />
                      <Tag variant="subtle" color="warning" label="Warning" />
                      <Tag variant="subtle" color="error" label="Error" />
                      <Tag variant="subtle" color="neutral" label="Neutral" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Outlined Style</span>
                    <div className="flex flex-wrap gap-2">
                      <Tag variant="outlined" color="primary" label="Primary" />
                      <Tag variant="outlined" color="secondary" label="Success" />
                      <Tag variant="outlined" color="warning" label="Warning" />
                      <Tag variant="outlined" color="error" label="Error" />
                      <Tag variant="outlined" color="neutral" label="Neutral" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Filled Style</span>
                    <div className="flex flex-wrap gap-2">
                      <Tag variant="filled" color="primary" label="Primary" />
                      <Tag variant="filled" color="secondary" label="Success" />
                      <Tag variant="filled" color="warning" label="Warning" />
                      <Tag variant="filled" color="error" label="Error" />
                      <Tag variant="filled" color="neutral" label="Neutral" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 border-t border-border-light/40 dark:border-border-dark/40 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Sizes (sm / md / lg)</span>
                    <div className="flex items-center gap-2">
                      <Tag variant="subtle" color="primary" label="Small (sm)" size="sm" />
                      <Tag variant="subtle" color="primary" label="Medium (md)" size="md" />
                      <Tag variant="subtle" color="primary" label="Large (lg)" size="lg" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Custom Icons</span>
                    <div className="flex items-center gap-2">
                      <Tag variant="subtle" color="primary" label="Home" icon="home" />
                      <Tag variant="subtle" color="secondary" label="Settings" icon="settings" />
                      <Tag variant="outlined" color="warning" label="Warning" icon="warning" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Clickable Interaction</span>
                    <div className="flex items-center gap-2">
                      <Tag variant="filled" color="primary" label="Click Me" onClick={() => alert('Tag Clicked')} icon="ads_click" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CHIPS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-main dark:text-white border-b border-border-light dark:border-border-dark pb-1.5">
                Chips (&lt;Chip&gt;)
              </h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Subtle Variant (Default Size sm)</span>
                    <div className="flex flex-wrap gap-2">
                      <Chip label="Primary" color="primary" />
                      <Chip label="Success" color="secondary" />
                      <Chip label="Warning" color="warning" />
                      <Chip label="Error" color="error" />
                      <Chip label="Neutral" color="neutral" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Outlined Variant</span>
                    <div className="flex flex-wrap gap-2">
                      <Chip variant="outlined" label="Primary" color="primary" />
                      <Chip variant="outlined" label="Success" color="secondary" />
                      <Chip variant="outlined" label="Warning" color="warning" />
                      <Chip variant="outlined" label="Error" color="error" />
                      <Chip variant="outlined" label="Neutral" color="neutral" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Filled Variant</span>
                    <div className="flex flex-wrap gap-2">
                      <Chip variant="filled" label="Primary" color="primary" />
                      <Chip variant="filled" label="Success" color="secondary" />
                      <Chip variant="filled" label="Warning" color="warning" />
                      <Chip variant="filled" label="Error" color="error" />
                      <Chip variant="filled" label="Neutral" color="neutral" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 border-t border-border-light/40 dark:border-border-dark/40 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Active & Choice Toggle States</span>
                    <div className="flex items-center gap-2">
                      <Chip label="Inactive Chip" color="primary" active={false} onClick={() => alert('Toggle Active')} />
                      <Chip label="Active Choice Chip" color="primary" active={true} onClick={() => alert('Toggle Inactive')} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Sizes (sm / md / lg)</span>
                    <div className="flex items-center gap-2">
                      <Chip label="Small (sm)" color="primary" size="sm" />
                      <Chip label="Medium (md)" color="primary" size="md" />
                      <Chip label="Large (lg)" color="primary" size="lg" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Chips with Initials / Avatars (rounded-full)</span>
                    <div className="flex items-center gap-2">
                      <Chip label="Marcus Aurelius" color="neutral" avatar="MA" size="sm" />
                      <Chip label="Leo Sterling" color="neutral" avatar={studentData.avatar} size="md" />
                      <Chip label="Emily Blunt" color="neutral" avatar={teacherData.avatar} size="lg" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase">Removable Filter Chips</span>
                    <div className="flex items-center gap-2">
                      <Chip label="Status: Active" color="primary" onDelete={() => alert('Deleted Status')} size="sm" />
                      <Chip label="Instructor: Blunt" color="secondary" onDelete={() => alert('Deleted Instructor')} size="md" />
                      <Chip label="Role: Admin" color="warning" onDelete={() => alert('Deleted Role')} size="lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DASHBOARD WIDGETS */}
        <section id="widgets" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border-light/60 dark:border-border-dark/60 pb-3">
            <span className="material-symbols-outlined text-primary text-2xl">dashboard</span>
            <h2 className="text-xl font-bold text-text-main dark:text-white">Dashboard Widgets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Circular Progress Gauge</p>
              <CircularProgress
                title="Grant Utilization"
                percent={70}
                subtitle="Allocated"
                metrics={[
                  { label: 'Infrastructure', value: '$450,000' },
                  { label: 'Personnel Staffing', value: '$1,200,000' }
                ]}
              />
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Performance Historical Trend</p>
              <BarChartTrend
                title="Performance Trend"
                trendBadge="+18%"
                data={[42, 58, 72, 51, 65, 88, 72]}
                labels={['Jan', 'Jul (Active)']}
                tooltips={[
                  'Jan: 42 points',
                  'Feb: 58 points',
                  'Mar: 72 points',
                  'Apr: 51 points',
                  'May: 65 points',
                  'Jun: 88 points',
                  'Jul: 72 points (Active)'
                ]}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestCardsCatalog;
