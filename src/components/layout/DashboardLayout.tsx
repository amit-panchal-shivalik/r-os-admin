import { Outlet, useNavigate } from "react-router-dom";
import {
  AppShell,
  Text,
  Group,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  Burger,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconMenu2 } from "@tabler/icons-react";
import { User, Menu as MenuIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { AdminSidebar } from "./AdminSidebar";
import { useState, useEffect } from "react";

export const DashboardLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutModal, setLogoutModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (!sidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar collapsed={sidebarCollapsed} />

      <div className={`main-content flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-0' : 'pl-64'}`}>
        <AppShell
          header={{ height: { base: 60, sm: 70 } }}
          padding={{ base: "sm", sm: "md", lg: "lg" }}
          styles={(theme) => ({
            main: {
              backgroundColor: "#f9fafb",
              minHeight: "calc(100vh - 70px)",
              flex: 1,
            },
          })}
        >
          <AppShell.Header
            style={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <Group
              h="100%"
              justify="space-between"
              className="px-6"
            >
              <Group>
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                  color="#6c757d"
                />
                {/* Sidebar Toggle Button */}
                <UnstyledButton
                  onClick={handleSidebarToggle}
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MenuIcon className="h-5 w-5 text-gray-600" />
                </UnstyledButton>
                {/* R-OS Logo */}
                <div className="flex items-center">
                  <img
                    src="/logo.jpg"
                    alt="R-OS Logo"
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      // Fallback to text logo if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'flex items-center gap-2';
                      fallbackDiv.innerHTML = `
                        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <span class="text-primary-foreground font-bold text-sm">R</span>
                        </div>
                        <span class="text-lg font-bold text-gray-900">R-OS</span>
                      `;
                      target.parentElement?.appendChild(fallbackDiv);
                    }}
                  />
                </div>
              </Group>

              <Group gap="md">
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <UnstyledButton>
                      <Group gap="sm">
                        <Avatar
                          size={36}
                          radius="xl"
                          style={{ backgroundColor: "#e5e7eb" }}
                        >
                          {admin?.fullName?.charAt(0).toUpperCase() || "A"}
                        </Avatar>
                        <Box visibleFrom="sm">
                          <Text size="sm" fw={500} c="#111827">
                            {admin?.fullName || "Admin"}
                          </Text>
                          {admin?.roleDetails?.name && (
                            <Text size="xs" c="#6b7280">
                              {admin.roleDetails.name}
                            </Text>
                          )}
                        </Box>
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<User size={14} />}
                      onClick={() => navigate("/user-profile")}
                    >
                      My Profile
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconLogout size={14} />}
                      color="red"
                      onClick={() => setLogoutModal(true)}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </AppShell.Header>

          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>

        <Modal
          opened={logoutModal}
          onClose={() => setLogoutModal(false)}
          title={
            <h2 className="text-lg font-semibold text-gray-800">
              Confirm Logout
            </h2>
          }
          centered
        >
          <div className="space-y-6">
            <p className="text-gray-700 text-sm">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                onClick={() => setLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded hover:bg-red-700 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
