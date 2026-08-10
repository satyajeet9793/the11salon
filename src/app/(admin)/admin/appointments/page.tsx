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
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-800 mb-2">Appointments</h1>
          <p className="text-neutral-500 text-lg font-normal">Manage your daily schedule and track salon visits.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-6 py-3 bg-white/70 backdrop-blur-md border border-white/50 text-amber-600 font-medium rounded-xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)] hover:bg-white/90 transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </button>
      </div>

      {/* INTERACTIVE DATE NAVIGATOR */}
      <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-3 bg-white/50 hover:bg-white/80 text-neutral-600 rounded-2xl transition-all shadow-sm border border-white/50"
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
                  className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-2xl transition-all duration-300 flex-shrink-0 border ${
                    isSelected 
                      ? 'bg-amber-500/90 backdrop-blur-md text-white shadow-[0_8px_16px_rgba(245,158,11,0.25)] border-amber-400 transform scale-105' 
                      : 'bg-white/30 border-white/40 text-neutral-500 hover:bg-white/60 hover:text-neutral-800'
                  }`}
                >
                  <span className={`text-xs font-medium uppercase tracking-wider mb-1 ${isSelected ? 'text-amber-100' : 'text-neutral-400'}`}>
                    {format(date, 'EEE')}
                  </span>
                  <span className={`text-xl font-semibold ${isSelected ? 'text-white' : 'text-neutral-700'}`}>
                    {format(date, 'd')}
                  </span>
                  {isToday && (
                    <span className={`mt-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-neutral-400'}`}></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedDate(startOfToday())}
              className="hidden md:block px-4 py-3 bg-white/50 hover:bg-white/80 text-neutral-600 font-medium rounded-2xl transition-all shadow-sm border border-white/50"
            >
              Today
            </button>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-3 bg-white/50 hover:bg-white/80 text-neutral-600 rounded-2xl transition-all shadow-sm border border-white/50"
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
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="h-24 w-24 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/80">
              <CalendarIcon className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-800 mb-2">Your day is open!</h3>
            <p className="text-neutral-500 max-w-sm mb-8 text-lg font-normal">There are no appointments scheduled for {format(selectedDate, 'MMMM d, yyyy')}.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-8 py-3 bg-white/70 backdrop-blur-md hover:bg-white/90 text-amber-600 font-medium rounded-xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)] border border-white/50"
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
                  className="group bg-white/50 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all duration-300 border border-white/60 relative overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Status Gradient Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${statusConfig.bg} opacity-80`}></div>
                  
                  <div className="flex justify-between items-start mb-6 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-sm flex flex-col items-center min-w-[70px]">
                        <span className="text-lg font-semibold text-neutral-800 leading-none">{apt.timeSlot}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text} rounded-lg mb-1`}>
                          {statusConfig.label}
                        </span>
                        <div className="flex items-center text-xs text-neutral-500 font-medium">
                          <Clock className="h-3.5 w-3.5 mr-1 text-neutral-400" />
                          {apt.duration} mins
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-2xl font-semibold text-neutral-800 mb-1">{apt.customer?.name}</h4>
                    <p className="text-neutral-500 font-normal text-lg flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-amber-400" />
                      {apt.service?.name}
                    </p>
                  </div>

                  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/50 group-hover:bg-white/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white/80 rounded-full shadow-sm flex items-center justify-center border border-white/90">
                        {apt.staff ? (
                          <UserCheck className="h-5 w-5 text-amber-500" />
                        ) : (
                          <User className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Assigned Staff</p>
                        <p className={`font-medium ${apt.staff ? 'text-neutral-800' : 'text-neutral-500'}`}>
                          {apt.staff?.name || 'Any Available Staff'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {(apt.status === "BOOKED" || apt.status === "CHECKED_IN" || apt.status === "IN_PROGRESS") && (
                      <button 
                        onClick={() => handleCompleteAppointment(apt)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-white/60 hover:bg-white/90 text-neutral-700 rounded-xl text-sm font-medium transition-all shadow-sm border border-white/60 hover:shadow-md"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" /> Complete
                      </button>
                    )}
                    
                    {(apt.status === "BOOKED" || apt.status === "CHECKED_IN" || apt.status === "IN_PROGRESS") && (
                      <button 
                        onClick={() => updateStatus(apt.id, "CANCELLED")}
                        className="px-4 py-3 bg-white/40 hover:bg-red-50/80 text-neutral-600 hover:text-red-600 rounded-xl text-sm font-medium transition-all shadow-sm border border-white/50 hover:border-red-200"
                        title="Cancel Appointment"
                      >
                        <AlertCircle className="h-5 w-5" />
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteAppointment(apt.id)}
                      className="px-4 py-3 bg-white/40 hover:bg-red-50/80 text-neutral-400 hover:text-red-600 rounded-xl text-sm font-medium transition-all border border-white/50 hover:border-red-200 shadow-sm"
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
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl w-full max-w-2xl shadow-[0_32px_64px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-white/40 flex items-center justify-between bg-white/30">
              <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-amber-500" />
                New Appointment
              </h2>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 bg-white/50 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-white/80 transition-all shadow-sm border border-white/60">✕</button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-8 max-h-[80vh] overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                {/* Customer Section */}
                <div className="md:col-span-2 space-y-4 bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm">
                  <h3 className="text-sm font-medium text-neutral-700 uppercase tracking-wider mb-2">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 relative">
                      <label className="text-sm font-medium text-neutral-600">Phone *</label>
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
                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 placeholder:font-normal placeholder:text-neutral-400 shadow-inner"
                      />
                      {showPhoneSuggestions && formData.customerPhone.length >= 2 && (
                        <div className="absolute top-[calc(100%-0.5rem)] left-0 right-0 mt-1 bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto overflow-hidden">
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
                                    className="px-4 py-3 hover:bg-white cursor-pointer border-b border-neutral-100 last:border-0 transition-colors"
                                  >
                                    <div className="font-medium text-neutral-800">{c.phone}</div>
                                    <div className="text-xs font-normal text-amber-600">{c.name}</div>
                                  </div>
                                ))
                            ) : (
                              <div className="px-4 py-4 text-sm font-normal text-neutral-500 bg-white/50">Will create new customer</div>
                            )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-600">Name *</label>
                        <input 
                          type="text" required
                          placeholder="Customer name"
                          value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 placeholder:font-normal placeholder:text-neutral-400 shadow-inner"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-600">Birth Date (Optional)</label>
                        <input 
                          type="date"
                          value={formData.customerDob} onChange={e => setFormData({...formData, customerDob: e.target.value})}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service & Staff Section */}
                <div className="md:col-span-2 space-y-4 pt-2">
                  <h3 className="text-sm font-medium text-neutral-700 uppercase tracking-wider mb-2">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 relative md:col-span-2">
                      <label className="text-sm font-medium text-neutral-600">Services *</label>
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
                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 placeholder:font-normal placeholder:text-neutral-400 shadow-inner"
                      />
                      {/* Selected Services Chips */}
                      {formData.serviceIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.serviceIds.map(sid => {
                            const s = services.find(srv => srv.id === sid);
                            if (!s) return null;
                            return (
                              <div key={sid} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-white shadow-sm text-neutral-700 rounded-lg text-sm font-medium">
                                {s.name}
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, serviceIds: formData.serviceIds.filter(id => id !== sid) })}
                                  className="text-neutral-500 hover:text-red-500 focus:outline-none bg-neutral-100 hover:bg-red-50 p-1 rounded-full transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {showServiceSuggestions && (
                        <div className="absolute top-[calc(100%-0.5rem)] left-0 right-0 mt-1 bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto overflow-hidden">
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
                                className={`px-5 py-3 hover:bg-white cursor-pointer border-b border-neutral-100 last:border-0 transition-colors flex justify-between items-center ${formData.serviceIds.includes(s.id) ? 'bg-amber-50/50' : ''}`}
                              >
                                <div className="font-medium text-neutral-800">{s.name}</div>
                                <div className="text-sm font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">₹{s.price}</div>
                              </div>
                            ))}
                          {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                            <div className="px-5 py-4 text-sm font-normal text-neutral-500 bg-white/50">No services found</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-600">Assign Staff</label>
                      <select 
                        value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})}
                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 shadow-inner"
                      >
                        <option value="">Any Available Staff</option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-600">Custom Total (₹) (Optional)</label>
                      <input 
                        type="number" 
                        placeholder="Override total price"
                        value={formData.customPrice} onChange={e => setFormData({...formData, customPrice: e.target.value})}
                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 placeholder:font-normal placeholder:text-neutral-400 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-neutral-600">Date *</label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 shadow-inner"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-neutral-600">Time *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. 10:30 AM"
                    value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all font-medium text-neutral-700 placeholder:font-normal placeholder:text-neutral-400 shadow-inner"
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-2 pt-2">
                  <label className="text-sm font-medium text-neutral-600">Additional Notes</label>
                  <textarea 
                    rows={2}
                    placeholder="Any special requests or details..."
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none resize-none transition-all font-medium text-neutral-700 placeholder:font-normal placeholder:text-neutral-400 shadow-inner"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/40">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-neutral-600 font-medium hover:bg-white/50 rounded-xl transition-all border border-transparent hover:border-white/60"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-white/80 hover:bg-white text-amber-600 font-medium rounded-xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)] border border-white/80"
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
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl w-full max-w-sm shadow-[0_32px_64px_rgba(0,0,0,0.1)] p-8 text-center animate-in zoom-in-95 duration-300 border border-white/60">
            <div className="mx-auto h-20 w-20 bg-white/60 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/80">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-800 mb-2">All Done!</h3>
            <p className="text-neutral-500 mb-8 text-base font-normal">
              Appointment marked as completed. The bill has been successfully generated.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/admin/invoices"
                className="w-full py-3.5 bg-white/80 hover:bg-white text-amber-600 font-medium rounded-xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)] flex items-center justify-center border border-white/80"
              >
                View / Print Bill
              </Link>
              <button 
                onClick={() => setCompletedAptId(null)}
                className="w-full py-3.5 bg-white/40 hover:bg-white/60 text-neutral-600 font-medium rounded-xl transition-all border border-white/50 shadow-sm"
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
