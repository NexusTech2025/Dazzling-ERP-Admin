/**
 * Centralized Mock Data Store
 * Simulates a backend database for development and testing.
 */

// --- Helper for Network Simulation ---
export const simulateDelay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock Data ---

export let mockCourses = [
  {
    course_id: "CRS-101",
    name: "Computer Science 101",
    description: "Intro to CS principles, algorithms, and basic programming concepts.",
    base_fee: 1200,
    default_installment_count: 4,
    is_active: true,
    created_at: "2023-01-15T08:00:00Z"
  },
  {
    course_id: "CRS-202",
    name: "Business Administration",
    description: "Core business strategies, organizational management, and leadership.",
    base_fee: 1500,
    default_installment_count: 6,
    is_active: true,
    created_at: "2023-02-20T09:30:00Z"
  },
  {
    course_id: "CRS-303",
    name: "Graphic Design Basics",
    description: "Visual communication basics using industry-standard tools.",
    base_fee: 950,
    default_installment_count: 3,
    is_active: true,
    created_at: "2023-03-10T11:15:00Z"
  },
  {
    course_id: "CRS-404",
    name: "Advanced Accounting",
    description: "Financial record keeping, auditing, and corporate finance.",
    base_fee: 1100,
    default_installment_count: 4,
    is_active: false,
    created_at: "2023-04-05T14:45:00Z"
  },
  {
    course_id: "CRS-505",
    name: "Digital Marketing",
    description: "SEO, content strategy, and social media marketing overview.",
    base_fee: 1050,
    default_installment_count: 4,
    is_active: true,
    created_at: "2023-05-12T10:00:00Z"
  }
];

export let mockInstallments = [
  {
    installment_id: "INST-2023-001",
    fee_plan_id: "FP-101",
    student_id: "STU-001",
    student_name: "Liam Johnson",
    course_name: "Computer Science 101",
    installment_number: 1,
    amount: 300,
    paid_amount: 0,
    status: "Pending",
    due_date: new Date(Date.now() + 86400000 * 15).toISOString() // 15 days from now
  },
  {
    installment_id: "INST-2023-002",
    fee_plan_id: "FP-102",
    student_id: "STU-002",
    student_name: "Emma Wilson",
    course_name: "Business Administration",
    installment_number: 2,
    amount: 250,
    paid_amount: 0,
    status: "Due",
    due_date: new Date(Date.now() + 86400000 * 2).toISOString() // 2 days from now
  },
  {
    installment_id: "INST-2023-003",
    fee_plan_id: "FP-103",
    student_id: "STU-003",
    student_name: "Noah Brown",
    course_name: "Graphic Design Basics",
    installment_number: 1,
    amount: 316.66,
    paid_amount: 316.66,
    status: "Paid",
    due_date: new Date(Date.now() - 86400000 * 30).toISOString() // 30 days ago
  },
  {
    installment_id: "INST-2023-004",
    fee_plan_id: "FP-104",
    student_id: "STU-004",
    student_name: "Olivia Martinez",
    course_name: "Advanced Accounting",
    installment_number: 3,
    amount: 275,
    paid_amount: 100,
    status: "Partial",
    due_date: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  },
  {
    installment_id: "INST-2023-005",
    fee_plan_id: "FP-105",
    student_id: "STU-005",
    student_name: "James Anderson",
    course_name: "Computer Science 101",
    installment_number: 2,
    amount: 300,
    paid_amount: 0,
    status: "Overdue",
    due_date: new Date(Date.now() - 86400000 * 45).toISOString() // 45 days ago
  },
  {
    installment_id: "INST-2023-006",
    fee_plan_id: "FP-106",
    student_id: "STU-006",
    student_name: "Sophia Taylor",
    course_name: "Digital Marketing",
    installment_number: 1,
    amount: 262.50,
    paid_amount: 0,
    status: "Overdue",
    due_date: new Date(Date.now() - 86400000 * 12).toISOString() // 12 days ago
  }
];

export const mockRevenueSummary = {
  summary_id: "REV-2024",
  total_collected: 1250000,
  total_pending: 340500,
  total_overdue: 45200,
  last_updated: new Date().toISOString()
};
