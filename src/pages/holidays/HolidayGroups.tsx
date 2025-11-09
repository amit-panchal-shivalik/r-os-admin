import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { getHolidaysApi, HolidayItem, addHolidayGroupApi, getHolidayGroupsApi, editHolidayGroupApi, deleteHolidayGroupApi } from '@/apis/holiday';
import { format, parse } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

export default function HolidayGroups() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [selectedHolidayIds, setSelectedHolidayIds] = useState<string[]>([]);
  const [holidayGroups, setHolidayGroups] = useState<Array<any>>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const initialHolidayGroupState = { groupName: '', selectedHolidayIds: [] as string[] };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: same style as LeaveTypes
    if (!groupName || String(groupName).trim() === '') {
      toast({ title: 'Validation', description: 'Please enter a holiday group name', variant: 'destructive' });
      return;
    }
    if (!selectedHolidayIds || selectedHolidayIds.length === 0) {
      toast({ title: 'Validation', description: 'Please choose at least one holiday for the group', variant: 'destructive' });
      return;
    }
    (async () => {
      setSaving(true);
      try {
        if (editingId) {
          const payload = { id: editingId, name: groupName.trim(), holiday_id: selectedHolidayIds };
          await editHolidayGroupApi(payload as any);
          toast({ title: 'Updated', description: 'Holiday group updated successfully' });
        } else {
          const payload = { name: groupName.trim(), holiday_id: selectedHolidayIds };
          const res = await addHolidayGroupApi(payload as any);
          const msg = (res && (res.message ?? res.result)) || 'Holiday group added successfully';
          toast({ title: 'Success', description: String(msg) });
        }
        await loadHolidayGroups();
        // reset form state
        setGroupName(initialHolidayGroupState.groupName);
        setSelectedHolidayIds(initialHolidayGroupState.selectedHolidayIds);
        setShowForm(false);
        setEditingId(null);
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || (editingId ? 'Failed to update holiday group' : 'Failed to add holiday group'), variant: 'destructive' });
      } finally {
        setSaving(false);
      }
    })();
  };

  const handleEditClick = (g: any) => {
    setGroupName(g.name || '');
    const holidaysArr = Array.isArray(g.holidays) ? g.holidays : (Array.isArray(g.holiday_id) ? g.holiday_id : (Array.isArray(g.holiday_ids) ? g.holiday_ids : []));
    const ids = holidaysArr.map((h: any) => (h && (h._id ?? h.id)) || String(h));
    setSelectedHolidayIds(ids);
    setEditingId(g._id ?? g.id ?? g.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (g: any) => {
    const id = g._id ?? g.id ?? g.id;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this holiday group?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      setDeletingId(id);
      await deleteHolidayGroupApi({ id });
      await loadHolidayGroups();
      toast({ title: 'Deleted', description: 'Holiday group deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete holiday group', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const loadHolidayGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await getHolidayGroupsApi();
      const raw = (res as any)?.message ?? (res as any)?.result ?? res;
      let items: any[] = [];
      if (Array.isArray(raw)) items = raw;
      else if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.data)) items = raw.data;
        else items = Object.values(raw) as any[];
      }
      // normalize groups: ensure holidays array is in `holidays`
      const normalized = (items || []).map((g: any) => {
        const id = g._id ?? g.id ?? String(Math.random());
        const holidaysArr = Array.isArray(g.holiday_id)
          ? g.holiday_id
          : Array.isArray(g.holiday_ids)
          ? g.holiday_ids
          : Array.isArray(g.holidays)
          ? g.holidays
          : [];
        return {
          id,
          _id: id,
          name: g.name,
          holidays: holidaysArr,
          holidayCount: holidaysArr.length,
          createdAt: g.createdAt,
        } as any;
      });
      setHolidayGroups(normalized || []);
    } catch (err) {
      console.error('Failed to load holiday groups', err);
      toast({ title: 'Error', description: 'Failed to load holiday groups', variant: 'destructive' });
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadHolidays = async () => {
    try {
      setLoadingHolidays(true);
      const res = await getHolidaysApi();
      // normalize like HolidayList: API may return array in message or nested
      const raw = (res as any)?.message ?? (res as any)?.result ?? res;
      let items: any[] = [];
      if (Array.isArray(raw)) items = raw;
      else if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.data)) items = raw.data;
        else items = Object.values(raw) as any[];
      }
      // map to HolidayItem shape if needed
      const normalized = (items || []).map((it: any) => ({
        id: it.id ?? it._id ?? String(it._id ?? it.id ?? Math.random()),
        name: it.name,
        date: it.date,
        description: it.description,
      })) as HolidayItem[];
      setHolidays(normalized);
    } catch (err) {
      console.error('Failed to load holidays', err);
      toast({ title: 'Error', description: 'Failed to load holidays', variant: 'destructive' });
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadHolidays();
      await loadHolidayGroups();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseHolidayDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const asDate = new Date(dateStr);
    if (!isNaN(asDate.getTime())) return asDate;
    const parsed = parse(dateStr, 'dd-MM-yyyy', new Date());
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holiday Groups</h1>
          <p className="text-muted-foreground mt-1">Organize holidays into groups</p>
        </div>
        <Button onClick={() => { setGroupName(initialHolidayGroupState.groupName); setSelectedHolidayIds(initialHolidayGroupState.selectedHolidayIds); setShowForm(!showForm); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Holiday Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Update Holiday Group' : 'Add New Holiday Group'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Holiday Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., National Holidays"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="holidays">Select Holidays</Label>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedHolidayIds(holidays.map(h => h.id))}>Select all</Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedHolidayIds([])}>Clear selection</Button>
                  </div>
                </div>
                <div className="border rounded-md p-3 max-h-72 overflow-auto">
                  {loadingHolidays ? (
                    <div className="text-sm text-muted-foreground">Loading holidays...</div>
                  ) : holidays.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No holidays found. Add holidays first.</div>
                  ) : (
                    <div className="space-y-2">
                      {holidays.map((h) => {
                        const parsed = parseHolidayDate(h.date);
                        return (
                        <label key={h.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedHolidayIds.includes(h.id)}
                            onCheckedChange={(v) => {
                              const checked = Boolean(v);
                              if (checked) setSelectedHolidayIds((s) => Array.from(new Set([...s, h.id])));
                              else setSelectedHolidayIds((s) => s.filter((id) => id !== h.id));
                            }}
                          />
                          <div className="text-sm">
                            <div className="font-medium">{h.name}</div>
                            <div className="text-xs text-muted-foreground">{parsed ? format(parsed, 'PPP') : h.date}</div>
                          </div>
                        </label>
                      )})}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      {editingId ? 'Saving...' : 'Saving...'}
                    </>
                  ) : (
                    editingId ? 'Update' : 'Submit'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setGroupName(initialHolidayGroupState.groupName); setSelectedHolidayIds(initialHolidayGroupState.selectedHolidayIds); }}>
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
                <TableHead>Group Name</TableHead>
                <TableHead>Number of Holidays</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {holidayGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v4a2 2 0 002 2h2l2 2h6" />
                        </svg>
                        <div className="text-sm">No holiday groups found.</div>
                        <div className="text-xs text-muted-foreground">Click "Add Holiday Group" to create a new one.</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  holidayGroups.map((g) => {
                    // count holidays: prefer g.holidays array, else g.holiday_ids
                    const count = Array.isArray(g.holidays) ? g.holidays.length : (Array.isArray(g.holiday_ids) ? g.holiday_ids.length : 0);
                    return (
                      <TableRow key={g._id ?? g.id}>
                        <TableCell className="font-medium">{g.name}</TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(g)}
                              disabled={deletingId === (g._id ?? g.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(g)}
                              disabled={deletingId === (g._id ?? g.id)}
                            >
                              {deletingId === (g._id ?? g.id) ? (
                                <div className="w-4 h-4 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
