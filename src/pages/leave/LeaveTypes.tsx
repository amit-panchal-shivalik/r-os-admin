import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import Swal from 'sweetalert2';
import { useToast } from "@/hooks/use-toast";
import { addLeaveTypeApi, getLeaveTypesApi, LeaveTypeItem, editLeaveTypeApi } from '@/apis/leave';

interface LeaveType {
  id: string;
  name: string;
  applyOnHoliday: string;
  applyOnPastDays: string;
  status: string;
}

export default function LeaveTypes() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    applyOnHoliday: "",
    applyOnPastDays: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadLeaveTypes = async () => {
    try {
      const res = await getLeaveTypesApi();
      const items: LeaveTypeItem[] = res.message || [];
      const mapped: LeaveType[] = items.map((it) => ({
        id: it._id,
        name: it.name,
        applyOnHoliday: it.applyOnHoliday ? 'Yes' : 'No',
        applyOnPastDays: it.applyOnPastDays ? 'Yes' : 'No',
        status: it.isActive ? 'Active' : 'Inactive',
      }));
      setLeaveTypes(mapped);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load leave types', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadLeaveTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // convert form values to payload expected by backend
    const payload = {
      name: formData.name,
      applyOnHoliday: formData.applyOnHoliday === 'Yes',
      applyOnPastDays: formData.applyOnPastDays === 'Yes',
      isActive: formData.status === 'Active',
    };
    try {
      setLoading(true);
      if (editingId) {
        // perform edit
        setSavingId(editingId);
        await editLeaveTypeApi({ id: editingId, ...payload });
        await loadLeaveTypes();
        setFormData({ name: "", applyOnHoliday: "", applyOnPastDays: "", status: "" });
        setShowForm(false);
        setEditingId(null);
        toast({ title: 'Updated', description: 'Leave type updated successfully' });
      } else {
        // add new
        await addLeaveTypeApi(payload);
        // refresh list from server
        await loadLeaveTypes();
        setFormData({ name: "", applyOnHoliday: "", applyOnPastDays: "", status: "" });
        setShowForm(false);
        toast({ title: 'Success', description: 'Leave type added successfully' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save leave type';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setSavingId(null);
    }
  };

  const handleEditClick = (lt: LeaveType) => {
    setFormData({
      name: lt.name,
      applyOnHoliday: lt.applyOnHoliday,
      applyOnPastDays: lt.applyOnPastDays,
      status: lt.status,
    });
    setEditingId(lt.id);
    setShowForm(true);
    // scroll to top so form is visible (optional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this leave type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      // call delete API
      const mod = await import('@/apis/leave');
      await mod.deleteLeaveTypeApi({ id });
      // reload list after delete
      await loadLeaveTypes();
      toast({
        title: 'Deleted',
        description: 'Leave type deleted successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete leave type';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Types</h1>
          <p className="text-muted-foreground mt-1">Manage different types of leave</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Leave Type
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Leave Type</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Leave Type Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Casual Leave"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applyOnHoliday">Apply Leave on Holiday</Label>
                  <Select
                    value={formData.applyOnHoliday}
                    onValueChange={(value) => setFormData({ ...formData, applyOnHoliday: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applyOnPastDays">Apply Leave on Past Days</Label>
                  <Select
                    value={formData.applyOnPastDays}
                    onValueChange={(value) => setFormData({ ...formData, applyOnPastDays: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      {editingId ? 'Saving...' : 'Saving...'}
                    </>
                  ) : (
                    editingId ? 'Update' : 'Submit'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", applyOnHoliday: "", applyOnPastDays: "", status: "" }); }}
                >
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
                <TableHead>Leave Type Name</TableHead>
                <TableHead>Apply on Holiday</TableHead>
                <TableHead>Apply on Past Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v4a2 2 0 002 2h2l2 2h6" />
                      </svg>
                      <div className="text-sm">No leave types found.</div>
                      <div className="text-xs text-muted-foreground">Click "Add Leave Type" to create a new one.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell className="font-medium">{leaveType.name}</TableCell>
                  <TableCell>{leaveType.applyOnHoliday}</TableCell>
                  <TableCell>{leaveType.applyOnPastDays}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        leaveType.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {leaveType.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(leaveType)}
                            disabled={deletingId === leaveType.id || savingId === leaveType.id || loading}
                          >
                            {savingId === leaveType.id ? (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(leaveType.id)}
                        disabled={deletingId === leaveType.id}
                      >
                        {deletingId === leaveType.id ? (
                          <div className="w-4 h-4 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
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
