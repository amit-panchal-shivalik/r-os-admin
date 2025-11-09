import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, CheckCircle, LogOut } from "lucide-react";

export default function Dashboard() {
  const handleLogout = () => {
    // clear all local storage and redirect to login/root
    try {
      localStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = "/";
  };

  const stats = [
    {
      title: "Total Employees",
      value: "248",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Requests",
      value: "12",
      icon: FileText,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Upcoming Holidays",
      value: "5",
      icon: Calendar,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Approved Today",
      value: "8",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your leave management system
          </p>
        </div>
        <div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">John Doe</p>
                    <p className="text-sm text-muted-foreground">Casual Leave - 2 days</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "New Year's Day", date: "Jan 1, 2024" },
                { name: "Republic Day", date: "Jan 26, 2024" },
                { name: "Holi", date: "Mar 25, 2024" },
              ].map((holiday) => (
                <div key={holiday.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{holiday.name}</p>
                    <p className="text-sm text-muted-foreground">{holiday.date}</p>
                  </div>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
