import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, QrCode, Printer, UserPlus, Scan, FileSpreadsheet, Eye, ChevronDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAuth } from '../hooks/AuthContext';

interface Asset {
  id: string; asset_id: string; name: string;
  category: { name: string }; department: { name: string };
  condition: string; status: string;
}

// Premium Custom Dropdown Component
const CustomSelect = ({ value, onChange, options, placeholder, disabled = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt: any) => opt.id === value);

  return (
    <div className="relative w-full">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border border-gray-300 rounded-xl p-2.5 flex justify-between items-center transition-all shadow-sm ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white cursor-pointer hover:border-ui-blue focus:ring-2 focus:ring-ui-blue/20'
        }`}
      >
        <span className={selectedOption ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-ui-blue' : ''}`} />
      </div>
      
      {isOpen && (
        <>
          {/* Invisible overlay to detect clicks outside the dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          {/* Dropdown Menu */}
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-2 custom-scrollbar transform origin-top animate-in fade-in slide-in-from-top-2">
            {options.map((opt: any) => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 cursor-pointer transition-colors flex items-center ${
                  value === opt.id 
                    ? 'bg-blue-50 text-ui-blue font-bold border-l-4 border-ui-blue' 
                    : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                {opt.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  const [assetHistory, setAssetHistory] = useState<any[]>([]);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Assignment Modal State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assignAsset, setAssignAsset] = useState<Asset | null>(null);
  const [assignData, setAssignData] = useState({ staff_id: '', department_id: '', location: '' });

  const [viewAsset, setViewAsset] = useState<any>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    asset_id: '', name: '', category_id: '', department_id: '',
    location: '', condition: 'New', status: 'Available'
  });

  const fetchData = () => {
    Promise.all([
      fetch('https://asset-mgt-ewkj.onrender.com/api/assets', {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}}).then(res => res.json()),
      fetch('https://asset-mgt-ewkj.onrender.com/api/departments', {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}}).then(res => res.json()),
      fetch('https://asset-mgt-ewkj.onrender.com/api/categories', {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}}).then(res => res.json()),
      fetch('https://asset-mgt-ewkj.onrender.com/api/staff', {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}}).then(res => res.json())
    ]).then(([assetsData, deptsData, catsData, staffData]) => {
      setAssets(assetsData);
      setDepartments(deptsData);
      setCategories(catsData);
      setStaffList(staffData);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const exportToCSV = () => {
    // 1. Define the headers
    const headers = ['Asset ID', 'Name', 'Category', 'Department', 'Status', 'Location'];
    
    // 2. Map the data into comma-separated rows
    const csvData = assets.map(a => [
      a.asset_id,
      `"${a.name}"`, // Wrapped in quotes in case names have commas
      `"${a.category?.name || ''}"`,
      `"${a.department?.name || ''}"`,
      a.status,
      `"${(a as Asset & { location?: string }).location || ''}"`
    ].join(','));
    
    // 3. Combine headers and data
    const csvString = [headers.join(','), ...csvData].join('\n');
    
    // 4. Trigger the download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UI_Assets_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

// Handle New Asset Creation & Updating
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `https://asset-mgt-ewkj.onrender.com/api/assets/${editingId}` 
        : 'https://asset-mgt-ewkj.onrender.com/api/assets';
        
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ asset_id: '', name: '', category_id: '', department_id: '', location: '', condition: 'New', status: 'Available' });
        fetchData();
      } else {
        alert(editingId ? "Failed to update asset." : "Failed to create asset. Ensure Asset ID is unique!");
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

// Handle Asset Deletion
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const res = await fetch(`https://asset-mgt-ewkj.onrender.com/api/assets/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        fetchData(); // Refresh the table automatically
        setDeleteId(null); // Close the modal
      } else {
        alert("Failed to delete asset. It might be assigned to a maintenance record.");
        setDeleteId(null);
      }
    } catch (err) {
      console.error(err);
      setDeleteId(null);
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
        <div className="flex gap-3">
          <button onClick={() => setIsScannerOpen(true)} className="bg-ui-blue text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-900 transition-colors shadow-sm font-medium cursor-pointer">
            <Scan className="w-5 h-5 mr-2" /> Scan QR Code
          </button>
          
          <button onClick={() => setIsModalOpen(true)} className="bg-ui-blue text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-900 transition-colors shadow-sm font-medium cursor-pointer">
            <Plus className="w-5 h-5 mr-2" /> Add Asset
          </button>
          <div className="flex space-x-3">
            {/* NEW EXPORT BUTTON */}
            <button 
              onClick={exportToCSV}
              className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-medium hover:bg-green-100 flex items-center transition-colors hidden sm:flex"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>
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
                  <button 
                    onClick={() => {
                      setViewAsset(asset);
                      // Fetch history for this asset
                      fetch(`https://asset-mgt-ewkj.onrender.com/api/assets/${(asset as any).id}/history`, {headers: {'Authorization': `Bearer ${token}`}})
                        .then(res => res.json())
                        .then(data => setAssetHistory(data));
                    }} 
                    className="text-gray-400 hover:text-gray-900 cursor-pointer transition-colors" 
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => setAssignAsset(asset)} className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors" title="Assign Asset">
                    <UserPlus className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => setQrAsset(asset)} className="text-gray-400 hover:text-ui-blue cursor-pointer transition-colors" title="View QR Code">
                    <QrCode className="w-4 h-4 inline" />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingId((asset as any).id); 
                      setFormData({
                        asset_id: asset.asset_id,
                        name: asset.name,
                        category_id: (asset as any).category_id || '',
                        department_id: (asset as any).department_id || '',
                        location: (asset as any).location || '',
                        condition: asset.condition || 'New',
                        status: asset.status || 'Available'
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                    title="Edit Asset"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>
                  <button 
                    onClick={() => setDeleteId((asset as any).id)} 
                    className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
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
                <QRCodeSVG value={qrAsset.asset_id} size={160} level="H" />
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

      {/* Add Asset Modal (Hidden for brevity, keep your existing logic here) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Asset' : 'Register New Asset'}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingId(null); }} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Tag ID</label>
                <input 
                  required 
                  disabled={!!editingId}
                  type="text" 
                  className={`mt-1 w-full border border-gray-300 rounded-md p-2 ${editingId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                  placeholder="e.g. UIB-FUR-001"
                  value={formData.asset_id} 
                  onChange={e => setFormData({...formData, asset_id: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Office Desk"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Category</label>
                  <CustomSelect 
                    value={formData.category_id}
                    onChange={(val: string) => setFormData({...formData, category_id: val})}
                    options={categories}
                    placeholder="Select Category..."
                  />
                </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Department</label>
                  <CustomSelect 
                    value={formData.department_id}
                    onChange={(val: string) => setFormData({...formData, department_id: val})}
                    options={departments}
                    placeholder="Select Department..."
                  />
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
      {/* In-App Camera Scanner Modal */}
        {isScannerOpen && (
          <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-white p-4 rounded-xl w-full max-w-md relative overflow-hidden">
              <button 
                onClick={() => setIsScannerOpen(false)} 
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 text-gray-800 hover:text-red-600 shadow-md"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Scan Asset QR</h3>
              
              <div className="rounded-lg overflow-hidden bg-black">
                <Scanner 
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      const scannedId = result[0].rawValue;
                      const found = assets.find((a: any) => a.asset_id === scannedId);
                      
                      if (found) {
                        setIsScannerOpen(false);
                        setViewAsset(found);
                      } else {
                        alert(`Scanned ID: ${scannedId} not found in current database.`);
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-4">Point your camera at the physical asset tag.</p>
            </div>
          </div>  
        )}
        {/* Scanned Asset Details Modal */}
        {viewAsset && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
              <div className="bg-gradient-to-r from-ui-blue to-blue-900 p-5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Asset Details</h3>
                <button onClick={() => setViewAsset(null)} className="text-white/80 hover:text-white bg-white/10 rounded-full p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Asset Name</span>
                  <span className="font-bold text-gray-900">{viewAsset.name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Tag ID</span>
                  <span className="font-mono text-ui-blue font-semibold">{viewAsset.asset_id}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewAsset.status === 'In Use' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {viewAsset.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Assigned Staff</span>
                  <span className="text-gray-900 font-medium">
                    {/* Match the assigned staff ID to the staffList array */}
                    {viewAsset.assigned_to 
                      ? staffList.find((s: any) => s.id === viewAsset.assigned_to || s.staff_id === viewAsset.assigned_to)?.name || 'Unknown Staff' 
                      : <span className="text-gray-400 italic">Unassigned</span>
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="text-gray-800">{viewAsset.department?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-gray-800">{viewAsset.location || 'N/A'}</span>
                </div>
                {/* Audit History Timeline */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Audit History</h4>
                  <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {assetHistory.length > 0 ? (
                      assetHistory.map((log, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-ui-blue mt-1.5"></div>
                            {index !== assetHistory.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-1"></div>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                            <p className="text-xs text-gray-500 mb-0.5">{log.details}</p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {new Date(log.created_at).toLocaleString()} • by {log.changed_by}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No history recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Custom Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Asset?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this asset? This action cannot be undone and will permanently remove it from the database.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 bg-gray-100 text-gray-800 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}