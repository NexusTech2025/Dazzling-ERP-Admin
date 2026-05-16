import initialCourses from '../../../mockdata/academic/courses.json';
import initialPackages from '../../../mockdata/academic/packages.json';
import initialPackageCourses from '../../../mockdata/academic/packageCourses.json';
import initialPackagePerks from '../../../mockdata/academic/packagePerks.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Course Mock API Layer
 * Replaces actual GAS calls with local mock data for testing UI.
 */

// Maintain local state for course persistence
let mockCourses = [...initialCourses.Course];
let mockCourseTypes = [...initialCourses.CourseType];
let mockPackages = [...initialPackages.Packages];
let mockPackageCourses = [...initialPackageCourses.PackageCourses];
let mockPackagePerks = [...initialPackagePerks.PackagePerks];

// Helper to enrich course with segment name
const enrichCourse = (course) => {
  const segment = mockCourseTypes.find(t => t.segment_id === course.segment_id);
  return {
    ...course,
    segment_name: segment ? segment.segment_name : 'Academic'
  };
};

// --- COURSE TYPES (SEGMENTS) ---

export const fetchCourseTypes = async (token, options = {}) => {
  await simulateDelay();
  return { success: true, data: { data: [...mockCourseTypes] } };
};

export const createCourseType = async (token, data, options = {}) => {
  await simulateDelay(600);
  const newType = {
    segment_id: `SEG-${Date.now().toString().slice(-4)}`,
    status: 'active',
    ...data
  };
  mockCourseTypes.push(newType);
  return { success: true, message: "Course Type created successfully", data: newType };
};


// --- COURSES ---

export const fetchCourses = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...mockCourses];
  if (filter.status === 'Active') filtered = filtered.filter(c => c.status === 'active');
  if (filter.status === 'Inactive') filtered = filtered.filter(c => c.status !== 'active');
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || c.course_id.toLowerCase().includes(s));
  }

  // Enrich with segment names
  const enriched = filtered.map(enrichCourse);

  return { success: true, data: { data: enriched } };
};

export const fetchCourseDetail = async (token, id, options = {}) => {
  await simulateDelay();
  const course = mockCourses.find(c => c.course_id === id);
  if (!course) return { success: false, message: "Course not found" };
  return { success: true, data: { data: [enrichCourse(course)] } };
};

export const createCourse = async (token, data, options = {}) => {
  await simulateDelay(800);
  const newCourse = {
    ...data,
    created_at: new Date().toISOString()
  };
  mockCourses.push(newCourse);
  return { success: true, message: "Course created successfully", data: newCourse };
};

export const updateCourse = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = mockCourses.findIndex(c => c.course_id === id);
  if (index === -1) return { success: false, message: "Course not found" };
  
  mockCourses[index] = { ...mockCourses[index], ...data };
  return { success: true, message: "Course updated successfully" };
};

export const deleteCourse = async (token, id, options = {}) => {
  await simulateDelay(800);
  const index = mockCourses.findIndex(c => c.course_id === id);
  if (index === -1) return { success: false, message: "Course not found" };
  
  mockCourses.splice(index, 1);
  return { success: true, message: "Course deleted successfully" };
};


// --- PACKAGES ---

export const fetchPackages = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  let filtered = [...mockPackages];
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.package_id.toLowerCase().includes(s));
  }
  return { success: true, data: { data: filtered } };
};

export const fetchPackageDetail = async (token, id, options = {}) => {
  await simulateDelay();
  const pkg = mockPackages.find(p => p.package_id === id);
  if (!pkg) return { success: false, message: "Package not found" };

  // Relational Join: Get Courses
  const mappedCourseIds = mockPackageCourses
    .filter(pc => pc.package_id === id)
    .map(pc => pc.course_id);
  
  const relatedCourses = mockCourses.filter(c => mappedCourseIds.includes(c.course_id)).map(enrichCourse);

  // Relational Join: Get Perks
  const relatedPerks = mockPackagePerks
    .filter(prk => prk.package_id === id)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return { 
    success: true, 
    data: { 
      data: [{
        ...pkg,
        courses: relatedCourses,
        perks: relatedPerks
      }] 
    } 
  };
};

export const createPackage = async (token, data, options = {}) => {
  await simulateDelay(800);
  const newPackage = {
    ...data,
    created_at: new Date().toISOString()
  };
  mockPackages.push(newPackage);
  return { success: true, message: "Package created successfully", data: newPackage };
};

export const updatePackage = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = mockPackages.findIndex(p => p.package_id === id);
  if (index === -1) return { success: false, message: "Package not found" };
  
  mockPackages[index] = { ...mockPackages[index], ...data };
  return { success: true, message: "Package updated successfully" };
};
