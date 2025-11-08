import { useState } from "react";
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

export default function AssignHolidayGroups() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    holidayGroup: "",
    branch: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Holiday group assigned to branch successfully",
    });
    setFormData({ holidayGroup: "", branch: "" });
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
                    <SelectItem value="national">National Holidays</SelectItem>
                    <SelectItem value="regional">Regional Holidays</SelectItem>
                    <SelectItem value="festival">Festival Holidays</SelectItem>
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
                    <SelectItem value="hq">Head Office</SelectItem>
                    <SelectItem value="branch1">Branch 1</SelectItem>
                    <SelectItem value="branch2">Branch 2</SelectItem>
                    <SelectItem value="branch3">Branch 3</SelectItem>
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
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Head Office</p>
                <p className="text-sm text-muted-foreground">National Holidays</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                Assigned
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Branch 1</p>
                <p className="text-sm text-muted-foreground">Regional Holidays</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                Assigned
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Branch 2</p>
                <p className="text-sm text-muted-foreground">National Holidays</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                Assigned
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
