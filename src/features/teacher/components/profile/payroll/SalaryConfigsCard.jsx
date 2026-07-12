import React, { useMemo } from 'react';
import Card from '../../../../../components/ui/Card';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/v2/Button';
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty
} from '../../../../../components/ui/table';
import { parseScopeDisplay, formatDateBounds } from '../../../utils/teacher.utils';

const SalaryConfigsCard = React.memo(({ salaryConfigs = [], activeConfig, onEdit, onDelete, onCreate }) => {
  // Sort configs descending by effective_from so latest is at the top
  const sortedConfigs = useMemo(() => {
    return [...salaryConfigs].sort((a, b) => {
      const dateA = a.effective_from ? new Date(a.effective_from) : new Date(0);
      const dateB = b.effective_from ? new Date(b.effective_from) : new Date(0);
      return dateB - dateA;
    });
  }, [salaryConfigs]);

  return (
    <Card className="h-full">
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl" aria-hidden="true">payments</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Salary Configurations
          </h3>
        </div>
        <Button
          variant="contained"
          size="sm"
          startIcon="add"
          onClick={onCreate}
        >
          Add Configuration
        </Button>
      </Card.Header>

      <Card.Body className="p-0">
        {sortedConfigs.length === 0 ? (
          <div className="py-12">
            <TableEmpty message="No salary configurations found." icon="payments" />
          </div>
        ) : (
          <TableContainer>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Config Type</TableHead>
                <TableHead>Rate Type</TableHead>
                <TableHead>Base Value</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Settlement</TableHead>
                <TableHead align="center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedConfigs.map((config) => {
                const isActive = config.contract_status === 'active';
                const fromDate = formatDateBounds(config.effective_from, 'N/A');
                const toDate = formatDateBounds(config.effective_to, 'Present');
                const scopeDisplay = parseScopeDisplay(config.scope_type, config.scope_id);

                return (
                  <TableRow key={config.salary_config_id} className={isActive ? 'bg-primary/5 hover:bg-primary/10' : ''}>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={
                          config.contract_status === 'active' ? 'success' :
                            config.contract_status === 'drafted' ? 'default' :
                              config.contract_status === 'expired' ? 'warning' : 'danger'
                        } className="font-black tracking-widest text-[9px] uppercase">
                          {config.contract_status || 'drafted'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {(config.salary_config_type || 'recurring_monthly').replace('_', ' ')}
                    </TableCell>
                    <TableCell className="capitalize">
                      {config.rate_type || 'monthly'}
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      ₹{(config.base_value || config.base_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize text-xs">
                      {scopeDisplay}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {config.total_contract_value ? `₹${config.total_contract_value.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {fromDate} - {toDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        config.settlement_state === 'settled' ? 'success' :
                          config.settlement_state === 'unsettled' ? 'warning' : 'danger'
                      } className="font-black tracking-widest text-[9px] uppercase">
                        {(config.settlement_state || 'unsettled').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(config)}
                          className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          aria-label="Edit Configuration"
                        >
                          <span className="material-symbols-outlined text-sm leading-none" aria-hidden="true">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(config.salary_config_id)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          aria-label="Delete Configuration"
                        >
                          <span className="material-symbols-outlined text-sm leading-none" aria-hidden="true">delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableContainer>
        )}
      </Card.Body>
    </Card>
  );
});

SalaryConfigsCard.displayName = 'SalaryConfigsCard';

export default SalaryConfigsCard;
