"use client";

import { useState, useEffect } from "react";
import { Plus, Scissors, Phone, Edit2, Trash2, Calendar, TrendingUp, CalendarDays, Award } from "lucide-react";
import { format } from "date-fns";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffHistory, setStaffHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openHistoryModal = async (member: any) => {
    setSelectedStaff(member);
    setHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/appointments?staffId=${member.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStaffHistory(data);
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
    fetchStaff(selectedDate);
  }, [selectedDate]);

  const fetchStaff = async (dateStr?: string) => {
    setLoading(true);
    try {
      const url = dateStr ? `/api/admin/staff?date=${dateStr}` : `/api/admin/staff`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStaff(data);
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
          fetchStaff(selectedDate);
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
        fetchStaff(selectedDate);
      }
    } catch (error) {
      console.error("Error saving staff", error);
    }
  };

  // Team totals
  const teamDayRevenue = staff.reduce((acc, s) => acc + (s.business?.day || 0), 0);
  const teamDayServices = staff.reduce((acc, s) => acc + (s.business?.dayCount || 0), 0);
  const teamWeekRevenue = staff.reduce((acc, s) => acc + (s.business?.week || 0), 0);
  const teamWeekServices = staff.reduce((acc, s) => acc + (s.business?.weekCount || 0), 0);
  const teamMonthRevenue = staff.reduce((acc, s) => acc + (s.business?.month || 0), 0);
  const teamMonthServices = staff.reduce((acc, s) => acc + (s.business?.monthCount || 0), 0);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  let displayDateLabel = "Today";
  try {
    if (selectedDate !== todayStr) {
      displayDateLabel = format(new Date(selectedDate), "MMM d, yyyy");
    }
  } catch (e) {}

  return (
    <div className="space-y-6">
      {/* HEADER SECTION WITH DATE PICKER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/40 p-5 rounded-3xl border border-white/60 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Staff Management</h1>
          <p className="text-neutral-500 mt-1">Track every staff member's business revenue (day, week, month) & performance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center bg-white border border-neutral-200 rounded-xl px-3 py-2 shadow-sm gap-2">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Date:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-medium text-neutral-800 bg-transparent outline-none cursor-pointer"
            />
            {selectedDate !== todayStr && (
              <button 
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors"
              >
                Reset to Today
              </button>
            )}
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* TEAM BUSINESS KPI SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* DAY CARD */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/30 rounded-2xl p-5 border border-amber-200/70 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Day Business ({displayDateLabel})</p>
              <h3 className="text-2xl font-bold text-neutral-900 mt-1">₹{teamDayRevenue.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-amber-800/80 font-medium">
            {teamDayServices} completed {teamDayServices === 1 ? 'service' : 'services'} across all staff
          </p>
        </div>

        {/* WEEK CARD */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-2xl p-5 border border-blue-200/70 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">This Week's Business</p>
              <h3 className="text-2xl font-bold text-neutral-900 mt-1">₹{teamWeekRevenue.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-blue-800/80 font-medium">
            {teamWeekServices} completed {teamWeekServices === 1 ? 'service' : 'services'} across all staff
          </p>
        </div>

        {/* MONTH CARD */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 rounded-2xl p-5 border border-emerald-200/70 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">This Month's Business</p>
              <h3 className="text-2xl font-bold text-neutral-900 mt-1">₹{teamMonthRevenue.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-800/80 font-medium">
            {teamMonthServices} completed {teamMonthServices === 1 ? 'service' : 'services'} across all staff
          </p>
        </div>
      </div>

      {/* STAFF CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-neutral-500 font-medium">Calculating staff business & loading directory...</p>
          </div>
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
            <div key={member.id} className="group bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative transform hover:-translate-y-1">
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

                {/* Profile Header */}
                <div className="flex flex-col items-center mb-4 mt-2">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-800 text-xl font-bold shadow-inner mb-2 border-2 border-white ring-1 ring-neutral-100">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">{member.role}</span>
                    <span className={`h-2 w-2 rounded-full ${member.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-neutral-400">{member.isAvailable ? 'Available' : 'On Leave'}</span>
                  </div>
                </div>

                {/* Contact & Skills info */}
                <div className="space-y-1.5 mb-4 bg-neutral-50/60 p-3 rounded-xl border border-neutral-100 text-xs text-neutral-600">
                  <div className="flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                    <span>{member.phone || 'No phone added'}</span>
                  </div>
                  <div className="flex items-center">
                    <Scissors className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                    <span className="truncate">{member.skills || 'General Styling & Services'}</span>
                  </div>
                </div>

                {/* BUSINESS PERFORMANCE SECTION */}
                <div className="mb-4 bg-neutral-50/90 rounded-2xl p-3.5 border border-neutral-200/70">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                      Business Done
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-600 bg-white px-2 py-0.5 rounded-md border border-neutral-200 shadow-2xs">
                      {displayDateLabel}
                    </span>
                  </div>

                  {/* 3 Metrics: Day, Week, Month */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day */}
                    <div className="bg-white rounded-xl p-2.5 border border-amber-200 shadow-xs text-center flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">That Day</p>
                      <p className="text-base font-extrabold text-neutral-900 leading-tight">
                        ₹{(member.business?.day || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-medium mt-1">
                        {member.business?.dayCount || 0} svcs
                      </p>
                    </div>

                    {/* Week */}
                    <div className="bg-white rounded-xl p-2.5 border border-blue-200 shadow-xs text-center flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Week</p>
                      <p className="text-base font-extrabold text-neutral-900 leading-tight">
                        ₹{(member.business?.week || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-medium mt-1">
                        {member.business?.weekCount || 0} svcs
                      </p>
                    </div>

                    {/* Month */}
                    <div className="bg-white rounded-xl p-2.5 border border-emerald-200 shadow-xs text-center flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Month</p>
                      <p className="text-base font-extrabold text-neutral-900 leading-tight">
                        ₹{(member.business?.month || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-medium mt-1">
                        {member.business?.monthCount || 0} svcs
                      </p>
                    </div>
                  </div>

                  {/* All-time footer */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-200 flex items-center justify-between text-xs px-1">
                    <span className="text-neutral-500">All-Time Total:</span>
                    <span className="font-bold text-neutral-900">
                      ₹{(member.business?.total || 0).toLocaleString()}{" "}
                      <span className="font-normal text-neutral-400">({member.business?.totalCount || 0} services)</span>
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => openHistoryModal(member)}
                  className="mt-auto w-full py-2.5 bg-neutral-900 text-white hover:bg-amber-600 rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <Calendar className="h-4 w-4" />
                  View Detailed Service History
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT MODAL */}
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
                    <option value="Beautician">Beautician</option>
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
                    placeholder="e.g. Haircut, Coloring, Makeup, Spa"
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

      {/* SERVICE HISTORY & PERFORMANCE MODAL */}
      {historyModal && selectedStaff && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{selectedStaff.name}'s Performance & History</h2>
                <p className="text-sm text-neutral-500">{selectedStaff.role} • {staffHistory.length} total appointments</p>
              </div>
              <button onClick={() => setHistoryModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
            
            {/* Modal Business Summary Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-neutral-50/80 border-b border-neutral-200">
              <div className="bg-white p-3 rounded-xl border border-amber-200/80 text-center shadow-xs">
                <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider">That Day ({displayDateLabel})</span>
                <span className="text-lg font-extrabold text-neutral-900">₹{(selectedStaff.business?.day || 0).toLocaleString()}</span>
                <span className="text-[11px] text-neutral-500 block">{selectedStaff.business?.dayCount || 0} services</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-200/80 text-center shadow-xs">
                <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">This Week</span>
                <span className="text-lg font-extrabold text-neutral-900">₹{(selectedStaff.business?.week || 0).toLocaleString()}</span>
                <span className="text-[11px] text-neutral-500 block">{selectedStaff.business?.weekCount || 0} services</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200/80 text-center shadow-xs">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">This Month</span>
                <span className="text-lg font-extrabold text-neutral-900">₹{(selectedStaff.business?.month || 0).toLocaleString()}</span>
                <span className="text-[11px] text-neutral-500 block">{selectedStaff.business?.monthCount || 0} services</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200/80 text-center shadow-xs">
                <span className="text-[10px] text-purple-700 font-bold block uppercase tracking-wider">All-Time Total</span>
                <span className="text-lg font-extrabold text-neutral-900">₹{(selectedStaff.business?.total || 0).toLocaleString()}</span>
                <span className="text-[11px] text-neutral-500 block">{selectedStaff.business?.totalCount || 0} services</span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Service Appointments</h3>
              {loadingHistory ? (
                <div className="py-8 text-center text-neutral-500">Loading history...</div>
              ) : staffHistory.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">No past services found.</div>
              ) : (
                <div className="space-y-3">
                  {staffHistory.map((apt: any) => {
                    const price = apt.payment?.amount ?? (apt.customPrice !== null ? apt.customPrice : (apt.service?.price ?? 0));
                    return (
                      <div key={apt.id} className="bg-neutral-50 hover:bg-neutral-100/80 transition-colors border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex gap-4">
                          <div className="bg-white border border-neutral-200 rounded-lg p-3 flex flex-col items-center justify-center min-w-[70px] shadow-xs">
                            <span className="text-xl font-bold text-neutral-900 leading-none">{format(new Date(apt.date), 'dd')}</span>
                            <span className="text-xs text-amber-700 font-semibold uppercase mt-1">{format(new Date(apt.date), 'MMM')}</span>
                            <span className="text-[11px] text-neutral-400 mt-0.5">{format(new Date(apt.date), 'yyyy')}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-neutral-900">{apt.service?.name || "Service"}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-700'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-600 flex flex-col gap-1">
                              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neutral-400" /> {format(new Date(apt.date), 'dd MMMM yyyy')} • {apt.timeSlot} ({apt.duration} mins)</span>
                              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-neutral-400" /> Client: {apt.customer?.name || "Walk-in"} ({apt.customer?.phone || ""})</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <div className="font-extrabold text-neutral-900 text-base">₹{price.toLocaleString()}</div>
                          {apt.payment?.method && (
                            <span className="text-[11px] text-neutral-500 uppercase font-medium">via {apt.payment.method}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <button 
                onClick={() => setHistoryModal(false)}
                className="px-5 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors font-medium text-sm"
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
