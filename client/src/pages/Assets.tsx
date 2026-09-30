import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, QrCode, Printer, UserPlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Asset {
  id: string; asset_id: string; name: string;
  category: { name: string }; department: { name: string };
  condition: string; status: string;
}

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  
  // Assignment Modal State
  const [assignAsset, setAssignAsset] = useState<Asset | null>(null);
  const [assignData, setAssignData] = useState({ staff_id: '', department_id: '', location: '' });

  const [formData, setFormData] = useState({
    asset_id: '', name: '', category_id: '', department_id: '',
    location: '', condition: 'New', status: 'Available'
  });

  const fetchData = () => {
    Promise.all([
      fetch('https://asset-mgt-ewkj.onrender.com/api/assets').then(res => res.json()),
      fetch('https://asset-mgt-ewkj.onrender.com/api/departments').then(res => res.json()),
      fetch('https://asset-mgt-ewkj.onrender.com/api/categories').then(res => res.json()),
      fetch('https://asset-mgt-ewkj.onrender.com/api/staff').then(res => res.json())
    ]).then(([assetsData, deptsData, catsData, staffData]) => {
      setAssets(assetsData);
      setDepartments(deptsData);
      setCategories(catsData);
      setStaffList(staffData);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  // Handle New Asset Creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://asset-mgt-ewkj.onrender.com/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ asset_id: '', name: '', category_id: '', department_id: '', location: '', condition: 'New', status: 'Available' });
        fetchData();
      } else {
        alert("Failed to create asset. Ensure Asset ID is unique!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Asset Assignment
  const handleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAsset) return;
    try {
      const res = await fetch(`https://asset-mgt-ewkj.onrender.com/api/assets/${assignAsset.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignData)
      });
      if (res.ok) {
        setAssignAsset(null);
        setAssignData({ staff_id: '', department_id: '', location: '' });
        fetchData(); // Refresh table to show new In Use status
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assets</h2>
          <p className="text-sm text-gray-500">Manage university assets and equipment</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-ui-blue text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-900 transition-colors shadow-sm font-medium cursor-pointer">
          <Plus className="w-5 h-5 mr-2" /> Add Asset
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <Search className="w-5 h-5 text-gray-400 mr-3" />
        <input type="text" placeholder="Search by asset name or tag number..." className="w-full outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Asset ID</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr> : 
             filteredAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{asset.asset_id}</td>
                <td className="px-6 py-4 text-gray-600">{asset.name}</td>
                <td className="px-6 py-4 text-gray-500">{asset.category?.name}</td>
                <td className="px-6 py-4 text-gray-500">{asset.department?.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.status === 'In Use' ? 'bg-green-100 text-green-700' : asset.status === 'Maintenance' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  {/* Assign Button */}
                  <button onClick={() => setAssignAsset(asset)} className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors" title="Assign Asset">
                    <UserPlus className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => setQrAsset(asset)} className="text-gray-400 hover:text-ui-blue cursor-pointer transition-colors" title="View QR Code">
                    <QrCode className="w-4 h-4 inline" />
                  </button>
                  <button className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"><Edit className="w-4 h-4 inline" /></button>
                  <button className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      {assignAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 border-t-4 border-ui-gold">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center"><UserPlus className="w-5 h-5 mr-2 text-ui-blue"/> Assign Asset</h3>
              <button onClick={() => setAssignAsset(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Assigning <strong>{assignAsset.name}</strong> ({assignAsset.asset_id})</p>
            <form onSubmit={handleAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign to Staff (Optional)</label>
                <select className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  value={assignData.staff_id} onChange={e => setAssignData({...assignData, staff_id: e.target.value})}>
                  <option value="">Select Staff...</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.position})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select required className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  value={assignData.department_id} onChange={e => setAssignData({...assignData, department_id: e.target.value})}>
                  <option value="">Select Department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Physical Location</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Rm 101, Science Block"
                  value={assignData.location} onChange={e => setAssignData({...assignData, location: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-ui-blue text-white py-2 rounded-md hover:bg-blue-900 font-medium cursor-pointer">
                Confirm Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal (Kept unchanged) */}
      {qrAsset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-ui-blue border-b-4 border-ui-gold p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center"><QrCode className="w-5 h-5 mr-2" /> Asset Tag</h3>
              <button onClick={() => setQrAsset(null)} className="hover:text-gray-200 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-sm mb-4">
                <QRCodeSVG value={`https://ui-asset-mgt.vercel.app/assets?search=${qrAsset.asset_id}`} size={160} level="H" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 tracking-wider mb-1">{qrAsset.asset_id}</h4>
              <p className="text-gray-500 font-medium">{qrAsset.name}</p>
              <p className="text-xs text-gray-400 mt-1">{qrAsset.department?.name}</p>
              <button onClick={() => window.print()} className="mt-8 w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 flex items-center justify-center font-medium cursor-pointer">
                <Printer className="w-4 h-4 mr-2" /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal (Kept mostly unchanged, omitted for brevity but it stays in your code!) */}
      {/* Add Asset Modal (Hidden for brevity, keep your existing logic here) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Register New Asset</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Tag ID</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g. UIB-FUR-001"
                  value={formData.asset_id} onChange={e => setFormData({...formData, asset_id: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Office Desk"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select 
                      required 
                      className="mt-1 w-full border border-gray-300 rounded-md p-2.5 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                      value={formData.category_id} 
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      <option value="" disabled>Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select 
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md p-2.5 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                    value={formData.category_id} 
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="" disabled>Select Department...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-ui-blue text-white py-2 rounded-md hover:bg-red-900 font-medium cursor-pointer">
                Save Asset
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Ensure you keep the existing Add Asset Modal at the bottom here exactly as it was! */}
    </div>
  );
}


























      