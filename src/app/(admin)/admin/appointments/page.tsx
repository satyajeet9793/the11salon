"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, Search, Calendar as CalendarIcon, CheckCircle2, PlayCircle, MapPin, AlertCircle, Trash2, X, User, ArrowRight, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import { format, parseISO, startOfToday, addDays, subDays } from "date-fns";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showModal, setShowModal] = useState(false);
  const [completedAptId, setCompletedAptId] = useState<string | null>(null);
  
  const [services, setServices] = useState<{id: string, name: string, price: number}[]>([]);
  const [customers, setCustomers] = useState<{id: string, name: string, phone: string}[]>([]);
  const [staffList, setStaffList] = useState<{id: string, name: string}[]>([]);
  
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerDob: "",
    serviceIds: [] as string[],
    staffId: "",
    date: "",
    timeSlot: "",
    notes: "",
    membershipYears: "",
    customPrice: ""
  });

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (showModal) {
      fetch("/api/admin/services").then(res => res.json()).then(data => setServices(data));
      fetch("/api/admin/customers").then(res => res.json()).then(data => setCustomers(data));
      fetch("/api/admin/staff").then(res => res.json()).then(data => setStaffList(data.filter((s: any) => s.isAvailable)));
    }
  }, [showModal]);

  const fetchAppointments = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/admin/appointments?date=${formattedDate}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments(selectedDate);
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment? Any associated invoices will also be deleted.")) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAppointments(appointments.filter((apt: any) => apt.id !== id));
      } else {
        alert("Failed to delete appointment");
      }
    } catch (error) {
      console.error("Failed to delete appointment", error);
    }
  };

  const handleCompleteAppointment = async (apt: any) => {
    try {
      const res = await fetch(`/api/admin/appointments/${apt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "COMPLETED" })
      });
      
      if (res.ok) {
        fetchAppointments(selectedDate);
        setCompletedAptId(apt.id);
      }
    } catch (error) {
      console.error("Failed to complete appointment", error);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.serviceIds.length === 0) {
      alert("Please select at least one service.");
      return;
    }
    try {
      const payload = {
        ...formData,
        staffId: formData.staffId || null
      };

      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ customerName: "", customerPhone: "", customerDob: "", serviceIds: [], staffId: "", date: "", timeSlot: "", notes: "", membershipYears: "", customPrice: "" });
        setServiceSearch("");
        fetchAppointments(selectedDate);
      } else {
        const errorData = await res.json().catch(() => null);
        alert(`Failed to create appointment: ${errorData?.error || res.statusText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating appointment", error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { bg: 'bg-neutral-100', text: 'text-neutral-800', border: 'border-neutral-200', label: 'Pending' };
      case 'BOOKED': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Online Booking' };
      case 'CHECKED_IN': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'Checked In' };
      case 'IN_PROGRESS': return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', label: 'In Progress' };
      case 'COMPLETED': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Completed' };
      case 'CANCELLED': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Cancelled' };
      case 'NO_SHOW': return { bg: 'bg-neutral-200', text: 'text-neutral-600', border: 'border-neutral-300', label: 'No Show' };
      default: return { bg: 'bg-neutral-100', text: 'text-neutral-800', border: 'border-neutral-200', label: status };
    }
  };

  // Generate an array of dates around the selected date for the horizontal picker
  const generateDateRange = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(selectedDate, i));
    }
    return dates;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-2">Appointments</h1>
          <p className="text-neutral-500 text-lg">Manage your daily schedule and track salon visits.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </button>
      </div>

      {/* INTERACTIVE DATE NAVIGATOR */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-2xl transition-colors shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 flex overflow-x-auto hide-scrollbar gap-2 md:justify-center py-2 px-1">
            {generateDateRange().map((date, idx) => {
              const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              const isToday = format(date, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd');
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                    isSelected 
                      ? 'bg-neutral-900 text-white shadow-md transform scale-105' 
                      : 'bg-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {format(date, 'EEE')}
                  </span>
                  <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                    {format(date, 'd')}
                  </span>
                  {isToday && (
                    <span className={`mt-1 h-1 w-1 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-neutral-900'}`}></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedDate(startOfToday())}
              className="hidden md:block px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-2xl transition-colors shadow-sm"
            >
              Today
            </button>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-2xl transition-colors shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* APPOINTMENTS LIST */}
      <div>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-neutral-500 font-medium">Loading schedule...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <div className="h-24 w-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
              <CalendarIcon className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Your day is open!</h3>
            <p className="text-neutral-500 max-w-sm mb-8 text-lg">There are no appointments scheduled for {format(selectedDate, 'MMMM d, yyyy')}.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Create the first booking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {appointments.map((apt: any) => {
              const statusConfig = getStatusConfig(apt.status);
              return (
                <div 
                  key={apt.id} 
                  className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 relative overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Status Gradient Bar */}
                  <div className={`absolute top-0 left-0 w-full h-2 ${statusConfig.bg} opacity-80`}></div>
                  
                  <div className="flex justify-between items-start mb-6 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 shadow-inner flex flex-col items-center min-w-[70px]">
                        <span className="text-lg font-black text-neutral-900 leading-none">{apt.timeSlot}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold ${statusConfig.bg} ${statusConfig.text} rounded-lg mb-1`}>
                          {statusConfig.label}
                        </span>
                        <div className="flex items-center text-xs text-neutral-500 font-medium">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {apt.duration} mins
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-2xl font-bold text-neutral-900 mb-1">{apt.customer?.name}</h4>
                    <p className="text-neutral-600 font-medium text-lg flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-amber-500" />
                      {apt.service?.name}
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-2xl p-4 mb-6 border border-neutral-100 group-hover:bg-amber-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-neutral-100">
                        {apt.staff ? (
                          <UserCheck className="h-5 w-5 text-amber-600" />
                        ) : (
                          <User className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Assigned Staff</p>
                        <p className={`font-bold ${apt.staff ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {apt.staff?.name || 'Any Available Staff'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {(apt.status === "BOOKED" || apt.status === "CHECKED_IN" || apt.status === "IN_PROGRESS") && (
                      <button 
                        onClick={() => handleCompleteAppointment(apt)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold transition-all shadow-md"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" /> Complete
                      </button>
                    )}
                    
                    {(apt.status === "BOOKED" || apt.status === "CHECKED_IN" || apt.status === "IN_PROGRESS") && (
                      <button 
                        onClick={() => updateStatus(apt.id, "CANCELLED")}
                        className="px-4 py-3 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 rounded-xl text-sm font-bold transition-all shadow-sm border border-neutral-200 hover:border-red-200"
                        title="Cancel Appointment"
                      >
                        <AlertCircle className="h-5 w-5" />
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteAppointment(apt.id)}
                      className="px-4 py-3 bg-white hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-xl text-sm font-bold transition-all border border-neutral-200 hover:border-red-200 shadow-sm"
                      title="Delete Record completely"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW APPOINTMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-amber-500" />
                New Appointment
              </h2>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shadow-sm border border-neutral-100">✕</button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                {/* Customer Section */}
                <div className="md:col-span-2 space-y-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 relative">
                      <label className="text-sm font-semibold text-neutral-700">Phone *</label>
                      <input 
                        type="text" required
                        placeholder="Search or enter new phone"
                        value={formData.customerPhone} 
                        onFocus={() => setShowPhoneSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
                        onChange={e => {
                          setFormData({...formData, customerPhone: e.target.value});
                          setShowPhoneSuggestions(true);
                        }}
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                      />
                      {showPhoneSuggestions && formData.customerPhone.length >= 2 && (
                        <div className="absolute top-[calc(100%-0.5rem)] left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto overflow-hidden">
                          {customers
                            .filter(c => c.phone.includes(formData.customerPhone))
                            .length > 0 ? (
                              customers
                                .filter(c => c.phone.includes(formData.customerPhone))
                                .map(c => (
                                  <div 
                                    key={c.phone}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setFormData({ 
                                        ...formData, 
                                        customerPhone: c.phone, 
                                        customerName: c.name,
                                        customerDob: c.dob ? c.dob.split('T')[0] : ""
                                      });
                                      setShowPhoneSuggestions(false);
                                    }}
                                    className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-neutral-50 last:border-0 transition-colors"
                                  >
                                    <div className="font-bold text-neutral-900">{c.phone}</div>
                                    <div className="text-xs font-medium text-amber-600">{c.name}</div>
                                  </div>
                                ))
                            ) : (
                              <div className="px-4 py-4 text-sm font-medium text-neutral-500 bg-neutral-50">Will create new customer</div>
                            )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-neutral-700">Name *</label>
                      <input 
                        type="text" required
                        placeholder="Customer name"
                        value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Service & Staff Section */}
                <div className="md:col-span-2 space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 relative md:col-span-2">
                      <label className="text-sm font-semibold text-neutral-700">Services *</label>
                      <input 
                        type="text"
                        placeholder="Search and add services..."
                        value={serviceSearch} 
                        onFocus={() => setShowServiceSuggestions(true)}
                        onClick={() => setShowServiceSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                        onChange={e => {
                          setServiceSearch(e.target.value);
                          setShowServiceSuggestions(true);
                        }}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                      />
                      {/* Selected Services Chips */}
                      {formData.serviceIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.serviceIds.map(sid => {
                            const s = services.find(srv => srv.id === sid);
                            if (!s) return null;
                            return (
                              <div key={sid} className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-sm font-bold shadow-sm border border-amber-200">
                                {s.name}
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, serviceIds: formData.serviceIds.filter(id => id !== sid) })}
                                  className="text-amber-700 hover:text-amber-900 focus:outline-none bg-amber-200/50 hover:bg-amber-300 p-1 rounded-full transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {showServiceSuggestions && (
                        <div className="absolute top-[calc(100%-0.5rem)] left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto overflow-hidden">
                          {services
                            .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                            .map(s => (
                              <div 
                                key={s.id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  if (!formData.serviceIds.includes(s.id)) {
                                    setFormData({ ...formData, serviceIds: [...formData.serviceIds, s.id] });
                                  }
                                  setServiceSearch("");
                                  setShowServiceSuggestions(false);
                                }}
                                className={`px-5 py-3 hover:bg-amber-50 cursor-pointer border-b border-neutral-50 last:border-0 transition-colors flex justify-between items-center ${formData.serviceIds.includes(s.id) ? 'bg-amber-50' : ''}`}
                              >
                                <div className="font-bold text-neutral-900">{s.name}</div>
                                <div className="text-sm font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-md">₹{s.price}</div>
                              </div>
                            ))}
                          {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                            <div className="px-5 py-4 text-sm font-medium text-neutral-500 bg-neutral-50">No services found</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-neutral-700">Assign Staff</label>
                      <select 
                        value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all font-medium text-neutral-800"
                      >
                        <option value="">Any Available Staff</option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-neutral-700">Custom Total (₹) (Optional)</label>
                      <input 
                        type="number" 
                        placeholder="Override total price"
                        value={formData.customPrice} onChange={e => setFormData({...formData, customPrice: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-semibold text-neutral-700">Date *</label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-semibold text-neutral-700">Time *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. 10:30 AM"
                    value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-2 pt-2">
                  <label className="text-sm font-semibold text-neutral-700">Additional Notes</label>
                  <textarea 
                    rows={2}
                    placeholder="Any special requests or details..."
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none resize-none transition-all"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-neutral-700 font-bold hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BILL GENERATION SUCCESS MODAL */}
      {completedAptId && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white ring-1 ring-green-100">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">All Done!</h3>
            <p className="text-neutral-500 mb-8 text-base">
              Appointment marked as completed. The bill has been successfully generated.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/admin/invoices"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center"
              >
                View / Print Bill
              </Link>
              <button 
                onClick={() => setCompletedAptId(null)}
                className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-colors"
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
