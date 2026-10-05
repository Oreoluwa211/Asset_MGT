import { useState, useEffect } from 'react';
import { Building, Plus, X, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{id: string, name: string} | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', faculty: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useAuth();

  const fetchDepartments = () => {
      fetch('https://asset-mgt-ewkj.onrender.com/api/departments', {
        headers: { 'Authorization': `Bearer ${(user as any)?.token}` }
      })
        .then(res => res.json())
        .then(data => { setDepartments(data); setLoading(false); });
    };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = formData.id ? `https://asset-mgt-ewkj.onrender.com/api/departments/${formData.id}` : 'https://asset-mgt-ewkj.onrender.com/api/departments';
    const method = formData.id ? 'PUT' : 'POST';
    
    await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(user as any)?.token}` },
      body: JSON.stringify({ name: formData.name, faculty: formData.faculty })
    });
    setIsModalOpen(false);
    fetchDepartments();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const res = await fetch(`https://asset-mgt-ewkj.onrender.com/api/departments/${deleteModal.id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${(user as any)?.token}` }
    });
    if (res.ok) {
      setDeleteModal(null);
      setErrorMsg('');
      fetchDepartments();
    } else {
      const data = await res.json();
      setErrorMsg(data.error);
    }
  };

  const openEdit = (dept: any) => {
    setFormData(dept);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
          <p className="text-sm text-gray-500">Manage university faculties and departments</p>
        </div>
        <button onClick={() => { setFormData({ id: '', name: '', faculty: '' }); setIsModalOpen(true); }} className="bg-ui-blue text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-900 cursor-pointer">
          <Plus className="w-5 h-5 mr-2" /> Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Department Name</th>
              <th className="px-6 py-4 font-medium">Faculty</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? <tr><td colSpan={3} className="text-center py-8">Loading...</td></tr> : 
             departments.map(dept => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center"><Building className="w-4 h-4 mr-2 text-gray-400"/> {dept.name}</td>
                <td className="px-6 py-4 text-gray-600">{dept.faculty}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEdit(dept)} className="text-gray-400 hover:text-blue-600 cursor-pointer"><Edit className="w-4 h-4 inline" /></button>
                  <button onClick={() => { setDeleteModal(dept); setErrorMsg(''); }} className="text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{formData.id ? 'Edit' : 'Add'} Department</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Name</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Faculty</label>
                <input required type="text" className="mt-1 w-full border border-gray-300 rounded-md p-2" value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-ui-blue text-white py-2 rounded-md hover:bg-blue-900 cursor-pointer">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Department?</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete <strong>{deleteModal.name}</strong>?</p>
            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{errorMsg}</div>}
            <div className="flex space-x-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}