import { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, Clock, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

interface MaintenanceRecord {
  id: string;
  asset_id: string;
  asset?: { name: string; asset_id: string };
  problem: string;
  technician: string;
  cost: number;
  status: string;
  created_at: string;
}

export default function Maintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All' | 'In Progress' | 'Resolved'>('All');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '', problem: '', technician: '', cost: ''
  });

  const fetchData = () => {
    const query = user?.role === 'Staff' && user.email ? `?email=${encodeURIComponent(user.email)}` : '';
    
    const headers = { 'Authorization': `Bearer ${(user as any)?.token}` };
    
    Promise.all([
      fetch(`https://asset-mgt-ewkj.onrender.com/api/maintenance${query}`, { headers }).then(res => res.json()),
      fetch(`https://asset-mgt-ewkj.onrender.com/api/assets${query}`, { headers }).then(res => res.json())
    ])
    .then(([maintenanceData, assetsData]) => {
      setRecords(Array.isArray(maintenanceData) ? maintenanceData : []);
      // Only show assets that are NOT already in maintenance for the dropdown
      setAssets(Array.isArray(assetsData) ? assetsData.filter(a => a.status !== 'Maintenance') : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://asset-mgt-ewkj.onrender.com/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(user as any)?.token}` },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ asset_id: '', problem: '', technician: '', cost: '' }); // Clear form
        fetchData(); // Refresh table
      } else {
        alert("Failed to report issue. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`https://asset-mgt-ewkj.onrender.com/api/maintenance/${id}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${(user as any)?.token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to resolve maintenance issue');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'All') return true;
    return r.status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Maintenance & Repairs</h2>
          <p className="text-sm text-gray-500">Track asset issues, servicing, and repair costs</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filter Badges */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-sm font-medium">
            {(['All', 'In Progress', 'Resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filter === tab ? 'bg-ui-blue text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-ui-blue text-white px-4 py-2 rounded-xl flex items-center justify-center hover:bg-blue-900 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" /> Report Issue
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[850px]">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Date Reported</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Problem</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Cost (NGN)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 font-medium">Loading records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 font-medium">No maintenance records found.</td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(r.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {r.asset?.name || 'Asset'} <span className="text-gray-400 font-mono text-xs">({r.asset?.asset_id || r.asset_id})</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{r.problem}</td>
                    <td className="px-6 py-4 text-gray-600">{r.technician || 'Pending Assignment'}</td>
                    <td className="px-6 py-4 font-mono text-gray-800">
                      {r.cost ? `₦${Number(r.cost).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          r.status?.toLowerCase() === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {r.status?.toLowerCase() === 'resolved' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {r.status || 'In Progress'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status?.toLowerCase() !== 'resolved' ? (
                        <button
                          onClick={() => handleResolve(r.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic px-3">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-t-4 border-ui-gold transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-ui-blue"/> Report Asset Issue
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ asset_id: '', problem: '', technician: '', cost: '' });
                }} 
                className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Asset</label>
                <select 
                  required 
                  className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue bg-white"
                  value={formData.asset_id} 
                  onChange={e => setFormData({...formData, asset_id: e.target.value})}
                >
                  <option value="" disabled>Choose an asset requiring repair...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.asset_id})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Describe the Problem</label>
                <textarea 
                  required 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue resize-none" 
                  rows={3} 
                  placeholder="e.g. Screen flickering, fan making loud noise..."
                  value={formData.problem} 
                  onChange={e => setFormData({...formData, problem: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Technician (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue" 
                    placeholder="e.g. ICT Unit"
                    value={formData.technician} 
                    onChange={e => setFormData({...formData, technician: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Cost (₦)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue" 
                    placeholder="15000"
                    value={formData.cost} 
                    onChange={e => setFormData({...formData, cost: e.target.value})} 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-ui-blue to-blue-900 text-white py-3 rounded-xl hover:from-blue-900 hover:to-blue-950 font-bold shadow-md mt-2"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}