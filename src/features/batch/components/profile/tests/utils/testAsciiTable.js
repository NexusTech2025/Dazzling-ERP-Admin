import { generateAsciiTable, formatTestSummaryWhatsAppMessage } from './whatsappShareUtils.js';

// Sample data to test table generation
const test = { title: 'Science Weekly Quiz 01', test_date: '2026-06-12', total_marks: 50, passing_marks: 20 };
const batch = { batch_name: 'Class 11 Physics CBSE (A)' };
const kpis = { total: 5, present: 5, absent: 0, average: '31.40', passPercentage: '100.0' };

const toppers = [
  { student_id: '1', student_name: 'Rahul Sharma', obtained: 48, percentage: 96 },
  { student_id: '2', student_name: 'Ananya Patel', obtained: 45, percentage: 90 },
  { student_id: '3', student_name: 'Amit Kumar', obtained: 42, percentage: 84 }
];

const studentsMap = {
  '1': { student_name: 'Rahul Sharma' },
  '2': { student_name: 'Ananya Patel' },
  '3': { student_name: 'Amit Kumar' },
  '4': { student_name: 'Vijay Singh' },
  '5': { student_name: 'Priya Verma' }
};

const studentResults = [
  { student_id: '1', obtained: 48, grade: 'A+', isPass: true, is_absent: false },
  { student_id: '2', obtained: 45, grade: 'A', isPass: true, is_absent: false },
  { student_id: '3', obtained: 42, grade: 'A', isPass: true, is_absent: false },
  { student_id: '4', obtained: 30, grade: 'C', isPass: true, is_absent: false },
  { student_id: '5', obtained: 0, grade: 'F', isPass: false, is_absent: true }
];

const formattedMsg = formatTestSummaryWhatsAppMessage(test, batch, kpis, toppers, studentsMap, studentResults);

console.log('\n=============================================================');
console.log('       GENERATED WHATSAPP TEST REPORT MESSAGE OUTPUT');
console.log('=============================================================\n');
console.log(formattedMsg);
console.log('\n=============================================================\n');
