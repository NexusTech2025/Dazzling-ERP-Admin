import mockBranches from '../../../mockdata/core/branches.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Branch Mock API Layer
 */

let localBranches = [...mockBranches.Branches];

export const fetchBranches = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...localBranches];
  if (filter.status) {
    filtered = filtered.filter(b => b.status === filter.status);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(b => 
      b.branch_name.toLowerCase().includes(s) || 
      b.branch_id.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};
