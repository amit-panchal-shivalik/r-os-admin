import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getEmployeesApi, EmployeeItem, getDepartmentsApi, getBranchesApi, addEmployeeApi } from '@/apis/employee';
import { getFromLocalStorage } from '@/utils/localstorage';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Employee {
  id: string;
  name: string;
  mobile: string;
  branch: string;
  department: string;
  role?: string;
  reportingManager?: string;
  dob?: string; // ISO string
  status: string;
}

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    branch: "",
    department: "",
    role: "",
    reportingManager: "",
    status: "Active",
  });
  const initialFormData = { name: "", email: "", mobile: "", branch: "", department: "", role: "", reportingManager: "", status: "Active" };
  const [managerSearch, setManagerSearch] = useState<string>("");
  const [dob, setDob] = useState<Date | undefined>();
  const [branches, setBranches] = useState<Array<{ _id?: string; name?: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ _id?: string; name?: string }>>([]);
  const [managers, setManagers] = useState<Array<{ id: string; name: string; role?: string; branchId?: string; departmentId?: string }>>([]);
  const [saving, setSaving] = useState(false);

  // DOB validation helpers: employee must be at least 18 years old
  const isAtLeast18 = (d: Date) => {
    const adult = new Date();
    adult.setFullYear(adult.getFullYear() - 18);
    return d <= adult;
  };

  const handleDobSelect = (selected?: Date | undefined) => {
    if (!selected) {
      setDob(undefined);
      return;
    }
    // Calendar may pass Date directly
    const selDate = selected as Date;
    if (!isAtLeast18(selDate)) {
      toast({ title: 'Validation', description: 'Employee must be at least 18 years old', variant: 'destructive' });
      return;
    }
    setDob(selDate);
  };

  // Calendar month control: default to 18 years ago so users don't have to navigate back
  const defaultAdultDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  })();

  const [calendarMonth, setCalendarMonth] = useState<Date>(defaultAdultDate);
  const [dobPopoverOpen, setDobPopoverOpen] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18; // latest allowed year
  const minYear = currentYear - 80; // earliest allowed year
  const fromDate = new Date(minYear, 0, 1);
  const toDate = new Date(maxYear, 11, 31);

  const clampMonth = (d: Date) => {
    if (d < fromDate) return new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    if (d > toDate) return new Date(toDate.getFullYear(), toDate.getMonth(), 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation in requested order:
    // 1. Full name
    if (!formData.name || String(formData.name).trim() === '') {
      toast({ title: 'Validation', description: 'Please enter full name', variant: 'destructive' });
      return;
    }
    // 2. Email
    if (!formData.email || String(formData.email).trim() === '') {
      toast({ title: 'Validation', description: 'Please enter email', variant: 'destructive' });
      return;
    }
    // 3. Role
    if (!formData.role || String(formData.role).trim() === '') {
      toast({ title: 'Validation', description: 'Please select a role', variant: 'destructive' });
      return;
    }
    // 4. Reporting manager (only required if this role expects a manager)
    if (allowedManagerRoles.length > 0) {
      if (!formData.reportingManager || String(formData.reportingManager).trim() === '') {
        toast({ title: 'Validation', description: 'Please select reporting manager', variant: 'destructive' });
        return;
      }
    }
    // 5. Mobile number
    if (!formData.mobile || String(formData.mobile).trim() === '') {
      toast({ title: 'Validation', description: 'Please enter mobile number', variant: 'destructive' });
      return;
    }
    // 6. Branch
    if (!formData.branch || String(formData.branch).trim() === '') {
      toast({ title: 'Validation', description: 'Please select a branch', variant: 'destructive' });
      return;
    }
    // 7. Department
    if (!formData.department || String(formData.department).trim() === '') {
      toast({ title: 'Validation', description: 'Please select a department', variant: 'destructive' });
      return;
    }
    // 8. DOB
    if (!dob) {
      toast({ title: 'Validation', description: 'Please select Date of Birth', variant: 'destructive' });
      return;
    }

    if (!isAtLeast18(dob)) {
      toast({ title: 'Validation', description: 'Employee must be at least 18 years old', variant: 'destructive' });
      return;
    }

    // Prepare API payload
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.mobile,
      role: formData.role || 'Employee',
      dob: dob ? dob.toISOString().split("T")[0] : undefined,
      department_id: formData.department,
      branch_id: formData.branch,
      manager_id: formData.reportingManager || undefined,
    };

    try {
      setSaving(true);
  const res = await addEmployeeApi(payload as any);

  // Accept either { message, user, leave_balances } or { success, result }
  // Be defensive: some backends return { message: 'E-mail already in use', result: {} }
  // Treat as success only when we have an actual created user object with an id/_id.
  const candidate = (res as any).user || (res as any).result;
  console.log('[DEBUG] candiate',candidate);
  const createdUser = candidate && (candidate._id || candidate.id) ? candidate : null;
  console.log("Created User:", createdUser);
  if (createdUser) {
        const createdId = String(createdUser._id || createdUser.id || `EMP${Date.now().toString().slice(-6)}`);
        const newEmployee: Employee = {
          id: createdId,
          name: createdUser.name || formData.name,
          mobile: createdUser.phone || formData.mobile,
          branch: (branches.find((b) => String(b._id) === String(formData.branch))?.name as string) || formData.branch || "Head Office",
          department: (departments.find((d: any) => String(d._id) === String(formData.department))?.name as string) || formData.department || "",
          role: createdUser.role || formData.role || 'Employee',
          reportingManager: (managers.find((m) => String(m.id) === String(formData.reportingManager))?.name as string) || formData.reportingManager || '',
          dob: dob ? dob.toISOString().split("T")[0] : undefined,
          status: formData.status || 'Active',
        };

        // Optimistically update then refresh from server
        setEmployees([newEmployee, ...employees]);
        setManagers([{ id: newEmployee.id, name: newEmployee.name }, ...managers]);
        try {
          await loadEmployees();
          await loadManagers();
        } catch (reloadErr) {
          console.warn('Failed to refresh lists after add', reloadErr);
        }

        setFormData({ name: "", email: "", mobile: "", branch: "", department: "", role: "", reportingManager: "", status: "Active" });
        setDob(undefined);
        setManagerSearch("");
        setShowForm(false);
        toast({ title: 'Success', description: (res as any).message || 'Employee added successfully' });
      } else {
        // no created user -> show backend message when present
        const errMsg = (res as any).message || (res as any).error || 'Failed to add employee';
        throw new Error(errMsg);
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to add employee';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setTableLoading(true);
      // read user id from localStorage via helper
  const storedUser = getFromLocalStorage<Record<string, unknown>>('userInfo');
  console.log('[DEBUG]', (storedUser as any)?.user?._id);
  const userId = (storedUser && ((storedUser as any)?.user?._id as string)) || '';

      const res = await getEmployeesApi({ id: userId });
      const items: EmployeeItem[] = res.message || [];

      // Filter out users with role === 'admin' (case-insensitive)
      const visible = (items || []).filter((it) => {
        const roleVal: any = (it as any).role ?? '';
        let roleStr = '';
        if (typeof roleVal === 'string') roleStr = roleVal;
        else if (roleVal && typeof roleVal === 'object') roleStr = (roleVal as any).name ?? (roleVal as any).role ?? '';
        roleStr = String(roleStr).toLowerCase();
        return roleStr !== 'admin';
      });

      const mapped = visible.map((it) => ({
        id: it._id,
        name: it.name || `${(it.firstName || '')} ${(it.lastName || '')}`.trim() || 'Unknown',
        mobile: (it.mobile || it.phone || it.phoneNumber || '') as string,
        // support multiple backend shapes: branch or branch_id
        branch: (it as any).branch_id
          ? (typeof (it as any).branch_id === 'string' ? (it as any).branch_id : ((it as any).branch_id?.name || (it as any).branch_id?._id))
          : (typeof it.branch === 'string' ? it.branch : ((it.branch as { name?: string })?.name) || ''),
        department: (it as any).department_id
          ? (typeof (it as any).department_id === 'string' ? (it as any).department_id : ((it as any).department_id?.name || (it as any).department_id?._id))
          : (typeof it.department === 'string' ? it.department : ((it.department as { name?: string })?.name) || ''),
        dob: (it.dob || it.dateOfBirth) as string | undefined,
        status: it.isActive ?? it.status ? (it.isActive ? 'Active' : 'Inactive') : (it.loginstatus === 'Login' ? 'Active' : 'Inactive'),
      }));
      setEmployees(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load employees';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setTableLoading(false);
    }
  };

  const loadLists = async () => {
    try {
      const [deptRes, branchRes] = await Promise.all([getDepartmentsApi(), getBranchesApi()]);
      setDepartments(deptRes.message || []);
      setBranches(branchRes.message || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load lists';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const loadManagers = async () => {
    try {
      const storedUser = getFromLocalStorage<Record<string, unknown>>('userInfo');
      const userId = (storedUser && ((storedUser as any)?.user?._id as string)) || '';
      const res = await getEmployeesApi({ id: userId });
      const items: EmployeeItem[] = res.message || [];
      const mgrs = (items || []).map((it) => {
        // extract role same way as loadEmployees
        const roleVal: any = (it as any).role ?? '';
        let roleStr = '';
        if (typeof roleVal === 'string') roleStr = roleVal;
        else if (roleVal && typeof roleVal === 'object') roleStr = (roleVal as any).name ?? (roleVal as any).role ?? '';

        // extract branch and department ids if present
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
      });
      setManagers(mgrs);
    } catch (err) {
      // non-fatal: managers list may be empty
      console.warn('[DEBUG] failed to load managers', err);
    }
  };

  useEffect(() => {
    loadLists();
    loadEmployees();
    loadManagers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleHierarchy = ["Admin", "HR", "Manager", "Employee"];
  const selectedRoleIndex = roleHierarchy.findIndex((r) => r.toLowerCase() === String(formData.role || '').toLowerCase());
  const allowedManagerRoles = selectedRoleIndex > 0 ? roleHierarchy.slice(0, selectedRoleIndex) : [];
  const normalizedAllowedRoles = allowedManagerRoles.map((r) => String(r).toLowerCase());
  // First filter by allowed roles
  const roleFiltered = managers.filter((m) => {
    const r = String(m.role || '').toLowerCase();
    if (!r) return false;
    if (!normalizedAllowedRoles.includes(r) || r === 'employee') return false;
    return true;
  });

  // Then try to narrow by branch/department when possible
  const branchDeptFiltered = roleFiltered.filter((m) => {
    if (formData.branch && m.branchId) {
      if (String(m.branchId) !== String(formData.branch)) return false;
    }
    if (formData.department && m.departmentId) {
      if (String(m.departmentId) !== String(formData.department)) return false;
    }
    return true;
  });

  // If no managers match by branch/department, fallback to role-only list so user can still pick a manager
  const filteredManagers = branchDeptFiltered.length > 0 ? branchDeptFiltered : roleFiltered;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage employee information</p>
        </div>
        <Button className="gap-2" onClick={() => { setFormData(initialFormData); setDob(undefined); setManagerSearch(""); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value, reportingManager: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="Admin">Admin</SelectItem> */}
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                

                <div className="space-y-2">
                  <Label htmlFor="reportingManager">Reporting Manager</Label>
                  <Select
                    value={formData.reportingManager}
                    onValueChange={(value) => setFormData({ ...formData, reportingManager: value })}
                    disabled={!String(formData.name || '').trim() || !String(formData.email || '').trim() || !formData.role || allowedManagerRoles.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.role ? 'Select role first' : (allowedManagerRoles.length === 0 ? 'No manager available for this role' : 'Select reporting manager')} />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search manager..."
                          value={managerSearch}
                          onChange={(e) => setManagerSearch(e.target.value)}
                          className="w-full"
                          
                        />
                      </div>
                      {filteredManagers.length === 0 ? (
                        <SelectItem value="__no_manager" disabled>No managers</SelectItem>
                      ) : (
                        filteredManagers
                          .filter((mgr) => mgr.name.toLowerCase().includes(managerSearch.toLowerCase()))
                          .map((mgr) => (
                            <SelectItem key={mgr.id} value={mgr.id}>{mgr.name} <span className="text-xs text-muted-foreground">({mgr.role})</span></SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    placeholder="e.g., +91 98765 43210"
                    value={formData.mobile}
                    maxLength={14}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => {
                      console.log('[DEBUG] Value ',value);
                      // store branch as its _id
                      setFormData({ ...formData, branch: value, department: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.length === 0 ? (
                        <>
                          <SelectItem value="__no_branch" disabled>No branches</SelectItem>
                        </>
                      ) : (
                        branches.map((b, idx) => (
                          <SelectItem key={b._id ?? b.name ?? idx} value={b._id ?? `branch-${idx}`}>{b.name ?? b._id}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                    <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    disabled={!formData.branch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 ? (
                        <>
                          <SelectItem value="__no_department" disabled>No departments</SelectItem>
                        </>
                      ) : (
                        (() => {
                          const selectedBranchId = String(formData.branch || '');
                          const normalizeBranchId = (d: any) => {
                            if (!d) return '';
                            return (
                              d.branch_id ?? d.branchId ??
                              (d.branch && (d.branch._id ?? d.branch.id)) ??
                              d.branch ?? ''
                            );
                          };

                          const filtered = (departments as any[]).filter((d) => {
                            const bid = normalizeBranchId(d);
                            return String(bid) === selectedBranchId;
                          });
                          console.log('[DEBUG] filtered', filtered);

                          if (filtered.length === 0) {
                            return <SelectItem value="__no_dept_for_branch" disabled>No departments for selected branch</SelectItem>;
                          }

                          return filtered.map((d, idx) => (
                            <SelectItem key={d._id ?? d.name ?? idx} value={d._id ?? `dept-${idx}`}>{d.name ?? d._id}</SelectItem>
                          ));
                        })()
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover open={dobPopoverOpen} onOpenChange={(v) => {
                    setDobPopoverOpen(v);
                    if (v) setCalendarMonth(defaultAdultDate);
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={!dob ? "w-full justify-start text-left font-normal text-muted-foreground" : "w-full justify-start text-left font-normal"}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, "PPP") : format(defaultAdultDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" align="start">
                      <div className="flex gap-2 mb-2">
                        {/* Month select */}
                        <select
                          aria-label="Month"
                          value={calendarMonth.getMonth()}
                          onChange={(e) => {
                            const m = Number(e.target.value);
                            setCalendarMonth(clampMonth(new Date(calendarMonth.getFullYear(), m, 1)));
                          }}
                          className="rounded-md border px-2 py-1 text-sm"
                        >
                          {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString(undefined, { month: 'long' })}</option>
                          ))}
                        </select>

                        {/* Year select: from (currentYear - 18) down to (currentYear - 80) */}
                        <select
                          aria-label="Year"
                          value={calendarMonth.getFullYear()}
                          onChange={(e) => {
                            const y = Number(e.target.value);
                            setCalendarMonth(clampMonth(new Date(y, calendarMonth.getMonth(), 1)));
                          }}
                          className="rounded-md border px-2 py-1 text-sm"
                        >
                          {(() => {
                            const currentYear = new Date().getFullYear();
                            const start = currentYear - 18;
                            const end = currentYear - 80;
                            const years = [] as number[];
                            for (let yy = start; yy >= end; yy--) years.push(yy);
                            return years.map((y) => <option key={y} value={y}>{y}</option>);
                          })()}
                        </select>
                      </div>
                      <Calendar
                        mode="single"
                        month={calendarMonth}
                        onMonthChange={(m) => setCalendarMonth(clampMonth(m))}
                        selected={dob ?? defaultAdultDate}
                        onSelect={handleDobSelect}
                        fromDate={fromDate}
                        toDate={toDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormData(initialFormData); setDob(undefined); setManagerSearch(""); }} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v4a2 2 0 002 2h2l2 2h6" />
                      </svg>
                      <div className="text-sm">No employees found.</div>
                      <div className="text-xs text-muted-foreground">Click "Add Employee" to create a new one.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.id}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.mobile}</TableCell>
                  <TableCell>{emp.branch}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.dob ? format(new Date(emp.dob), "PPP") : '-'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                      {emp.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
