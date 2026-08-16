/**
 * @file enrollmentCacheHelper.test.js
 * @description Unit tests for resolveEnrollmentItem and EnrollmentRepo item resolution.
 */

import { resolveEnrollmentItem, EnrollmentRepo } from './enrollmentCacheHelper.js';

function test(testName, fn) {
  try {
    fn();
    console.log(`  ✓ PASSED: ${testName}`);
  } catch (err) {
    console.error(`  ✗ FAILED: ${testName}`);
    console.error(err);
    process.exitCode = 1;
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg} | Expected: ${JSON.stringify(expected)}, Received: ${JSON.stringify(actual)}`);
  }
}

console.log('🧪 Running resolveEnrollmentItem Test Suite...\n');

// Mock data fixtures
const mockCourses = [
  { course_id: 'CRS-FCE33995', name: 'Full Stack Web Development', course_code: 'FSWD-101' },
  { course_id: 'CRS-PYTHON', name: 'Python for Data Science', course_code: 'PY-201' }
];

const mockPackages = [
  { package_id: 'PKG-3001', package_name: 'Class 10 Science & Math Combo', package_code: 'PKG-SCI-MTH' }
];

test('1. Resolves Course by item_id accurately', () => {
  const enrollment = {
    enrollment_id: 'ENR-001',
    item_id: 'CRS-FCE33995',
    enrollment_type: 'subject'
  };

  const result = resolveEnrollmentItem(enrollment, mockCourses, 'subject');
  assertEqual(result.itemName, 'Full Stack Web Development', 'Course name resolution');
  assertEqual(result.itemCode, 'FSWD-101', 'Course code resolution');
  assertEqual(result.itemType, 'Subject', 'Display type resolution');
  assertEqual(result.item?.course_id, 'CRS-FCE33995', 'Matched course entity');
});

test('2. Resolves Package by item_id accurately', () => {
  const enrollment = {
    enrollment_id: 'ENR-002',
    item_id: 'PKG-3001',
    enrollment_type: 'package'
  };

  const result = resolveEnrollmentItem(enrollment, mockPackages, 'package');
  assertEqual(result.itemName, 'Class 10 Science & Math Combo', 'Package name resolution');
  assertEqual(result.itemCode, 'PKG-SCI-MTH', 'Package code resolution');
  assertEqual(result.itemType, 'Package', 'Display type resolution');
  assertEqual(result.item?.package_id, 'PKG-3001', 'Matched package entity');
});

test('3. Handles missing/unmatched item gracefully with fallback', () => {
  const enrollment = {
    enrollment_id: 'ENR-003',
    item_id: 'CRS-UNKNOWN',
    enrollment_type: 'course'
  };

  const result = resolveEnrollmentItem(enrollment, mockCourses, 'course');
  assertEqual(result.itemName, 'Academic Course', 'Fallback course name');
  assertEqual(result.itemCode, 'CRS-UNKNOWN', 'Fallback item code');
  assertEqual(result.itemType, 'Course', 'Fallback item type');
  assertEqual(result.item, null, 'Null matched item');
});

test('4. Handles null or empty enrollment input safely', () => {
  const result = resolveEnrollmentItem(null, mockCourses, 'course');
  assertEqual(result.itemName, 'Academic Program', 'Safe null fallback item name');
  assertEqual(result.itemType, 'Course', 'Safe null fallback item type');
  assertEqual(result.item, null, 'Safe null item');
});

test('5. EnrollmentRepo.prototype.resolveItem delegates to resolveEnrollmentItem', () => {
  const repo = new EnrollmentRepo();
  const enrollment = {
    enrollment_id: 'ENR-004',
    item_id: 'CRS-PYTHON',
    enrollment_type: 'course'
  };

  const result = repo.resolveItem(enrollment, mockCourses, 'course');
  assertEqual(result.itemName, 'Python for Data Science', 'Repo method course name');
  assertEqual(result.itemCode, 'PY-201', 'Repo method course code');
});

console.log('\n✅ All resolveEnrollmentItem tests completed successfully.\n');
