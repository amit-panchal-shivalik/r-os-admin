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
// no icon imports needed here
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useToast } from "@/hooks/use-toast";
import { getDepartmentsApi, getBranchesApi } from '@/apis/employee';
import { getLeaveGroupsApi, addLeaveAssignmentApi, getLeaveAssignmentsApi, deleteLeaveAssignmentApi } from '@/apis/leave';

export default function BulkLeaveAssignment() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    branch: "",
    department: "",
    year: "",
    leaveGroup: "",
    employee: "",
  });
  const initialFormData = { branch: "", department: "", year: "", leaveGroup: "", employee: "" };
  const [branches, setBranches] = useState<Array<{ _id?: string; name?: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ _id?: string; name?: string; branch_id?: string }>>([]);
  const [leaveGroups, setLeaveGroups] = useState<Array<{ _id?: string; name?: string }>>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = [String(currentYear), String(currentYear + 1)];
  const [assignments, setAssignments] = useState<Array<any>>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation: leave group and year are required
    if (!formData.leaveGroup) {
      toast({ title: 'Validation', description: 'Please select a leave group', variant: 'destructive' });
      return;
    }
    if (!formData.year) {
      toast({ title: 'Validation', description: 'Please select a year', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        branch_id: formData.branch || undefined,
        department_id: formData.department || undefined,
        leave_group_id: formData.leaveGroup,
        year: formData.year,
      } as const;

    const res = await addLeaveAssignmentApi(payload as any);
    const message = (res && (typeof res.message === 'string' ? res.message : JSON.stringify(res.message))) || 'Assigned successfully';
    toast({ title: 'Success', description: String(message) });
    // reset and refresh list from server
    setFormData(initialFormData);
    setShowForm(false);
    await loadAssignments();
    } catch (err) {
      console.error('Assign failed', err);
      toast({ title: 'Assign failed', description: (err as any)?.message || 'Failed to assign leave', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const loadLists = async () => {
    try {
      setLoadingLists(true);
      const [deptRes, branchRes] = await Promise.all([getDepartmentsApi(), getBranchesApi()]);
      const lgRes = await getLeaveGroupsApi();
      setDepartments((deptRes.message as any[]) || []);
      setBranches((branchRes.message as any[]) || []);
      setLeaveGroups((lgRes.message as any[]) || []);
      // no per-employee loading here; bulk assign is per branch/department/group/year
    } catch (err) {
      console.error('Failed to load lists', err);
    } finally {
      setLoadingLists(false);
    }
  };

  // helper to normalize branch id from department item (like Employees.tsx)
  const normalizeBranchId = (d: any) => {
    if (!d) return '';
    return (
      d.branch_id ?? d.branchId ??
      (d.branch && (d.branch._id ?? d.branch.id)) ??
      d.branch ?? ''
    );
  };

  const filteredDepartments = (() => {
    if (!formData.branch) return departments;
    const selectedBranchId = String(formData.branch || '');
    const filtered = (departments as any[]).filter((d) => {
      const bid = String(normalizeBranchId(d) || '');
      return bid === selectedBranchId;
    });
    return filtered;
  })();

  const loadAssignments = async () => {
    try {
      const res = await getLeaveAssignmentsApi();
      const items = (res.message || []) as any[];
      // map to local shape with names
      const mapped = items.map((it) => {
        const id = it._id || it.id || String(Date.now());

        // branch_id may be an object or a string
        const branchObj = it.branch_id || it.branch || null;
        const branchId = typeof branchObj === 'string' ? branchObj : (branchObj?._id || '');
        const branchName = typeof branchObj === 'object' && branchObj?.name ? branchObj.name : (branches.find((b) => (b._id ?? '') === branchId)?.name || '');

        // department_id may be an object or a string
        const deptObj = it.department_id || it.department || null;
        const departmentId = typeof deptObj === 'string' ? deptObj : (deptObj?._id || '');
        const departmentName = typeof deptObj === 'object' && deptObj?.name ? deptObj.name : (departments.find((d) => (d._id ?? '') === departmentId)?.name || '');

        // leave_group_id could be string or object
        const lgObj = it.leave_group_id || null;
        const leaveGroupId = typeof lgObj === 'string' ? lgObj : (lgObj?._id || '');
        const leaveGroupName = typeof lgObj === 'object' && lgObj?.name ? lgObj.name : (leaveGroups.find((l) => (l._id ?? '') === leaveGroupId)?.name || '');

        return {
          id,
          branch_id: branchId,
          department_id: departmentId,
          leave_group_id: leaveGroupId,
          year: it.year,
          branchName,
          departmentName,
          leaveGroupName,
          createdAt: it.createdAt,
        };
      });
      setAssignments(mapped);
    } catch (err) {
      console.error('Failed to load assignments', err);
    }
  };

  useEffect(() => {
    (async () => {
      await loadLists();
      await loadAssignments();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Leave Assignment</h1>
          <p className="text-muted-foreground mt-1">Assign leave groups by branch/department and year</p>
        </div>
        <Button onClick={() => { setFormData(initialFormData); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Bulk Leave Assignment
        </Button>
      </div>

  <div className="grid grid-cols-1 gap-6">
        {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Select Branch</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value, department: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingLists ? (
                        <SelectItem value="__loading" disabled>Loading...</SelectItem>
                      ) : branches.length === 0 ? (
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
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    disabled={!formData.branch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingLists ? (
                        <SelectItem value="__loading" disabled>Loading...</SelectItem>
                      ) : !formData.branch ? (
                        <SelectItem value="__select_branch" disabled>Select branch first</SelectItem>
                      ) : filteredDepartments.length === 0 ? (
                        <SelectItem value="__no_dept" disabled>No departments for selected branch</SelectItem>
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
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaveGroup">Select Leave Group</Label>
                  <Select
                    value={formData.leaveGroup}
                    onValueChange={(value) => setFormData({ ...formData, leaveGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave group" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingLists ? (
                        <SelectItem value="__loading" disabled>Loading...</SelectItem>
                      ) : leaveGroups.length === 0 ? (
                        <SelectItem value="__no_group" disabled>No leave groups</SelectItem>
                      ) : (
                        leaveGroups.map((g, idx) => (
                          <SelectItem key={g._id ?? g.name ?? idx} value={g._id ?? String(idx)}>{g.name ?? g._id}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Leave'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setFormData(initialFormData); setShowForm(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Bulk Leave Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Leave Group</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v4a2 2 0 002 2h2l2 2h6" />
                        </svg>
                        <div className="text-sm">No bulk leave assignments found.</div>
                        <div className="text-xs text-muted-foreground">Use the form to assign a leave group by branch/department and year.</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.branchName || '-'}</TableCell>
                      <TableCell>{a.departmentName || '-'}</TableCell>
                      <TableCell>{a.leaveGroupName || '-'}</TableCell>
                      <TableCell>{a.year}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  const result = await Swal.fire({
                                    title: 'Are you sure?',
                                    text: 'Do you want to delete this bulk assignment?',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'Yes, delete it',
                                    cancelButtonText: 'Cancel',
                                    confirmButtonColor: '#dc2626',
                                  });
                                  if (!result.isConfirmed) return;
                                  setDeletingId(a.id);
                                  try {
                                    await deleteLeaveAssignmentApi({ id: a.id });
                                    toast({ title: 'Deleted', description: 'Assignment deleted' });
                                    await loadAssignments();
                                  } catch (err) {
                                    toast({ title: 'Error', description: (err as any)?.message || 'Failed to delete', variant: 'destructive' });
                                  } finally {
                                    setDeletingId(null);
                                  }
                                }}
                              >
                                {deletingId === a.id ? (
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
    </div>
  );
}
