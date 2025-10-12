import { Settings, Brain, History, User, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Chat conversations data
const conversations = [
  {
    title: "Research on quantum computing",
    timestamp: "2 hours ago",
    id: "1",
  },
  {
    title: "Machine learning algorithms",
    timestamp: "1 day ago",
    id: "2",
  },
  {
    title: "Climate change analysis",
    timestamp: "3 days ago",
    id: "3",
  },
];

// Menu items for actions
const actions = [
  {
    title: "New Chat",
    url: "#",
    icon: Plus,
  },
  {
    title: "History",
    url: "#",
    icon: History,
  },
];

// Settings items
const settings = [
  {
    title: "AI Model",
    url: "#",
    icon: Brain,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {/* New Chat / Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Conversations */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton asChild>
                    <a
                      href={conversation.id}
                      className="flex flex-col items-start gap-1"
                    >
                      <span className="text-sm font-medium truncate w-full">
                        {conversation.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conversation.timestamp}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="space-y-2">
          <ThemeToggle />
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent">
            <User className="h-4 w-4" />
            <span>Log in</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
