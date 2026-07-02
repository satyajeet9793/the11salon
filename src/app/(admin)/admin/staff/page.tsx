"use client";

import { useState, useEffect } from "react";
import { Plus, Scissors, Phone, Star, TrendingUp } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", role: "Stylist", phone: "", skills: "", salary: "", joiningDate: "", isAvailable: true });
        fetchStaff();
      }
    } catch (error) {
      console.error("Error creating staff", error);
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
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-500">Loading staff directory...</div>
        ) : staff.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-200">
            No staff members found. Add your first team member.
          </div>
        ) : (
          staff.map((member: any) => (
            <div key={member.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xl font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">{member.name}</h3>
                      <p className="text-sm font-medium text-amber-600">{member.role}</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${member.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Phone className="h-4 w-4 mr-3 text-neutral-400" />
                    {member.phone || 'No phone added'}
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <Scissors className="h-4 w-4 mr-3 text-neutral-400" />
                    {member.skills || 'General Styling'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Completed</p>
                    <p className="text-lg font-semibold text-neutral-900 flex items-center">
                      {member.appointments?.length || 0}
                      <span className="text-xs font-normal text-neutral-500 ml-1">services</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Rating</p>
                    <p className="text-lg font-semibold text-neutral-900 flex items-center">
                      4.8
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
                <button className="text-sm font-medium text-neutral-600 hover:text-amber-600 transition-colors">Edit Profile</button>
                <button className="text-sm font-medium text-neutral-600 hover:text-amber-600 transition-colors">View Schedule</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Full Name *</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Role</label>
                  <select 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  >
                    <option value="Senior Stylist">Senior Stylist</option>
                    <option value="Stylist">Stylist</option>
                    <option value="Barber">Barber</option>
                    <option value="Beautician">Beautician</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Phone</label>
                  <input 
                    type="tel"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Skills (Comma separated)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Haircut, Coloring, Keratin"
                    value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Salary</label>
                  <input 
                    type="number"
                    value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Joining Date</label>
                  <input 
                    type="date"
                    value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isAvailable} 
                    onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-sm font-medium text-neutral-700">Available for Booking</span>
                </label>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-neutral-900 rounded-lg hover:bg-amber-600 transition-colors font-medium"
                  >
                    Save Staff
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
