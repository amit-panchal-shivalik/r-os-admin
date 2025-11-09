import { useState } from "react";
import { Users, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserRole = "admin" | "manager" | "member";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: UserRole[];
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: userRoles
          .filter((ur) => ur.user_id === profile.id)
          .map((ur) => ur.role as UserRole),
      }));

      return usersWithRoles;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", role)
        .maybeSingle();

      if (existing) {
        throw new Error("User already has this role");
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Role assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign role");
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Role removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove role");
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            User Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <span className="text-sm md:text-base font-medium">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 md:pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Total Users
              </p>
              <p className="text-lg md:text-2xl font-bold">{users?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Managers</p>
              <p className="text-lg md:text-2xl font-bold">
                {users?.filter((u) => u.roles.includes("manager")).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Admins</p>
              <p className="text-lg md:text-2xl font-bold">
                {users?.filter((u) => u.roles.includes("admin")).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table - Desktop */}
      <Card className="hidden md:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Roles</TableHead>
              <TableHead>Assign Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || "No Name"}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === "admin" ? "default" : "secondary"}
                        >
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">No roles</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) =>
                      assignRoleMutation.mutate({
                        userId: user.id,
                        role: value as UserRole,
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Add role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.roles.map((role) => (
                      <Button
                        key={role}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeRoleMutation.mutate({ userId: user.id, role })
                        }
                      >
                        Remove {role}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Users List - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredUsers?.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shrink-0">
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.full_name || "No Name"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium mb-2">Current Roles:</p>
                <div className="flex gap-2 flex-wrap">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={role === "admin" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      No roles
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2">Assign Role:</p>
                <Select
                  onValueChange={(value) =>
                    assignRoleMutation.mutate({
                      userId: user.id,
                      role: value as UserRole,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role to add" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user.roles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        removeRoleMutation.mutate({ userId: user.id, role })
                      }
                      className="text-xs"
                    >
                      Remove {role}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
