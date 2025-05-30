
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageSquare, Clock, Send, CheckCircle, Users, TrendingUp, Calendar, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Outreach = () => {
  const [activeTab, setActiveTab] = useState('suggestions');

  const suggestions = [
    {
      id: 1,
      name: 'Alex Morgan',
      company: 'TechCorp',
      role: 'Product Manager',
      lastContact: '6 months ago',
      reason: 'Long overdue catch-up',
      priority: 'high',
      suggestedMessage: "Hi Alex! Hope you're doing well. It's been a while since we last caught up. I'd love to hear about what you're working on at TechCorp..."
    },
    {
      id: 2,
      name: 'Lisa Wang',
      company: 'StartupXYZ',
      role: 'Founder',
      lastContact: '4 months ago',
      reason: 'Potential collaboration opportunity',
      priority: 'medium',
      suggestedMessage: "Hi Lisa! I've been following StartupXYZ's progress and I'm impressed with your recent funding announcement..."
    },
    {
      id: 3,
      name: 'Robert Taylor',
      company: 'Enterprise Inc',
      role: 'Director',
      lastContact: '8 months ago',
      reason: 'Industry insights exchange',
      priority: 'medium',
      suggestedMessage: "Hi Robert! I hope this message finds you well. I've been thinking about our conversation on digital transformation trends..."
    },
  ];

  const activeOutreach = [
    {
      id: 1,
      name: 'Sarah Chen',
      company: 'TechCorp',
      status: 'pending',
      sentDate: '2 days ago',
      nextAction: 'Follow up in 3 days',
      sequence: 'Day 1',
      responseRate: '65%'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      company: 'StartupXYZ',
      status: 'responded',
      sentDate: '1 week ago',
      nextAction: 'Schedule call',
      sequence: 'Day 3',
      responseRate: '45%'
    },
  ];

  const templates = [
    {
      id: 1,
      name: 'Reconnection',
      subject: 'Great to reconnect!',
      category: 'warm-up',
      usage: 23,
      responseRate: '42%'
    },
    {
      id: 2,
      name: 'Industry Update',
      subject: 'Thought you\'d find this interesting',
      category: 'value-add',
      usage: 18,
      responseRate: '38%'
    },
    {
      id: 3,
      name: 'Quick Catch-up',
      subject: 'Coffee soon?',
      category: 'meeting',
      usage: 15,
      responseRate: '55%'
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'no-response': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Outreach</h1>
              <p className="text-sm text-gray-500">Reactivate your network strategically</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#0077B5] hover:bg-[#005885] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Outreach Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contacts">Select Contacts</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose contacts for outreach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dormant">Dormant connections (6+ months)</SelectItem>
                      <SelectItem value="warm">Warm connections (3-6 months)</SelectItem>
                      <SelectItem value="custom">Custom selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template">Message Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reconnection">Reconnection</SelectItem>
                      <SelectItem value="industry">Industry Update</SelectItem>
                      <SelectItem value="catchup">Quick Catch-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Personalize your message..." 
                    rows={6}
                  />
                </div>
                <Button className="w-full bg-[#0077B5] hover:bg-[#005885]">
                  Launch Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
            <TabsTrigger value="active">Active Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                        <p className="text-sm text-gray-600">{suggestion.role}</p>
                        <p className="text-sm text-gray-500">{suggestion.company}</p>
                      </div>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Last contact: {suggestion.lastContact}</span>
                      </div>
                      <p className="text-sm text-[#0077B5] font-medium">{suggestion.reason}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Suggested message:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {suggestion.suggestedMessage}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-[#0077B5] hover:bg-[#005885]">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button size="sm" variant="outline">
                        Customize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="space-y-4">
              {activeOutreach.map((campaign) => (
                <Card key={campaign.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.company}</p>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">Sent:</span> {campaign.sentDate}
                        </div>
                        <div>
                          <span className="text-gray-500">Sequence:</span> {campaign.sequence}
                        </div>
                        <div>
                          <span className="text-gray-500">Response Rate:</span> {campaign.responseRate}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-[#0077B5] hover:bg-[#005885]">
                            {campaign.nextAction}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600">{template.subject}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Usage:</span>
                      <span className="font-medium">{template.usage} times</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Response Rate:</span>
                      <span className="font-medium text-green-600">{template.responseRate}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-[#0077B5] hover:bg-[#005885]">
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                      <p className="text-3xl font-bold text-gray-900">127</p>
                      <p className="text-xs text-green-600 mt-1">+12% this month</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-[#0077B5]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Rate</p>
                      <p className="text-3xl font-bold text-gray-900">43%</p>
                      <p className="text-xs text-green-600 mt-1">+5% vs last month</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Meetings Scheduled</p>
                      <p className="text-3xl font-bold text-gray-900">18</p>
                      <p className="text-xs text-green-600 mt-1">+3 this week</p>
                    </div>
                    <Calendar className="w-8 h-8 text-[#0077B5]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New Connections</p>
                      <p className="text-3xl font-bold text-gray-900">24</p>
                      <p className="text-xs text-green-600 mt-1">+8 this month</p>
                    </div>
                    <Users className="w-8 h-8 text-[#0077B5]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Outreach;
