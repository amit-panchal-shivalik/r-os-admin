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
import { useToast } from "@/hooks/use-toast";
import { getHolidayGroupsApi, getHolidayGroupAssignmentsApi, assignHolidayGroupApi, deleteAssignHolidayGroupApi } from '@/apis/holiday';
import { getBranchesApi } from '@/apis/employee';
import Swal from 'sweetalert2';

export default function AssignHolidayGroups() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    holidayGroup: "",
    branch: "",
  });
  const [holidayGroups, setHolidayGroups] = useState<Array<any>>([]);
  const [branches, setBranches] = useState<Array<any>>([]);
  const [assignments, setAssignments] = useState<Array<any>>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // load assignments (defined before effects so it can be called safely)
  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const res = await getHolidayGroupAssignmentsApi();
      const raw = (res as any)?.message ?? (res as any)?.result ?? res;
      let items: any[] = [];
      if (Array.isArray(raw)) items = raw;
      else if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.data)) items = raw.data;
        else items = Object.values(raw) as any[];
      }
      // normalize: each item may contain branch or branch_id and holiday_group or holiday_group_id
      const normalized = (items || []).map((it: any) => {
        const id = it._id ?? it.id ?? String(Math.random());
        // branch name might be nested
        const branchObj = it.branch ?? it.branch_id ?? it.branch_info ?? null;
        const branchName = typeof branchObj === 'object' ? (branchObj.name ?? branchObj.branch_name ?? String(branchObj._id ?? branchObj.id ?? '')) : String(branchObj ?? it.branch_name ?? it.branchName ?? '');
        const groupObj = it.holiday_group ?? it.holiday_group_id ?? it.holiday_group_info ?? null;
        const groupName = typeof groupObj === 'object' ? (groupObj.name ?? groupObj.group_name ?? String(groupObj._id ?? groupObj.id ?? '')) : String(groupObj ?? it.holiday_group_name ?? it.groupName ?? '');
        return { id, branchId: it.branch_id ?? (branchObj && (branchObj._id ?? branchObj.id)) ?? it.branch, branchName, groupId: it.holiday_group_id ?? (groupObj && (groupObj._id ?? groupObj.id)) ?? it.holiday_group, groupName, status: it.status ?? 'Assigned' };
      });
      setAssignments(normalized);
    } catch (err) {
      console.error('Failed to load assignments', err);
      toast({ title: 'Error', description: 'Failed to load assignments', variant: 'destructive' });
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [hgRes, brRes] = await Promise.all([getHolidayGroupsApi(), getBranchesApi()]);
        // normalize holiday groups
        const rawHg = (hgRes as any)?.message ?? (hgRes as any)?.result ?? hgRes;
        let hgItems: any[] = [];
        if (Array.isArray(rawHg)) hgItems = rawHg;
        else if (rawHg && typeof rawHg === 'object') {
          if (Array.isArray(rawHg.data)) hgItems = rawHg.data;
          else hgItems = Object.values(rawHg) as any[];
        }
        const normalizedHg = (hgItems || []).map((g: any) => ({ id: g._id ?? g.id ?? String(g._id ?? g.id ?? Math.random()), name: g.name }));
        setHolidayGroups(normalizedHg);

        // normalize branches
        const rawBr = (brRes as any)?.message ?? (brRes as any)?.result ?? brRes;
        let brItems: any[] = [];
        if (Array.isArray(rawBr)) brItems = rawBr;
        else if (rawBr && typeof rawBr === 'object') {
          if (Array.isArray(rawBr.data)) brItems = rawBr.data;
          else brItems = Object.values(rawBr) as any[];
        }
        const normalizedBr = (brItems || []).map((b: any) => ({ id: b._id ?? b.id ?? String(Math.random()), name: b.name }));
          setBranches(normalizedBr);
          // load assignments after groups & branches to map names
          await loadAssignments();
      } catch (err) {
        console.error('Failed to load holiday groups or branches', err);
        toast({ title: 'Error', description: 'Failed to load holiday groups or branches', variant: 'destructive' });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      // find names for validation
      const hg = holidayGroups.find((h) => h.id === formData.holidayGroup);
      const br = branches.find((b) => b.id === formData.branch);
      if (!hg || !br) {
        toast({ title: 'Missing selection', description: 'Please select both holiday group and branch', variant: 'destructive' });
        return;
      }
      try {
        const payload = { holiday_group_id: hg.id, branch_id: br.id };
        const res = await assignHolidayGroupApi(payload as any);
        const msg = (res && (res.message ?? res.result)) || 'Assigned successfully';
        toast({ title: 'Success', description: String(msg) });
        setFormData({ holidayGroup: '', branch: '' });
        await loadAssignments();
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || 'Failed to assign holiday group', variant: 'destructive' });
      }
    })();
  };

  const handleDelete = async (assignment: any) => {
    const id = assignment.id;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this assignment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      setDeletingId(id);
      await deleteAssignHolidayGroupApi({ id });
      toast({ title: 'Deleted', description: 'Assignment deleted successfully' });
      await loadAssignments();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete assignment', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assign Holiday Groups</h1>
        <p className="text-muted-foreground mt-1">Assign holiday groups to branches</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign Holiday Group to Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holidayGroup">Select Holiday Group</Label>
                <Select
                  value={formData.holidayGroup}
                  onValueChange={(value) => setFormData({ ...formData, holidayGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select holiday group" />
                  </SelectTrigger>
                  <SelectContent>
                    {holidayGroups.length === 0 ? (
                      <SelectItem value="no-holiday-groups" disabled>No holiday groups</SelectItem>
                    ) : (
                      holidayGroups.map((hg) => (
                        <SelectItem key={hg.id} value={hg.id}>{hg.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

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
                    {branches.length === 0 ? (
                      <SelectItem value="no-branches" disabled>No branches</SelectItem>
                    ) : (
                      branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit">Assign Holiday Group</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingAssignments ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading assignments...</div>
              ) : assignments.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No assignments yet. Use the form above to assign a holiday group to a branch.</div>
              ) : (
                assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{a.branchName}</p>
                      <p className="text-sm text-muted-foreground">{a.groupName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">{a.status}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a)} disabled={deletingId === a.id}>
                        {deletingId === a.id ? (<div className="w-4 h-4 rounded-full border-2 border-destructive border-t-transparent animate-spin" />) : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
