import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage } from '@/utils/localstorage';
import { getManagerLeaveRequestsApi } from '@/apis/leave';

export default function LeaveRequests() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    branch: "",
    department: "",
    employee: "",
    employeeType: "",
  });

  const [status, setStatus] = useState<string>('Pending');
  const [requests, setRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  const [showResults, setShowResults] = useState(false);

  const handleGetData = () => {
    // call manager leave requests API
    const doLoad = async () => {
      try {
        setFetching(true);
        const storedUser = getFromLocalStorage<Record<string, unknown>>('userInfo');
        const userId = (storedUser && ((storedUser as any)?.user?._id as string)) || '';
        const payload: any = { id: userId };
        if (status) payload.status = status;
        const res = await getManagerLeaveRequestsApi(payload);
        const items = (res?.message || []) as any[];
        setRequests(items);
        setShowResults(true);
        toast({ title: 'Loaded', description: `${items.length} requests loaded` });
      } catch (err: any) {
        const message = err instanceof Error ? err.message : 'Failed to load requests';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setFetching(false);
      }
    };

    doLoad();
  };

  // auto-load pending requests on mount
  useEffect(() => {
    
    handleGetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = (name: string) => {
    toast({
      title: "Approved",
      description: `Leave request for ${name} has been approved`,
    });
  };

  const handleReject = (name: string) => {
    toast({
      title: "Rejected",
      description: `Leave request for ${name} has been rejected`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
        <p className="text-muted-foreground mt-1">Review and manage leave requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Select Branch</Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => setFormData({ ...formData, branch: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="hq">Head Office</SelectItem>
                  <SelectItem value="branch1">Branch 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Select Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee</Label>
              <Select
                value={formData.employee}
                onValueChange={(value) => setFormData({ ...formData, employee: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="emp1">John Doe</SelectItem>
                  <SelectItem value="emp2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeType">Select Employee Type</Label>
              <Select
                value={formData.employeeType}
                onValueChange={(value) => setFormData({ ...formData, employeeType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Employee</SelectItem>
                  <SelectItem value="ex">Ex Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

            <div className="mt-6">
            <div className="flex gap-2">
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGetData} disabled={fetching}>
                {fetching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Get Data'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Leave Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Day Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="font-medium">No requests found</TableCell>
                    </TableRow>
                  ) : (
                    requests.map((r: any, idx: number) => {
                      // map common fields defensively
                      const emp = r.employee_id || r.employee || {};
                      const branch = (r.branch || r.branch_id || r.branchName) || '-';
                      const dept = (r.department || r.department_id || r.departmentName) || '-';
                      const requestedAt = r.createdAt ? format(new Date(r.createdAt), 'PPP') : (r.requestedDate ? format(new Date(r.requestedDate), 'PPP') : '-');
                      const leaveDate = (() => {
                        if (r.fromDate && r.toDate) return `${format(new Date(r.fromDate), 'PPP')} - ${format(new Date(r.toDate), 'PPP')}`;
                        if (r.leaveDate) return format(new Date(r.leaveDate), 'PPP');
                        return r.leave_range || '-';
                      })();
                      const type = (r.leave_type && r.leave_type.name) || (r.leaveType && r.leaveType.name) || (r.type || '-');
                      const dayType = r.dayType || r.day_type || r.day || '-';
                      const reason = r.reason || '-';

                      return (
                        <TableRow key={r._id ?? r.id ?? idx}>
                          <TableCell className="font-medium">{emp?.name || 'Unknown'}</TableCell>
                          <TableCell>{branch}</TableCell>
                          <TableCell>{dept}</TableCell>
                          <TableCell>{requestedAt}</TableCell>
                          <TableCell>{leaveDate}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              {type}
                            </span>
                          </TableCell>
                          <TableCell>{dayType}</TableCell>
                          <TableCell className="max-w-xs truncate">{reason}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApprove(emp?.name || 'employee')}
                                className="text-success hover:text-success"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(emp?.name || 'employee')}
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
