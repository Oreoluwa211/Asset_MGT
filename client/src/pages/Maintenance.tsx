import { useState, useEffect } from 'react';
import { Wrench, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

export default function Maintenance() {
  const [records, setRecords] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '', problem: '', technician: '', cost: ''
  });

  const { user } = useAuth();

  const fetchData = () => {
    const query = user?.role === 'Staff' && user.email ? `?email=${encodeURIComponent(user.email)}` : '';
    Promise.all([
      fetch(`/api/maintenance${query}`).then((res) => res.json()),
      fetch(`/api/assets${query}`).then((res) => res.json())
    ]).then(([maintenanceData, assetsData]) => {
      setRecords(maintenanceData);
      setAssets(assetsData);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('[https://asset-mgt-ewkj.onrender.com/api](https://asset-mgt-ewkj.onrender.com/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ asset_id: '', problem: '', technician: '', cost: '' });
        fetchData(); // Refresh the table
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Maintenance & Repairs</h2>
          <p className="text-sm text-gray-500">Track asset issues and repair costs</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-ui-blue text-white px-4 py-2 rounded-md flex items-center hover:bg-red-900 transition-colors shadow-sm font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" /> Report Issue
        </button>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Date Reported</th>
              <th className="px-6 py-4 font-medium">Asset</th>
              <th className="px-6 py-4 font-medium">Problem</th>
              <th className="px-6 py-4 font-medium">Technician</th>
              <th className="px-6 py-4 font-medium">Cost (NGN)</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr> : 
             records.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-500">No maintenance records found.</td></tr> :
             records.map(record => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-600">{new Date(record.reported_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{record.asset?.name} ({record.asset?.asset_id})</td>
                <td className="px-6 py-4 text-gray-500">{record.problem}</td>
                <td className="px-6 py-4 text-gray-500">{record.technician || 'Unassigned'}</td>
                <td className="px-6 py-4 text-gray-500">{record.cost ? `₦${record.cost.toLocaleString()}` : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center"><Wrench className="w-5 h-5 mr-2 text-ui-blue"/> Report Asset Issue</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Asset</label>
                <select required className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  value={formData.asset_id} onChange={e => setFormData({...formData, asset_id: e.target.value})}>
                  <option value="">Choose an asset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.asset_id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Describe the Problem</label>
                <textarea required className="mt-1 w-full border border-gray-300 rounded-md p-2" rows={3} placeholder="e.g. Screen is flickering"
                  value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Technician (Optional)</label>
                  <input type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g. ICT Unit"
                    value={formData.technician} onChange={e => setFormData({...formData, technician: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Cost (₦)</label>
                  <input type="number" className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="15000"
                    value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-ui-blue text-white py-2 rounded-md hover:bg-red-900 font-medium cursor-pointer">
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}