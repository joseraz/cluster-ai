
import { useState } from "react"
import { Network, Users, MessageSquare, BarChart3, Settings, Menu } from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: BarChart3 },
  { title: "Network View", url: "/app/network", icon: Network },
  { title: "Contacts", url: "/app/contacts", icon: Users },
  { title: "Outreach", url: "/app/outreach", icon: MessageSquare },
]

export function AppSidebar() {
  const { collapsed } = useSidebar()

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <div className="p-4 border-b bg-[#0077B5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Network className="w-4 h-4 text-[#0077B5]" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-white font-semibold text-lg">Cluster AI</h2>
              <p className="text-blue-100 text-xs">Network Intelligence</p>
            </div>
          )}
        </div>
      </div>

      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          isActive 
                            ? "bg-[#0077B5] text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
