
import { Badge } from "@/components/ui/badge";

export function NetworkSidebar({ nodes }) {
  const categories = [
    { name: 'All', count: nodes.length, color: '#0077B5', icon: '📊' },
    { name: 'Business', count: nodes.filter(n => n.data.category === 'business').length, color: '#FFB300', icon: '🏢' },
    { name: 'Category', count: nodes.filter(n => n.data.category === 'category').length, color: '#1976D2', icon: '📋' },
    { name: 'Review', count: nodes.filter(n => n.data.category === 'review').length, color: '#F57C00', icon: '📝' },
    { name: 'User', count: 1, color: '#7B1FA2', icon: '👤' },
  ];

  return (
    <div className="absolute top-4 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Nodes</h3>
        <div className="text-sm text-gray-500">Relationships</div>
      </div>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Filter categories</span>
          <div className="flex gap-1">
            <label className="flex items-center gap-1">
              <input type="radio" name="filter" defaultChecked className="w-3 h-3" />
              <span className="text-xs">All</span>
            </label>
            <label className="flex items-center gap-1 ml-2">
              <input type="radio" name="filter" className="w-3 h-3" />
              <span className="text-xs">In Scene</span>
            </label>
            <label className="flex items-center gap-1 ml-2">
              <input type="radio" name="filter" className="w-3 h-3" />
              <span className="text-xs">Off Scene</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
