import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

export default function LeaveGroups() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    groupName: "",
    leaveType: "",
    allocationType: "",
    paidLeaves: "",
    leaveFormula: "",
    maxUseInMonth: "",
    oneDayLeave: "",
    yearEndPolicy: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Leave group added successfully",
    });
    setFormData({
      groupName: "",
      leaveType: "",
      allocationType: "",
      paidLeaves: "",
      leaveFormula: "",
      maxUseInMonth: "",
      oneDayLeave: "",
      yearEndPolicy: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Groups</h1>
          <p className="text-muted-foreground mt-1">Configure leave group settings</p>
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
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaveType">Select Leave Type</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="privilege">Privilege Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allocationType">Leave Allocation Type</Label>
                  <Select
                    value={formData.allocationType}
                    onValueChange={(value) => setFormData({ ...formData, allocationType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidLeaves">No. of Paid Leave</Label>
                  <Input
                    id="paidLeaves"
                    type="number"
                    placeholder="Enter number"
                    value={formData.paidLeaves}
                    onChange={(e) => setFormData({ ...formData, paidLeaves: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaveFormula">Leave Applied Formula</Label>
                  <Select
                    value={formData.leaveFormula}
                    onValueChange={(value) => setFormData({ ...formData, leaveFormula: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select formula" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="halfday">Half Day</SelectItem>
                      <SelectItem value="fullday">Full Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUseInMonth">Maximum Use in Month</Label>
                  <Input
                    id="maxUseInMonth"
                    type="number"
                    placeholder="Enter number"
                    value={formData.maxUseInMonth}
                    onChange={(e) => setFormData({ ...formData, maxUseInMonth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oneDayLeave">One Day Leave Applied</Label>
                  <Input
                    id="oneDayLeave"
                    type="number"
                    placeholder="Enter number"
                    value={formData.oneDayLeave}
                    onChange={(e) => setFormData({ ...formData, oneDayLeave: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearEndPolicy">Year End Leave Balance Policy</Label>
                  <Select
                    value={formData.yearEndPolicy}
                    onValueChange={(value) => setFormData({ ...formData, yearEndPolicy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payout-manual">Payout or Carry Forward (Manually)</SelectItem>
                      <SelectItem value="payout-auto">Payout or Carry Forward (Automatically)</SelectItem>
                      <SelectItem value="reset">Reset to Zero</SelectItem>
                    </SelectContent>
                  </Select>
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
                <TableHead>Group Name</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Allocation</TableHead>
                <TableHead>Paid Leaves</TableHead>
                <TableHead>Year End Policy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Standard Group</TableCell>
                <TableCell>Casual Leave</TableCell>
                <TableCell>Yearly</TableCell>
                <TableCell>12</TableCell>
                <TableCell>Carry Forward (Auto)</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
