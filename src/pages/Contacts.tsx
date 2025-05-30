
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Plus, Users, Building, Calendar, MessageSquare, Edit, Network } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const contacts = [
    {
      id: 1,
      name: 'Sarah Chen',
      company: 'TechCorp',
      role: 'Product Manager',
      category: 'colleague',
      lastContact: '2 weeks ago',
      notes: 'Met at product conference. Interested in AI applications.',
      tags: ['AI', 'Product', 'Conference'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      company: 'StartupXYZ',
      role: 'Founder',
      category: 'entrepreneur',
      lastContact: '1 month ago',
      notes: 'Building B2B SaaS platform. Looking for advisors.',
      tags: ['Startup', 'B2B', 'SaaS'],
      status: 'warm'
    },
    {
      id: 3,
      name: 'Jennifer Kim',
      company: 'Enterprise Inc',
      role: 'Director',
      category: 'executive',
      lastContact: '3 months ago',
      notes: 'Former client. Potential future collaboration opportunities.',
      tags: ['Client', 'Enterprise', 'Partnership'],
      status: 'dormant'
    },
    {
      id: 4,
      name: 'David Thompson',
      company: 'Consulting Co',
      role: 'Senior Consultant',
      category: 'consultant',
      lastContact: '6 months ago',
      notes: 'LinkedIn connection. Expertise in digital transformation.',
      tags: ['LinkedIn', 'Digital Transformation', 'Consulting'],
      status: 'cold'
    },
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'dormant': return 'bg-orange-100 text-orange-800';
      case 'cold': return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <p className="text-sm text-gray-500">Manage your professional network</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#0077B5] hover:bg-[#005885] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Full name" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Company name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" placeholder="Job title" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="How did you meet? What did you discuss?" />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="Separate tags with commas" />
                </div>
                <Button className="w-full bg-[#0077B5] hover:bg-[#005885]">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="colleague">Colleagues</SelectItem>
              <SelectItem value="entrepreneur">Entrepreneurs</SelectItem>
              <SelectItem value="executive">Executives</SelectItem>
              <SelectItem value="consultant">Consultants</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-sm text-gray-600">{contact.role}</p>
                    <p className="text-sm text-gray-500">{contact.company}</p>
                  </div>
                  <Badge className={getStatusColor(contact.status)}>
                    {contact.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Last contact: {contact.lastContact}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-700 mb-2">{contact.notes}</p>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-[#0077B5] hover:bg-[#005885]">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Network className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#0077B5] hover:bg-[#005885] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                {/* Same dialog content as above */}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
