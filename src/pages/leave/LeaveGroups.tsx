import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import {
  getLeaveTypesApi,
  LeaveTypeItem,
  addLeaveGroupApi,
  getLeaveGroupsApi,
  editLeaveGroupApi,
  deleteLeaveGroupApi,
} from "@/apis/leave";

export default function LeaveGroupsNew() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    groupName: "",
    // selected leave type ids
    selectedLeaveTypes: [] as string[],
    // map of leaveTypeId -> number/string value entered by user
    leaveTypeCounts: {} as Record<string, string>,
    allocationType: "",
    oneDayLeave: "",
    yearEndPolicy: "",
  });

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeItem[]>([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [leaveGroups, setLeaveGroups] = useState<any[]>([]);
  const [loadingLeaveGroups, setLoadingLeaveGroups] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLeaveTypes = async () => {
    try {
      setLoadingLeaveTypes(true);
      const res = await getLeaveTypesApi();
      const items: LeaveTypeItem[] = (res.message as LeaveTypeItem[]) || [];
      setLeaveTypes(items);
    } catch (err) {
      console.error("Failed to load leave types", err);
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  const loadLeaveGroups = async () => {
    try {
      setLoadingLeaveGroups(true);
      const res = await getLeaveGroupsApi();
      const items: any[] = (res.message as any[]) || [];
      setLeaveGroups(items);
    } catch (err) {
      console.error("Failed to load leave groups", err);
    } finally {
      setLoadingLeaveGroups(false);
    }
  };

  const handleEdit = (g: any) => {
    // populate form with existing group data
    setEditingId(g._id);
    const counts: Record<string, string> = {};
    const selected: string[] = [];
    if (Array.isArray(g.leave_types)) {
      g.leave_types.forEach((lt: any) => {
        const lid = lt.leave_type_id;
        const id = typeof lid === 'object' ? lid._id ?? String(lid) : String(lid);
        selected.push(id);
        counts[id] = String(lt.paid_leaves ?? '');
      });
    }

    const allocation = (g.allocation_type || '').toString();
    const allocationVal = allocation.toLowerCase() === 'monthly' ? 'monthly' : 'yearly';

    const mapYearPolicy = (p: string) => {
      switch (p) {
        case 'PayoutManual':
          return 'payout-manual';
        case 'PayoutAuto':
          return 'payout-auto';
        case 'CarryForwardManual':
          return 'carryforward-manual';
        case 'CarryForwardAuto':
          return 'carryforward-auto';
        case 'Reset':
          return 'reset';
        default:
          return p;
      }
    };

    setFormData({
      ...formData,
      groupName: g.name || '',
      selectedLeaveTypes: selected,
      leaveTypeCounts: counts,
      allocationType: allocationVal,
      yearEndPolicy: mapYearPolicy(g.year_end_policy || ''),
    } as any);
    setShowForm(true);
  };

  const handleDelete = async (g: any) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete leave group "${g.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(g._id);
      await deleteLeaveGroupApi({ id: g._id });
      await loadLeaveGroups();
      toast({ title: 'Deleted', description: 'Leave group deleted' });
    } catch (err: any) {
      console.error('Failed to delete leave group', err);
      toast({ title: 'Error', description: err?.message || 'Failed to delete leave group', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadLeaveTypes();
    loadLeaveGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // basic client-side validation (similar to LeaveTypes)
    if (!formData.groupName || String(formData.groupName).trim() === "") {
      toast({ title: 'Validation', description: 'Please enter a leave group name', variant: 'destructive' });
      return;
    }

    if (!formData.selectedLeaveTypes || formData.selectedLeaveTypes.length === 0) {
      toast({ title: 'Validation', description: 'Please select at least one leave type for the group', variant: 'destructive' });
      return;
    }

    // Ensure counts for selected leave types are present and numeric (non-negative integers)
    for (const id of formData.selectedLeaveTypes) {
      const val = formData.leaveTypeCounts?.[id];
      if (val === undefined || val === null || String(val).trim() === "") {
        toast({ title: 'Validation', description: 'Please enter number of leaves for each selected leave type', variant: 'destructive' });
        return;
      }
      if (!/^[0-9]+$/.test(String(val))) {
        toast({ title: 'Validation', description: 'Leave counts must be non-negative integers', variant: 'destructive' });
        return;
      }
    }

    if (!formData.allocationType || (formData.allocationType !== 'monthly' && formData.allocationType !== 'yearly')) {
      toast({ title: 'Validation', description: 'Please choose a leave allocation type', variant: 'destructive' });
      return;
    }

    if (!formData.yearEndPolicy || String(formData.yearEndPolicy).trim() === '') {
      toast({ title: 'Validation', description: 'Please choose a year-end leave balance policy', variant: 'destructive' });
      return;
    }

    // map UI values to API payload
    const allocationMap = (val: string) => {
      if (!val) return "";
      if (val.toLowerCase() === "monthly") return "Monthly";
      return "Yearly";
    };

    const yearPolicyMap = (val: string) => {
      switch (val) {
        case "payout-manual":
          return "PayoutManual";
        case "payout-auto":
          return "PayoutAuto";
        case "carryforward-manual":
          return "CarryForwardManual";
        case "carryforward-auto":
          return "CarryForwardAuto";
        case "reset":
          return "Reset";
        default:
          return val;
      }
    };
    console.log("[DEBUG] leave type ", formData.selectedLeaveTypes, formData);

    const payload = {
      name: formData.groupName,
      leave_types: Object.entries(formData.leaveTypeCounts).map(
        ([id, value]) => ({
          leave_type_id: id,
          paid_leaves: Number(value),
        })
      ),
      allocation_type: allocationMap(formData.allocationType),
      year_end_policy: yearPolicyMap(formData.yearEndPolicy),
    };
    
  

    (async () => {
      setLoading(true);
      try {
        if (editingId) {
          await editLeaveGroupApi({ id: editingId, ...payload } as any);
          toast({
            title: "Success",
            description: "Leave group updated successfully",
          });
        } else {
          await addLeaveGroupApi(payload as any);
          toast({
            title: "Success",
            description: "Leave group added successfully",
          });
        }

        setFormData({
          groupName: "",
          selectedLeaveTypes: [],
          leaveTypeCounts: {},
          allocationType: "",
          oneDayLeave: "",
          yearEndPolicy: "",
        } as any);
        setShowForm(false);
        setEditingId(null);
        // refresh list
        await loadLeaveGroups();
      } catch (err: any) {
        console.error("Failed to save leave group", err);
        toast({
          title: "Error",
          description: err?.message || "Failed to save leave group",
        });
      } finally {
        setLoading(false);
      }
    })();
  };

  const toggleLeaveType = (id: string, checked: boolean) => {
    const selected = formData.selectedLeaveTypes || [];
    if (checked) {
      // add
      setFormData({ ...formData, selectedLeaveTypes: [...selected, id] });
    } else {
      // remove and clear its count
      const filtered = selected.filter((s) => s !== id);
      const newCounts = { ...(formData.leaveTypeCounts || {}) };
      delete newCounts[id];
      setFormData({
        ...formData,
        selectedLeaveTypes: filtered,
        leaveTypeCounts: newCounts,
      });
    }
  };

  const setLeaveCount = (id: string, val: string) => {
    const newCounts = { ...(formData.leaveTypeCounts || {}) };
    newCounts[id] = val;
    setFormData({ ...formData, leaveTypeCounts: newCounts });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Leave Groups (New)
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure leave group settings
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Leave Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Leave Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Leave Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name"
                    value={formData.groupName}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaveType">Select Leave Types</Label>
                  <div className="space-y-2">
                    {loadingLeaveTypes ? (
                      <div className="text-sm text-muted-foreground">
                        Loading leave types...
                      </div>
                    ) : leaveTypes.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No leave types found.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {leaveTypes.map((lt) => {
                          const selected = (
                            formData.selectedLeaveTypes || []
                          ).includes(lt._id);
                          return (
                            <div
                              key={lt._id}
                              className="flex items-center gap-3"
                            >
                              <Checkbox
                                checked={selected}
                                onCheckedChange={(val) =>
                                  toggleLeaveType(lt._id, Boolean(val))
                                }
                              />
                              <div className="flex-1">{lt.name}</div>
                              {selected && (
                                <Input
                                  type="number"
                                  placeholder="Enter number"
                                  className="w-28"
                                  value={
                                    formData.leaveTypeCounts?.[lt._id] ?? ""
                                  }
                                  onChange={(e) =>
                                    setLeaveCount(lt._id, e.target.value)
                                  }
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allocationType">Leave Allocation Type</Label>
                  <div className="text-sm text-muted-foreground">
                    Choose how leaves are allocated to employees.
                  </div>
                  <Select
                    value={formData.allocationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, allocationType: value })
                    }
                  >
                    <SelectTrigger className="w-full relative pl-3 pr-10">
                      <SelectValue placeholder="Select type" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearEndPolicy">
                    Year End Leave Balance Policy
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    What happens to remaining balances at the end of the year.
                  </div>
                  <Select
                    value={formData.yearEndPolicy}
                    onValueChange={(value) =>
                      setFormData({ ...formData, yearEndPolicy: value })
                    }
                  >
                    <SelectTrigger className="w-full relative pl-3 pr-10">
                      <SelectValue placeholder="Select policy" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="payout-manual">
                        Payout or Carry Forward (Manually)
                      </SelectItem>
                      <SelectItem value="payout-auto">
                        Payout or Carry Forward (Automatically)
                      </SelectItem>
                      <SelectItem value="reset">Reset to Zero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update' : 'Submit'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      groupName: "",
                      selectedLeaveTypes: [],
                      leaveTypeCounts: {},
                      allocationType: "",
                      oneDayLeave: "",
                      yearEndPolicy: "",
                    } as any);
                  }}
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
                <TableHead>Group Name</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Allocation</TableHead>
                <TableHead>Year End Policy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingLeaveGroups ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    Loading leave groups...
                  </TableCell>
                </TableRow>
              ) : leaveGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v4a2 2 0 002 2h2l2 2h6" />
                      </svg>
                      <div className="text-sm">No leave groups found.</div>
                      <div className="text-xs text-muted-foreground">Click "Add Leave Group" to create a new one.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leaveGroups.map((g) => (
                  <TableRow key={g._id}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell>
                      {Array.isArray(g.leave_types)
                        ? g.leave_types
                            .map((lt: any) => {
                              const lid = lt.leave_type_id;
                              const name = typeof lid === "object" ? lid.name : String(lid);
                              return `${name}${lt.paid_leaves ? ` (${lt.paid_leaves})` : ""}`;
                            })
                            .join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell>{g.allocation_type}</TableCell>
                    <TableCell>{g.year_end_policy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(g)}
                          disabled={deletingId === g._id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(g)}
                          disabled={deletingId === g._id}
                        >
                          {deletingId === g._id ? (
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
