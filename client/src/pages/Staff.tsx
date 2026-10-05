import { useState, useEffect } from 'react';
import { Users, Plus, X, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

export default function Staff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{id: string, name: string} | null>(null);
  
  const [formData, setFormData] = useState({ id: '', staff_id: '', name: '', email: '', department_id: '', position: '' });
  const [errorMsg, setErrorMsg] = useState('');

const fetchData = () => {
    const headers = { 'Authorization': `Bearer ${(user as any)?.token}` };
    Promise.all([
      fetch('https://asset-mgt-ewkj.onrender.com/api/staff', { headers }).then(res => res.json()),
      fetch('https://asset-mgt-ewkj.onrender.com/api/departments', { headers }).then(res => res.json())
    ]).then(([staffData, deptsData]) => {
      setStaff(staffData); 
      setDepartments(deptsData); 
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = formData.id ? `https://asset-mgt-ewkj.onrender.com/api/staff/${formData.id}` : 'https://asset-mgt-ewkj.onrender.com/api/staff';
    const method = formData.id ? 'PUT' : 'POST';
    
    await fetch(url, {
      method, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(user as any)?.token}` },
      body: JSON.stringify(formData)
    });
    
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const res = await fetch(`https://asset-mgt-ewkj.onrender.com/api/staff/${deleteModal.id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${(user as any)?.token}` }
    });
    if (res.ok) {
      setDeleteModal(null);
      setErrorMsg('');
      fetchData();
    } else {
      const data = await res.json();
      setErrorMsg(data.error);
    }
  };

  const openEdit = (s: any) => {
    setFormData(s);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-sm text-gray-500">Manage university personnel records</p>
        </div>
        <button onClick={() => { setFormData({ id: '', staff_id: '', name: '', email: '', department_id: '', position: '' }); setIsModalOpen(true); }} className="bg-ui-blue text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-900 cursor-pointer">
          <Plus className="w-5 h-5 mr-2" /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Staff ID</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr> : 
             staff.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.staff_id}</td>
                <td className="px-6 py-4 text-gray-600 flex items-center"><Users className="w-4 h-4 mr-2 text-gray-400"/> {s.name}</td>
                <td className="px-6 py-4 text-gray-600">{s.email}</td>
                <td className="px-6 py-4 text-gray-500">{s.department?.name}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-blue-600 cursor-pointer"><Edit className="w-4 h-4 inline" /></button>
                  <button onClick={() => { setDeleteModal(s); setErrorMsg(''); }} className="text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{formData.id ? 'Edit' : 'Add'} Staff Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Staff ID</label>
                  <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Position</label>
                  <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input required type="email" disabled={!!formData.id} className="mt-1 w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Department</label>
                <select required className="mt-1 w-full border border-gray-300 rounded-md p-2" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
                  <option value="">Select Department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-ui-blue text-white py-2 rounded-md hover:bg-blue-900 cursor-pointer">Save Staff Record</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Staff Member?</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete <strong>{deleteModal.name}</strong>? Any assets assigned to them will be released and marked as Available.</p>
            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{errorMsg}</div>}
            <div className="flex space-x-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 cursor-pointer">Delete & Release</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}