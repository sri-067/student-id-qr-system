import React, { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

function StudentRow({ s, onAction }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-indigo-600 font-medium text-sm">
              {s.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{s.name}</div>
            <div className="text-sm text-gray-500">{s.regNo}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{s.department}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{s.year}</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {s.metadata && Object.keys(s.metadata).length > 0 ? (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {Object.keys(s.metadata).length} fields
          </span>
        ) : (
          <span className="text-gray-400">None</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          s.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {s.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onAction('download', s)} 
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            title="Download QR Code"
          >
            <i className="fas fa-download mr-1"></i>QR
          </button>
          <button 
            onClick={() => onAction('reissue', s)} 
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            title="Reissue QR Code"
          >
            Reissue
          </button>
          {s.status === 'active' ? (
            <button 
              onClick={() => onAction('deactivate', s)} 
              className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
              title="Suspend Student"
            >
              Suspend
            </button>
          ) : (
            <button 
              onClick={() => onAction('reactivate', s)} 
              className="text-green-600 hover:text-green-900 text-sm font-medium"
              title="Reactivate Student"
            >
              Activate
            </button>
          )}
          <button 
            onClick={() => onAction('edit', s)} 
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            title="Edit Student"
          >
            Edit
          </button>
          <button 
            onClick={() => onAction('renew', s)} 
            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
            title="Renew Expiry"
          >
            Renew
          </button>
          <button 
            onClick={() => onAction('delete', s)} 
            className="text-orange-600 hover:text-orange-900 text-sm font-medium"
            title="Soft Delete"
          >
            Delete
          </button>
          <button 
            onClick={() => onAction('permanent-delete', s)} 
            className="text-red-600 hover:text-red-900 text-sm font-medium"
            title="Permanent Delete"
          >
            Permanent
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    regNo: '', name: '', department: '', year: '', photo: null, metadata: [], customExpiry: ''
  });
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewStudent, setRenewStudent] = useState(null);
  const [renewData, setRenewData] = useState({ extraMinutes: 10, customExpiryDateTime: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editData, setEditData] = useState({ metadata: [] });

  async function load() {
    setLoading(true);
    try {
      const res = await API.get("/api/students", { params: { search: query, limit: 200 } });
      setStudents(res.data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAddStudent(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newStudent).forEach(key => {
        if (key === 'metadata') {
          const metaObj = {};
          newStudent.metadata.forEach(item => {
            if (item.key && item.value) metaObj[item.key] = item.value;
          });
          if (Object.keys(metaObj).length > 0) {
            formData.append('metadata', JSON.stringify(metaObj));
          }
        } else if (key === 'customExpiry' && newStudent[key]) {
          formData.append('customExpiry', newStudent[key]);
        } else if (newStudent[key]) {
          formData.append(key, newStudent[key]);
        }
      });
      
      await API.post('/api/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setNewStudent({ regNo: '', name: '', department: '', year: '', photo: null, metadata: [], customExpiry: '' });
      setShowAddForm(false);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to add student');
    }
  }

  async function onAction(action, student) {
    try {
      if (action === "download") {
        const res = await API.get(`/api/students/${student._id}/qr`);
        const link = document.createElement('a');
        link.href = res.data.qrDataUrl;
        link.download = `QR_${student.regNo}_${student.name}.png`;
        link.click();
      } else if (action === "reissue") {
        const res = await API.put(`/api/students/${student._id}/reissue`);
        alert("QR reissued. New URL:\n" + res.data.signedUrl);
        load();
      } else if (action === "deactivate") {
        await API.put(`/api/students/${student._id}/deactivate`);
        load();
      } else if (action === "reactivate") {
        await API.put(`/api/students/${student._id}/reactivate`);
        load();
      } else if (action === "delete") {
        if (!confirm("Soft-delete this student?")) return;
        await API.delete(`/api/students/${student._id}`);
        load();
      } else if (action === "permanent-delete") {
        if (!confirm(`PERMANENTLY DELETE ${student.name}? This cannot be undone!`)) return;
        if (!confirm("Are you absolutely sure? This will permanently remove all data!")) return;
        await API.delete(`/api/students/${student._id}/permanent`);
        load();
      } else if (action === "edit") {
        setEditStudent(student);
        const metaArray = student.metadata ? Object.entries(student.metadata).map(([key, value]) => ({key, value})) : [];
        setEditData({ metadata: metaArray });
        setShowEditModal(true);
      } else if (action === "renew") {
        setRenewStudent(student);
        setShowRenewModal(true);
      }
    } catch (e) {
      alert(e.response?.data?.error || "Action failed");
    }
  }

  async function handleRenewExpiry(e) {
    e.preventDefault();
    try {
      const payload = {};
      if (renewData.customExpiryDateTime) {
        payload.customExpiryDate = renewData.customExpiryDateTime;
      } else {
        payload.extraDays = parseInt(renewData.extraMinutes); // This is actually minutes
      }
      
      await API.put(`/api/students/${renewStudent._id}/renew`, payload);
      setShowRenewModal(false);
      setRenewData({ extraMinutes: 10, customExpiryDateTime: '' });
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to renew expiry');
    }
  }

  async function handleEditStudent(e) {
    e.preventDefault();
    try {
      const metaObj = {};
      editData.metadata.forEach(item => {
        if (item.key && item.value) metaObj[item.key] = item.value;
      });
      
      await API.put(`/api/students/${editStudent._id}/metadata`, { metadata: metaObj });
      setShowEditModal(false);
      setEditData({ metadata: [] });
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update student');
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Student
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                placeholder="Search by name or registration number..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={load}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <i className="fas fa-search"></i>
              Search
            </button>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add New Student</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <input
                  placeholder="Registration Number"
                  value={newStudent.regNo}
                  onChange={e => setNewStudent({...newStudent, regNo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  placeholder="Full Name"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  placeholder="Department"
                  value={newStudent.department}
                  onChange={e => setNewStudent({...newStudent, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <select
                  value={newStudent.year}
                  onChange={e => setNewStudent({...newStudent, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                <input
                  placeholder="Password (optional - defaults to reg number)"
                  type="password"
                  value={newStudent.password || ''}
                  onChange={e => setNewStudent({...newStudent, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setNewStudent({...newStudent, photo: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                
                {/* Metadata Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Additional Metadata</label>
                  {newStudent.metadata.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          placeholder="Key"
                          value={item.key}
                          onChange={e => {
                            const updated = [...newStudent.metadata];
                            updated[index].key = e.target.value;
                            setNewStudent({...newStudent, metadata: updated});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newStudent.metadata.filter((_, i) => i !== index);
                            setNewStudent({...newStudent, metadata: updated});
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 flex-shrink-0"
                          title="Remove field"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <input
                        placeholder="Value"
                        value={item.value}
                        onChange={e => {
                          const updated = [...newStudent.metadata];
                          updated[index].value = e.target.value;
                          setNewStudent({...newStudent, metadata: updated});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setNewStudent({...newStudent, metadata: [...newStudent.metadata, {key: '', value: ''}]});
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <i className="fas fa-plus"></i> Add Metadata Field
                  </button>
                </div>
                
                {/* Custom Expiry DateTime */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Expiry (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newStudent.customExpiry}
                    onChange={e => setNewStudent({...newStudent, customExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for default 10-minute expiry</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && editStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Student - {editStudent.name}</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleEditStudent} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Metadata</label>
                  {editData.metadata.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          placeholder="Key"
                          value={item.key}
                          onChange={e => {
                            const updated = [...editData.metadata];
                            updated[index].key = e.target.value;
                            setEditData({...editData, metadata: updated});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editData.metadata.filter((_, i) => i !== index);
                            setEditData({...editData, metadata: updated});
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 flex-shrink-0"
                          title="Remove field"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <input
                        placeholder="Value"
                        value={item.value}
                        onChange={e => {
                          const updated = [...editData.metadata];
                          updated[index].value = e.target.value;
                          setEditData({...editData, metadata: updated});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEditData({...editData, metadata: [...editData.metadata, {key: '', value: ''}]});
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <i className="fas fa-plus"></i> Add Metadata Field
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Renew Expiry Modal */}
        {showRenewModal && renewStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Renew Expiry - {renewStudent.name}</h3>
                <button
                  onClick={() => setShowRenewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleRenewExpiry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renewal Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="renewMethod"
                        checked={!renewData.customExpiryDateTime}
                        onChange={() => setRenewData({...renewData, customExpiryDateTime: ''})}
                        className="mr-2"
                      />
                      <span>Add Minutes</span>
                    </label>
                    {!renewData.customExpiryDateTime && (
                      <input
                        type="number"
                        placeholder="Minutes to add"
                        value={renewData.extraMinutes}
                        onChange={e => setRenewData({...renewData, extraMinutes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="1"
                      />
                    )}
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="renewMethod"
                        checked={!!renewData.customExpiryDateTime}
                        onChange={() => setRenewData({...renewData, customExpiryDateTime: new Date().toISOString().slice(0, 16)})}
                        className="mr-2"
                      />
                      <span>Set Custom Date & Time</span>
                    </label>
                    {renewData.customExpiryDateTime && (
                      <input
                        type="datetime-local"
                        value={renewData.customExpiryDateTime}
                        onChange={e => setRenewData({...renewData, customExpiryDateTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRenewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Renew Expiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Metadata</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading students...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No students found</td></tr>
                ) : (
                  students.map(s => <StudentRow key={s._id} s={s} onAction={onAction} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}