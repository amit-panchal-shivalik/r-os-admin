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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getHolidaysApi, HolidayItem, addHolidayApi, AddHolidayPayload } from "@/apis/holiday";

export default function HolidayList() {
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast({ title: "Validation", description: "Please enter holiday name" });
      return;
    }
    if (!date) {
      toast({ title: "Validation", description: "Please pick a date" });
      return;
    }

    const payload: AddHolidayPayload = {
      name: formData.name.trim(),
      date: format(date, 'dd-MM-yyyy'),
      description: formData.description?.trim() || '',
    };

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
      toast({ title: "Error", description: error?.message || 'Failed to add holiday' });
    } finally {
      setAdding(false);
    }
  };

  const loadHolidays = async () => {
    setLoading(true);
    try {
  const res = await getHolidaysApi();
  console.log('[DEBUG] Holiday Response ', res );
  setHolidays(res.result ?? []);
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load holidays" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <CardTitle>Add New Holiday</CardTitle>
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
                <Button type="submit" disabled={adding}>
                  {adding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
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
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No holidays found.
                  </TableCell>
                </TableRow>
              ) : (
                holidays.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.name}</TableCell>
                    <TableCell>{h.date ? format(new Date(h.date), 'PPP') : '-'}</TableCell>
                    <TableCell>{h.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
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
