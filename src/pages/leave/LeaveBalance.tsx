import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { getEmployeesApi, getDepartmentsApi, getBranchesApi } from '@/apis/employee';
import { getLeaveTypesApi, getEmployeeLeaveBalanceApi } from '@/apis/leave';
import { getFromLocalStorage } from '@/utils/localstorage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LeaveBalance() {
  const [formData, setFormData] = useState({
    branch: "",
    department: "",
    employee: "",
    employeeType: "",
    leaveType: "",
    year: "",
  });

  const [showResults, setShowResults] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  const [branches, setBranches] = useState<Array<{ _id?: string; name?: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ _id?: string; name?: string }>>([]);
  const [employeesList, setEmployeesList] = useState<Array<{ id: string; name: string; role?: string; branchId?: string; departmentId?: string }>>([]);
  const [leaveTypes, setLeaveTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [employeeTypes] = useState<Array<{ id: string; name: string }>>([
    { id: 'hr', name: 'HR' },
    { id: 'manager', name: 'Manager' },
    { id: 'employee', name: 'Employee' },
  ]);
  const [years, setYears] = useState<Array<string>>([]);
  const { toast } = useToast();

  useEffect(() => {
    // compute current year and previous year
    const current = new Date().getFullYear();
    setYears([String(current), String(current - 1)]);
  }, []);

  // lazy load lists from APIs
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const storedUser = getFromLocalStorage<Record<string, unknown>>('userInfo');
        const userId = (storedUser && ((storedUser as any)?.user?._id as string)) || '';

        const [deptRes, branchRes, leaveRes, empRes] = await Promise.all([
          getDepartmentsApi(),
          getBranchesApi(),
          getLeaveTypesApi(),
          getEmployeesApi({ id: userId }),
        ]);

        if (!mounted) return;

        setDepartments(deptRes?.message || []);
        setBranches(branchRes?.message || []);

        const ltItems = (leaveRes?.message || []) as any[];
        setLeaveTypes(ltItems.map((l) => ({ id: l._id, name: l.name })));

        const empItems = (empRes?.message || []) as any[];
        const visible = (empItems || []).filter((it) => {
          const roleVal: any = (it as any).role ?? '';
          let roleStr = '';
          if (typeof roleVal === 'string') roleStr = roleVal;
          else if (roleVal && typeof roleVal === 'object') roleStr = (roleVal as any).name ?? (roleVal as any).role ?? '';
          roleStr = String(roleStr).toLowerCase();
          return roleStr !== 'admin';
        });

        setEmployeesList(
          visible.map((it) => {
            // extract role same way as Employees.tsx
            const roleVal: any = (it as any).role ?? '';
            let roleStr = '';
            if (typeof roleVal === 'string') roleStr = roleVal;
            else if (roleVal && typeof roleVal === 'object') roleStr = (roleVal as any).name ?? (roleVal as any).role ?? '';

            const branchObj = (it as any).branch_id ?? (it as any).branch ?? null;
            const branchId = typeof branchObj === 'string' ? branchObj : (branchObj?._id || '');

            const deptObj = (it as any).department_id ?? (it as any).department ?? null;
            const departmentId = typeof deptObj === 'string' ? deptObj : (deptObj?._id || '');

            return {
              id: it._id,
              name: it.name || `${(it.firstName || '')} ${(it.lastName || '')}`.trim() || 'Unknown',
              role: roleStr,
              branchId,
              departmentId,
            };
          })
        );
      } catch (err: any) {
        const message = err instanceof Error ? err.message : 'Failed to load lists';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleGetData = () => {
    // call API
    const doFetch = async () => {
      try {
        setFetching(true);
        const payload = {
          branch_id: formData.branch,
          department_id: formData.department,
          year: formData.year,
        };
        const res = await getEmployeeLeaveBalanceApi(payload as any);
        const items = (res?.message || []) as any[];
        setLeaveBalances(items);
        setShowResults(true);
        toast({ title: 'Success', description: `${items.length} records loaded` });
      } catch (err: any) {
        const message = err instanceof Error ? err.message : 'Failed to fetch leave balances';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setFetching(false);
      }
    };

    doFetch();
  };

  // helper to normalize branch id from department item (copied logic from Employees.tsx)
  const normalizeBranchId = (d: any) => {
    if (!d) return '';
    return (
      d.branch_id ?? d.branchId ??
      (d.branch && (d.branch._id ?? d.branch.id)) ??
      d.branch ?? ''
    );
  };

  // derive department options filtered by selected branch
  const filteredDepartments = (() => {
    if (!formData.branch) return departments;
    const selectedBranchId = String(formData.branch || '');
    const filtered = (departments as any[]).filter((d) => {
      const bid = String(normalizeBranchId(d) || '');
      return bid === selectedBranchId;
    });
    return filtered;
  })();

  // derive displayed employees based on selected employeeType, branch and department
  const displayedEmployees = employeesList.filter((e) => {
    // exclude admin users always
    const role = String(e.role || '').toLowerCase();
    if (role === 'admin') return false;

    // if an employeeType is selected, filter to that role
    if (formData.employeeType) {
      const want = String(formData.employeeType).toLowerCase();
      if (role !== want) return false;
    }

    // filter by branch
    if (formData.branch) {
      if (e.branchId) {
        if (String(e.branchId) !== String(formData.branch)) return false;
      }
    }

    // filter by department
    if (formData.department) {
      if (e.departmentId) {
        if (String(e.departmentId) !== String(formData.department)) return false;
      }
    }

    return true;
  });

  const isGetDataEnabled = Boolean(formData.branch && formData.department && formData.year);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leave Balance Employee Wise</h1>
        <p className="text-muted-foreground mt-1">View leave balance for employees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Select Branch</Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => setFormData({ ...formData, branch: value, department: '', employee: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <SelectItem value="__no_branch" disabled>No branches</SelectItem>
                  ) : (
                    branches.map((b, idx) => (
                      <SelectItem key={b._id ?? b.name ?? idx} value={b._id ?? String(idx)}>{b.name ?? b._id}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Select Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value, employee: '' })}
                disabled={!formData.branch}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {!formData.branch ? (
                    <SelectItem value="__select_branch" disabled>Select branch first</SelectItem>
                  ) : filteredDepartments.length === 0 ? (
                    <SelectItem value="__no_department" disabled>No departments for selected branch</SelectItem>
                  ) : (
                    filteredDepartments.map((d, idx) => (
                      <SelectItem key={d._id ?? d.name ?? idx} value={d._id ?? String(idx)}>{d.name ?? d._id}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Select Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.length === 0 ? (
                    <SelectItem value="__no_year" disabled>No years</SelectItem>
                  ) : (
                    years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="employeeType">Select Employee Type</Label>
              <Select
                value={formData.employeeType}
                onValueChange={(value) => setFormData({ ...formData, employeeType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {employeeTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee</Label>
              <Select
                value={formData.employee}
                onValueChange={(value) => setFormData({ ...formData, employee: value })}
                disabled={displayedEmployees.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {displayedEmployees.length === 0 ? (
                    <SelectItem value="__no_employee" disabled>No employees for selected filters</SelectItem>
                  ) : (
                    displayedEmployees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaveType">Select Leave Type</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.length === 0 ? (
                    <SelectItem value="__no_leave_type" disabled>No leave types</SelectItem>
                  ) : (
                    leaveTypes.map((lt) => <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleGetData} disabled={!isGetDataEnabled || fetching}>
              {fetching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Fetching...
                </>
              ) : (
                'Get Data'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance Results</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Total Leaves</TableHead>
                  <TableHead>Used Leaves</TableHead>
                  <TableHead>Remaining Leaves</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.length === 0 ? (
                  <TableRow>
                    <TableCell className="font-medium" colSpan={6}>No records found</TableCell>
                  </TableRow>
                ) : (
                  leaveBalances.map((row: any, idx: number) => {
                    const emp = row?.employee_id || row?.employee || {};
                    const lt = row?.leave_type_id || row?.leaveType || {};
                    const name = emp?.name || emp?.employeeName || 'Unknown';
                    const leaveTypeName = lt?.name || lt?.leaveTypeName || '-';
                    const total = typeof row?.total_leaves !== 'undefined' ? row.total_leaves : (row?.totalLeaves ?? '-');
                    const used = typeof row?.used_leaves !== 'undefined' ? row.used_leaves : (row?.usedLeaves ?? '-');
                    const remaining = typeof row?.remaining_leaves !== 'undefined' ? row.remaining_leaves : (row?.remainingLeaves ?? '-');
                    const yearVal = row?.year ?? '-';

                    const remainingClass = typeof remaining === 'number' ? (remaining > 5 ? 'text-success' : 'text-warning') : '';

                    return (
                      <TableRow key={row._id ?? row.id ?? idx}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>{leaveTypeName}</TableCell>
                        <TableCell>{total}</TableCell>
                        <TableCell>{used}</TableCell>
                        <TableCell className={remainingClass}>{remaining}</TableCell>
                        <TableCell>{yearVal}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
