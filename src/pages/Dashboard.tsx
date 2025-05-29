
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, MessageSquare, TrendingUp, Clock, Plus, Network, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const stats = [
    { title: "Total Contacts", value: "127", icon: Users, change: "+12 this month" },
    { title: "Active Conversations", value: "8", icon: MessageSquare, change: "+3 this week" },
    { title: "Network Growth", value: "15%", icon: TrendingUp, change: "vs last quarter" },
    { title: "Pending Follow-ups", value: "5", icon: Clock, change: "Due this week" },
  ];

  const recentActivity = [
    { type: "contact", name: "Sarah Chen", action: "Added new contact", time: "2 hours ago" },
    { type: "message", name: "Michael Rodriguez", action: "Sent follow-up message", time: "1 day ago" },
    { type: "note", name: "Jennifer Kim", action: "Updated relationship notes", time: "2 days ago" },
    { type: "connection", name: "David Thompson", action: "Discovered mutual connection", time: "3 days ago" },
  ];

  const dormantConnections = [
    { name: "Alex Morgan", lastContact: "6 months ago", company: "TechCorp", role: "Product Manager" },
    { name: "Lisa Wang", lastContact: "4 months ago", company: "StartupXYZ", role: "Founder" },
    { name: "Robert Taylor", lastContact: "8 months ago", company: "Enterprise Inc", role: "Director" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back! Here's your network overview.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/app/network">
              <Button className="bg-[#0077B5] hover:bg-[#005885] text-white">
                <Eye className="w-4 h-4 mr-2" />
                View Network
              </Button>
            </Link>
            <Link to="/app/contacts">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#0077B5] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-[#0077B5]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0077B5]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-[#0077B5] bg-opacity-10 rounded-full flex items-center justify-center">
                      {activity.type === 'contact' && <Users className="w-4 h-4 text-[#0077B5]" />}
                      {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-[#0077B5]" />}
                      {activity.type === 'note' && <Network className="w-4 h-4 text-[#0077B5]" />}
                      {activity.type === 'connection' && <Users className="w-4 h-4 text-[#0077B5]" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.name}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dormant Connections */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Dormant Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dormantConnections.map((contact, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-100 hover:border-[#0077B5] transition-colors cursor-pointer">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.role}</p>
                    <p className="text-sm text-gray-500">{contact.company}</p>
                    <p className="text-xs text-orange-600 mt-1">Last contact: {contact.lastContact}</p>
                  </div>
                ))}
                <Link to="/app/outreach">
                  <Button variant="outline" className="w-full mt-4">
                    View All Suggestions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
