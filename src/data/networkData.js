
// Initial nodes data
export const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 600, y: 300 },
    data: { 
      label: 'You',
      name: 'You',
      company: 'Your Company',
      role: 'Your Role',
      category: 'user'
    },
    style: { 
      background: '#7B1FA2', 
      color: 'white', 
      border: '3px solid #4A148C',
      borderRadius: '50%',
      width: 80,
      height: 80,
      fontSize: '12px',
      fontWeight: 'bold'
    },
  },
  // Business contacts (yellow/gold)
  {
    id: '2',
    position: { x: 450, y: 150 },
    data: { label: 'Sarah Chen', name: 'Sarah Chen', company: 'TechCorp', role: 'Product Manager', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '3',
    position: { x: 750, y: 150 },
    data: { label: 'Michael Rodriguez', name: 'Michael Rodriguez', company: 'StartupXYZ', role: 'Founder', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '4',
    position: { x: 350, y: 300 },
    data: { label: 'Jennifer Kim', name: 'Jennifer Kim', company: 'Enterprise Inc', role: 'Director', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '5',
    position: { x: 850, y: 300 },
    data: { label: 'David Thompson', name: 'David Thompson', company: 'Consulting Co', role: 'Senior Consultant', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '6',
    position: { x: 500, y: 450 },
    data: { label: 'Lisa Wang', name: 'Lisa Wang', company: 'Innovation Labs', role: 'CTO', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '7',
    position: { x: 700, y: 450 },
    data: { label: 'Robert Chen', name: 'Robert Chen', company: 'Data Systems', role: 'VP Engineering', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  // Category contacts (blue)
  {
    id: '8',
    position: { x: 300, y: 100 },
    data: { label: 'Emma Davis', name: 'Emma Davis', company: 'Design Studio', role: 'Creative Director', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '9',
    position: { x: 900, y: 100 },
    data: { label: 'James Wilson', name: 'James Wilson', company: 'Marketing Plus', role: 'Growth Manager', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '10',
    position: { x: 200, y: 200 },
    data: { label: 'Sophie Martinez', name: 'Sophie Martinez', company: 'Finance Corp', role: 'Analyst', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '11',
    position: { x: 1000, y: 200 },
    data: { label: 'Kevin Brown', name: 'Kevin Brown', company: 'Sales Force', role: 'Account Executive', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '12',
    position: { x: 250, y: 400 },
    data: { label: 'Anna Lee', name: 'Anna Lee', company: 'HR Solutions', role: 'People Manager', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '13',
    position: { x: 950, y: 400 },
    data: { label: 'Tom Garcia', name: 'Tom Garcia', company: 'Operations Inc', role: 'Operations Lead', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '14',
    position: { x: 400, y: 550 },
    data: { label: 'Rachel Green', name: 'Rachel Green', company: 'Media Group', role: 'Content Manager', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '15',
    position: { x: 800, y: 550 },
    data: { label: 'Daniel White', name: 'Daniel White', company: 'Tech Innovations', role: 'Research Lead', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  // Review contacts (orange)
  {
    id: '16',
    position: { x: 150, y: 300 },
    data: { label: 'Mark Johnson', name: 'Mark Johnson', company: 'Consulting Pro', role: 'Senior Advisor', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '17',
    position: { x: 1050, y: 300 },
    data: { label: 'Maria Lopez', name: 'Maria Lopez', company: 'Strategy Group', role: 'Principal', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '18',
    position: { x: 350, y: 50 },
    data: { label: 'Chris Taylor', name: 'Chris Taylor', company: 'Tech Advisors', role: 'Mentor', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '19',
    position: { x: 850, y: 50 },
    data: { label: 'Laura Miller', name: 'Laura Miller', company: 'Industry Leaders', role: 'Executive', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '20',
    position: { x: 300, y: 600 },
    data: { label: 'Steve Anderson', name: 'Steve Anderson', company: 'Business Dev', role: 'Partner', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '21',
    position: { x: 900, y: 600 },
    data: { label: 'Nicole Davis', name: 'Nicole Davis', company: 'Growth Partners', role: 'VP Business', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  // Additional contacts
  {
    id: '22',
    position: { x: 550, y: 50 },
    data: { label: 'Paul Wilson', name: 'Paul Wilson', company: 'StartupHub', role: 'Investor', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '23',
    position: { x: 650, y: 50 },
    data: { label: 'Helen Zhang', name: 'Helen Zhang', company: 'AI Ventures', role: 'Partner', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '24',
    position: { x: 600, y: 600 },
    data: { label: 'Alex Turner', name: 'Alex Turner', company: 'Digital Agency', role: 'Creative Lead', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
];

// Initial edges data
export const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'straight' },
  { id: 'e1-3', source: '1', target: '3', type: 'straight' },
  { id: 'e1-4', source: '1', target: '4', type: 'straight' },
  { id: 'e1-5', source: '1', target: '5', type: 'straight' },
  { id: 'e1-6', source: '1', target: '6', type: 'straight' },
  { id: 'e1-7', source: '1', target: '7', type: 'straight' },
  { id: 'e1-8', source: '1', target: '8', type: 'straight' },
  { id: 'e1-9', source: '1', target: '9', type: 'straight' },
  { id: 'e1-10', source: '1', target: '10', type: 'straight' },
  { id: 'e1-11', source: '1', target: '11', type: 'straight' },
  { id: 'e1-12', source: '1', target: '12', type: 'straight' },
  { id: 'e1-13', source: '1', target: '13', type: 'straight' },
  { id: 'e1-14', source: '1', target: '14', type: 'straight' },
  { id: 'e1-15', source: '1', target: '15', type: 'straight' },
  { id: 'e1-16', source: '1', target: '16', type: 'straight' },
  { id: 'e1-17', source: '1', target: '17', type: 'straight' },
  { id: 'e1-18', source: '1', target: '18', type: 'straight' },
  { id: 'e1-19', source: '1', target: '19', type: 'straight' },
  { id: 'e1-20', source: '1', target: '20', type: 'straight' },
  { id: 'e1-21', source: '1', target: '21', type: 'straight' },
  { id: 'e1-22', source: '1', target: '22', type: 'straight' },
  { id: 'e1-23', source: '1', target: '23', type: 'straight' },
  { id: 'e1-24', source: '1', target: '24', type: 'straight' },
  // Some interconnections
  { id: 'e2-3', source: '2', target: '3', type: 'straight' },
  { id: 'e4-6', source: '4', target: '6', type: 'straight' },
  { id: 'e5-7', source: '5', target: '7', type: 'straight' },
];
