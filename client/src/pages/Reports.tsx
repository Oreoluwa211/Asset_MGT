import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';

export default function Reports() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('[https://asset-mgt-ewkj.onrender.com/api](https://asset-mgt-ewkj.onrender.com/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
      });
  }, []);

  const downloadCSV = () => {
    // 1. Create CSV Headers
    const headers = ['Asset ID', 'Name', 'Category', 'Department', 'Location', 'Condition', 'Status'];
    
    // 2. Map data to rows
    const rows = assets.map(a => [
      a.asset_id,
      a.name,
      a.category?.name || 'N/A',
      a.department?.name || 'N/A',
      a.location,
      a.condition,
      a.status
    ]);

    // 3. Combine into a CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // 4. Trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UI_Asset_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <p className="text-sm text-gray-500">Export university asset data</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Master Asset Inventory</h3>
            <p className="text-sm text-gray-500">Complete list of all registered university assets.</p>
          </div>
        </div>
        <button 
          onClick={downloadCSV}
          disabled={loading}
          className="bg-ui-blue text-white px-4 py-2 rounded-md flex items-center hover:bg-red-900 transition-colors shadow-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-5 h-5 mr-2" />
          {loading ? 'Loading Data...' : 'Export CSV'}
        </button>
      </div>
    </div>
  );
}