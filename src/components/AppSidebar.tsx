import { Users, Network, Settings, Sun, Moon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useContacts } from '@/contexts/ContactsContext';
import { useTheme } from '@/contexts/ThemeContext';

export function AppSidebar() {
  const { contacts, clusters } = useContacts();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar className="w-[185px] border-r border-border" collapsible="none">
      {/* Logo */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Network className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-foreground">Cluster AI</span>
        </div>
      </SidebarHeader>

      <div className="mx-4 h-px bg-border" />

      <SidebarContent className="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/app/contacts"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  Contacts
                </span>
                <span className={`text-xs font-semibold`}>
                  {contacts.length}
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/app/network"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Network className="w-4 h-4" />
                  Clusters
                </span>
                <span className="text-xs font-semibold">
                  {clusters.length}
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <div className="mx-4 h-px bg-border" />

      <SidebarFooter className="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/app/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                Settings
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
