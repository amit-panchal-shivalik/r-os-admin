import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import Swal from 'sweetalert2';
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getHolidaysApi, HolidayItem, addHolidayApi, AddHolidayPayload, deleteHolidayApi, editHolidayApi } from "@/apis/holiday";

export default function HolidayList() {
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast({ title: "Validation", description: "Please enter holiday name", variant: 'destructive' });
      return;
    }
    if (!date) {
      toast({ title: "Validation", description: "Please pick a date", variant: 'destructive' });
      return;
    }
    if (!formData.description || String(formData.description).trim() === '') {
      toast({ title: 'Validation', description: 'Please enter holiday description', variant: 'destructive' });
      return;
    }
    const payload = {
      name: formData.name.trim(),
      date: format(date, 'dd-MM-yyyy'),
      description: formData.description?.trim() || '',
    } as AddHolidayPayload;

    // If editingId is present, call edit API
    if (editingId) {
      setSavingId(editingId);
      try {
        await editHolidayApi({ id: editingId, ...payload });
        toast({ title: 'Updated', description: 'Holiday updated successfully' });
        setFormData({ name: '', description: '' });
        setDate(undefined);
        setShowForm(false);
        setEditingId(null);
        await loadHolidays();
      } catch (err: any) {
        const message = err instanceof Error ? err.message : 'Failed to update holiday';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setSavingId(null);
      }
      return;
    }

    setAdding(true);
    try {
      const res = await addHolidayApi(payload);
      if (res && (res.success === true || !res.success)) {
        // API may return success flag; treat as success if no error thrown
        toast({ title: "Success", description: res.message || "Holiday added successfully" });
        setFormData({ name: "", description: "" });
        setDate(undefined);
        setShowForm(false);
        await loadHolidays();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || 'Failed to add holiday', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (h: HolidayItem) => {
    setFormData({ name: h.name || '', description: h.description || '' });
    const parsed = parseHolidayDate(h.date);
    setDate(parsed ?? undefined);
    setEditingId(h.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadHolidays = async () => {
    setLoading(true);
    try {
  const res = await getHolidaysApi();
  console.log('[DEBUG] Holiday Response ', res );
  // Normalize response to an array and canonicalize items before setting state.
  // API may return items with `_id` instead of `id`, and date in `dd-MM-yyyy`.
  const raw = res?.message;
  let items: any[] = [];

  if (Array.isArray(raw)) {
    items = raw;
  } else if (raw && typeof raw === "object") {
    if (Array.isArray((raw as any).data)) {
      items = (raw as any).data;
    } else {
      items = Object.values(raw);
    }
  }

  const normalized = (items || []).map((it: any) => ({
    id: it.id ?? it._id ?? String(it._id ?? it.id ?? Math.random()),
    name: it.name,
    date: it.date,
    description: it.description,
  })) as HolidayItem[];

  setHolidays(normalized ?? []);
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load holidays" });
    } finally {
      setLoading(false);
    }
  };

  // Parse holiday date safely. Accepts ISO or `dd-MM-yyyy` format.
  const parseHolidayDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const asDate = new Date(dateStr);
    if (!isNaN(asDate.getTime())) return asDate;
    const parsed = parse(dateStr, 'dd-MM-yyyy', new Date());
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  };

  useEffect(() => {
    loadHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this holiday?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      await deleteHolidayApi({ id });
      await loadHolidays();
      toast({ title: 'Deleted', description: 'Holiday deleted successfully' });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to delete holiday';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holidays</h1>
          <p className="text-muted-foreground mt-1">Manage company holidays</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Holiday
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Holiday' : 'Add New Holiday'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Holiday Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., New Year's Day"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Holiday Date</Label>
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Holiday Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter holiday description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={adding || Boolean(savingId)}>
                  {editingId ? (
                    savingId ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Update'
                    )
                  ) : (
                    adding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      'Submit'
                    )
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '' });
                    setDate(undefined);
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
                <TableHead>Holiday Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading holidays...
                  </TableCell>
                </TableRow>
              ) : holidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v4a2 2 0 002 2h2l2 2h6" />
                      </svg>
                      <div className="text-sm">No holidays found.</div>
                      <div className="text-xs text-muted-foreground">Click "Add Holiday" to create a new one.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                holidays.map((h) => {
                  const parsedDate = parseHolidayDate(h.date);
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell>{parsedDate ? format(parsedDate, 'PPP') : '-'}</TableCell>
                      <TableCell>{h.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(h)}
                            disabled={deletingId === h.id || savingId === h.id || loading}
                          >
                            {savingId === h.id ? (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(h.id)}
                            disabled={deletingId === h.id}
                          >
                            {deletingId === h.id ? (
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
