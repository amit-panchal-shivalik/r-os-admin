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
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BulkLeaveAssignment() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    branch: "",
    department: "",
    year: "",
    leaveGroup: "",
    employee: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Leave assigned successfully",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File Uploaded",
        description: `Processing ${file.name}...`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Leave Assignment</h1>
        <p className="text-muted-foreground mt-1">Assign leaves to multiple employees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manual Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <SelectItem value="hq">Head Office</SelectItem>
                    <SelectItem value="branch1">Branch 1</SelectItem>
                    <SelectItem value="branch2">Branch 2</SelectItem>
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
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
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
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
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
                    <SelectItem value="standard">Standard Group</SelectItem>
                    <SelectItem value="senior">Senior Group</SelectItem>
                    <SelectItem value="junior">Junior Group</SelectItem>
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

              <Button type="submit" className="w-full">
                Assign Leave
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload Excel or CSV file with employee leave data
              </p>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">File Format Requirements:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Accepted formats: Excel (.xlsx, .xls) or CSV (.csv)</li>
                <li>Required columns: Employee ID, Leave Type, Number of Days</li>
                <li>Optional columns: Branch, Department, Year</li>
              </ul>
            </div>

            <Button variant="outline" className="w-full">
              Download Sample Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
