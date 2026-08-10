"use client";

import { useState, useEffect } from "react";
import { Plus, Scissors, Phone, Star, Edit2, Trash2, Calendar } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffHistory, setStaffHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openHistoryModal = async (member: any) => {
    setSelectedStaff(member);
    setHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/appointments?staffId=${member.id}`);
      if (res.ok) {
        const data = await res.json();
        setStaffHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch staff history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    role: "Stylist",
    phone: "",
    skills: "",
    salary: "",
    joiningDate: "",
    isAvailable: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/staff`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (error) {
      console.error("Failed to fetch staff", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", role: "Stylist", phone: "", skills: "", salary: "", joiningDate: "", isAvailable: true });
    setShowModal(true);
  };

  const openEditModal = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      phone: member.phone || "",
      skills: member.skills || "",
      salary: member.salary || "",
      joiningDate: member.joiningDate ? member.joiningDate.split("T")[0] : "",
      isAvailable: member.isAvailable
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        const res = await fetch(`/api/admin/staff/${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          fetchStaff();
        }
      } catch (error) {
        console.error("Failed to delete staff", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/staff/${editingId}` : "/api/admin/staff";
      const method = editingId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchStaff();
      }
    } catch (error) {
      console.error("Error saving staff", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Staff Management</h1>
          <p className="text-neutral-500 mt-1">Manage your team, track performance and availability.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-500">Loading staff directory...</div>
        ) : staff.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <div className="h-24 w-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <Scissors className="h-10 w-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Staff Found</h3>
            <p className="text-neutral-500 max-w-sm mb-6">Your team is the heart of the salon. Start by adding your first stylist or staff member here.</p>
            <button 
              onClick={openAddModal}
              className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium shadow-md"
            >
              Add First Member
            </button>
          </div>
        ) : (
          staff.map((member: any) => (
            <div key={member.id} className="group bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative transform hover:-translate-y-1">
              {/* Decorative top bar */}
              <div className={`h-2 w-full ${member.isAvailable ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}></div>
              
              <div className="p-6 flex-1 flex flex-col relative">
                
                {/* Actions (visible on hover) */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => openHistoryModal(member)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-neutral-600 hover:text-amber-600 hover:bg-amber-50 shadow-sm border border-neutral-100 transition-colors"
                    title="View History"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => openEditModal(member)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-neutral-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm border border-neutral-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-neutral-600 hover:text-red-600 hover:bg-red-50 shadow-sm border border-neutral-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-5 mt-2">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-800 text-2xl font-bold shadow-inner mb-3 border-4 border-white ring-1 ring-neutral-100">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{member.role}</span>
                    <span className={`h-2 w-2 rounded-full ${member.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-neutral-50/50 p-4 rounded-xl flex-1 border border-neutral-50">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Phone className="h-4 w-4 mr-3 text-neutral-400" />
                    {member.phone || 'No phone added'}
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <Scissors className="h-4 w-4 mr-3 text-neutral-400" />
                    <span className="truncate">{member.skills || 'General Styling'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="bg-neutral-50 rounded-lg p-3 text-center border border-neutral-100 transition-colors group-hover:border-amber-100">
                    <p className="text-xs text-neutral-500 mb-1">Services</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {member.appointments?.length || 0}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3 text-center border border-neutral-100 transition-colors group-hover:border-amber-100">
                    <p className="text-xs text-neutral-500 mb-1">Rating</p>
                    <p className="text-lg font-bold text-neutral-900 flex items-center justify-center">
                      4.8
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500 ml-1" />
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => openHistoryModal(member)}
                  className="mt-4 w-full py-2.5 bg-neutral-900 text-white hover:bg-amber-600 rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <Calendar className="h-4 w-4" />
                  View Service History
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h2 className="text-xl font-bold text-neutral-900">{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-200 text-neutral-500 transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-neutral-700">Full Name *</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Role *</label>
                  <select 
                    required
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  >
                    <option value="Stylist">Stylist</option>
                    <option value="Senior Stylist">Senior Stylist</option>
                    <option value="Colorist">Colorist</option>
                    <option value="Therapist">Therapist</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Phone</label>
                  <input 
                    type="text" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-neutral-700">Skills (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Haircut, Coloring, Highlights"
                    value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Base Salary / Month</label>
                  <input 
                    type="number" 
                    value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Joining Date</label>
                  <input 
                    type="date" 
                    value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isAvailable} 
                      onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                      className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 border-neutral-300"
                    />
                    <div>
                      <span className="text-sm font-semibold text-neutral-900 block">Available for Booking</span>
                      <span className="text-xs text-neutral-500">Uncheck if the staff member is on leave</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-neutral-700 font-medium hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-neutral-900 text-white font-medium hover:bg-neutral-800 rounded-xl transition-colors shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {historyModal && selectedStaff && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{selectedStaff.name}'s Service History</h2>
                <p className="text-sm text-neutral-500">{selectedStaff.role} • {staffHistory.length} total services</p>
              </div>
              <button onClick={() => setHistoryModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingHistory ? (
                <div className="py-8 text-center text-neutral-500">Loading history...</div>
              ) : staffHistory.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">No past services found.</div>
              ) : (
                <div className="space-y-4">
                  {staffHistory.map((apt: any) => (
                    <div key={apt.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex gap-4">
                        <div className="bg-white border border-neutral-200 rounded-lg p-3 flex flex-col items-center justify-center min-w-[70px]">
                          <span className="text-xs text-neutral-500 uppercase font-semibold">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-xl font-bold text-neutral-900">{new Date(apt.date).getDate()}</span>
                          <span className="text-xs text-neutral-500">{new Date(apt.date).getFullYear()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-neutral-900">{apt.service?.name || "Service"}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-200 text-neutral-700">{apt.status}</span>
                          </div>
                          <div className="text-sm text-neutral-600 flex flex-col gap-1">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {apt.timeSlot} ({apt.duration} mins)</span>
                            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Customer: {apt.customer?.name || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto">
                        <div className="font-bold text-neutral-900">₹{apt.customPrice ?? apt.service?.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <button 
                onClick={() => setHistoryModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
