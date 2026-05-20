import Badge from '../../../components/ui/Badge';

/**
 * Columns definition for Branches DataTable
 */
export const createBranchColumns = (handlers) => [
  {
    header: 'Branch ID',
    accessor: 'branch_id',
    cell: (row) => (
      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
        {row.branch_id}
      </span>
    )
  },
  {
    header: 'Branch Name',
    accessor: 'branch_name',
    cell: (row) => (
      <span className="font-bold text-slate-900 dark:text-white">{row.branch_name}</span>
    )
  },
  {
    header: 'Location',
    accessor: 'location',
    cell: (row) => (
      <span className="text-slate-600 dark:text-slate-400 text-sm">
        {row.location || <span className="italic text-slate-300">No location set</span>}
      </span>
    )
  },
  {
    header: 'Status',
    accessor: 'status',
    cell: (row) => {
      const status = row.status?.toLowerCase() === 'active' ? 'active' : 'inactive';
      return (
        <Badge 
          variant={status === 'active' ? 'success' : 'neutral'}
          className="capitalize font-bold"
        >
          {status}
        </Badge>
      );
    }
  },
  {
    header: 'Actions',
    id: 'actions',
    cell: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handlers.onEdit(row)}
          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
          title="Edit Branch"
        >
          <span className="material-symbols-outlined text-xl">edit_square</span>
        </button>
        <button
          onClick={() => handlers.onDelete(row.branch_id, row.branch_name)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title="Delete Branch"
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    )
  }
];
