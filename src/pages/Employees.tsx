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
import { getEmployeesApi, EmployeeItem } from '@/apis/employee';
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
    mobile: "",
    branch: "",
    department: "",
    status: "Active",
  });
  const [dob, setDob] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee: Employee = {
      id: `EMP${Date.now().toString().slice(-6)}`,
      name: formData.name,
      mobile: formData.mobile,
      branch: formData.branch || "Head Office",
      department: formData.department || "",
      dob: dob ? dob.toISOString().split("T")[0] : undefined,
      status: formData.status || 'Active',
    };
    setEmployees([newEmployee, ...employees]);
    setFormData({ name: "", mobile: "", branch: "", department: "", status: "Active" });
    setDob(undefined);
    setShowForm(false);
    toast({
      title: "Success",
      description: "Employee added successfully",
    });
  };

  const loadEmployees = async () => {
    try {
      setTableLoading(true);
      // read user id from localStorage via helper
      const storedUser = getFromLocalStorage<Record<string, unknown>>('userInfo');
      console.log('[DEBUG]', storedUser?.user?._id);
      const userId = (storedUser && (storedUser?.user?._id as string)) || '';

      const res = await getEmployeesApi({ id: userId });
      const items: EmployeeItem[] = res.message || [];
      const mapped = items.map((it) => ({
        id: it._id,
        name: it.name || `${(it.firstName || '')} ${(it.lastName || '')}`.trim() || 'Unknown',
        mobile: (it.mobile || it.phone || '') as string,
        branch: typeof it.branch === 'string' ? it.branch : ((it.branch as { name?: string })?.name) || '',
        department: typeof it.department === 'string' ? it.department : ((it.department as { name?: string })?.name) || '',
        dob: (it.dob || it.dateOfBirth) as string | undefined,
        status: it.isActive ? 'Active' : 'Inactive',
      }));
      setEmployees(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load employees';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage employee information</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
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
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    placeholder="e.g., +91 98765 43210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Head Office">Head Office</SelectItem>
                      <SelectItem value="Branch 1">Branch 1</SelectItem>
                      <SelectItem value="Branch 2">Branch 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={!dob ? "w-full justify-start text-left font-normal text-muted-foreground" : "w-full justify-start text-left font-normal"}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, "PPP") : <span>Pick date of birth</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dob} onSelect={setDob} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                
              </div>

              <div className="flex gap-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
