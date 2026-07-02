"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, Search, Calendar as CalendarIcon, CheckCircle2, PlayCircle, MapPin, AlertCircle, Trash2 } from "lucide-react";
import { format, parseISO, startOfToday, addDays, subDays } from "date-fns";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showModal, setShowModal] = useState(false);
  const [completedAptId, setCompletedAptId] = useState<string | null>(null);
  const [services, setServices] = useState<{id: string, name: string, price: number}[]>([]);
  const [customers, setCustomers] = useState<{id: string, name: string, phone: string}[]>([]);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    date: "",
    timeSlot: "",
    notes: "",
    membershipYears: ""
  });

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (showModal) {
      fetch("/api/admin/services").then(res => res.json()).then(data => setServices(data));
      fetch("/api/admin/customers").then(res => res.json()).then(data => setCustomers(data));
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
      // 1. Mark as completed
      const res = await fetch(`/api/admin/appointments/${apt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "COMPLETED" })
      });
      
      if (res.ok) {
        // 2. Generate invoice automatically
        const invoiceRes = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: apt.id,
            amount: apt.service?.price || 0,
            method: "CASH",
            status: "PAID"
          })
        });

        if (invoiceRes.ok) {
          fetchAppointments(selectedDate);
          setCompletedAptId(apt.id);
        }
      }
    } catch (error) {
      console.error("Failed to complete appointment", error);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ customerName: "", customerPhone: "", serviceId: "", date: "", timeSlot: "", notes: "", membershipYears: "" });
        fetchAppointments(selectedDate);
      } else {
        alert("Failed to create appointment.");
      }
    } catch (error) {
      console.error("Error creating appointment", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded-full">Pending</span>;
      case 'BOOKED': return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Online Booking</span>;
      case 'CHECKED_IN': return <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">Checked In</span>;
      case 'IN_PROGRESS': return <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">In Progress</span>;
      case 'COMPLETED': return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Cancelled</span>;
      case 'NO_SHOW': return <span className="px-2.5 py-1 text-xs font-medium bg-neutral-200 text-neutral-600 rounded-full">No Show</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Appointments</h1>
          <p className="text-neutral-500 mt-1">Manage today's schedule and check-in customers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-2 text-neutral-500 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              &lt;
            </button>
            <div className="relative flex items-center font-medium text-neutral-900 bg-white px-4 py-2 border border-neutral-200 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer">
              <CalendarIcon className="h-4 w-4 mr-2 text-amber-500" />
              <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
              <input 
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => {
                  if (e.target.value) {
                    // We parse the local date string to avoid timezone shifts
                    const [year, month, day] = e.target.value.split('-');
                    setSelectedDate(new Date(Number(year), Number(month) - 1, Number(day)));
                  }
                }}
              />
            </div>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 text-neutral-500 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              &gt;
            </button>
            <button 
              onClick={() => setSelectedDate(startOfToday())}
              className="px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading schedule...</div>
          ) : appointments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900">No appointments scheduled</h3>
              <p className="text-neutral-500 mt-1">There are no bookings for this date.</p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {appointments.map((apt: any) => (
                <li key={apt.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-6">
                      <div className="text-center w-24 flex-shrink-0">
                        <div className="text-lg font-bold text-neutral-900">{apt.timeSlot}</div>
                        <div className="text-sm text-neutral-500 flex items-center justify-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {apt.duration} min
                        </div>
                      </div>
                      
                      <div className="w-[1px] h-16 bg-neutral-200 hidden md:block"></div>

                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900">{apt.customer?.name}</h4>
                        <p className="text-neutral-600">{apt.service?.name}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {getStatusBadge(apt.status)}
                          <span className="text-sm text-neutral-500">With {apt.staff?.name || 'Any Staff'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(apt.status === "BOOKED" || apt.status === "CHECKED_IN" || apt.status === "IN_PROGRESS") && (
                        <>
                          <button 
                            onClick={() => handleCompleteAppointment(apt)}
                            className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors shadow-sm border border-green-200"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete
                          </button>
                          <button 
                            onClick={() => updateStatus(apt.id, "CANCELLED")}
                            className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors shadow-sm border border-red-200"
                          >
                            <AlertCircle className="h-4 w-4 mr-1.5" /> Cancel
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className="flex items-center px-3 py-1.5 bg-neutral-100 text-neutral-500 hover:bg-red-50 hover:text-red-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* NEW APPOINTMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Add New Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Customer Name *</label>
                  <input 
                    type="text" required
                    placeholder="Enter customer name"
                    value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1 relative">
                  <label className="text-sm font-medium text-neutral-700">Customer Phone *</label>
                  <input 
                    type="text" required
                    placeholder="Enter phone number"
                    value={formData.customerPhone} 
                    onFocus={() => setShowPhoneSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
                    onChange={e => {
                      setFormData({...formData, customerPhone: e.target.value});
                      setShowPhoneSuggestions(true);
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                  {showPhoneSuggestions && formData.customerPhone.length >= 2 && (
                    <div className="absolute top-[calc(100%-1.25rem)] left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {customers
                        .filter(c => c.phone.includes(formData.customerPhone))
                        .length > 0 ? (
                          customers
                            .filter(c => c.phone.includes(formData.customerPhone))
                            .map(c => (
                              <div 
                                key={c.phone}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent onBlur from firing before this completes
                                  setFormData({ ...formData, customerPhone: c.phone, customerName: c.name });
                                  setShowPhoneSuggestions(false);
                                }}
                                className="px-4 py-2 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0"
                              >
                                <div className="font-medium text-neutral-900">{c.phone}</div>
                                <div className="text-xs text-neutral-500">{c.name}</div>
                              </div>
                            ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-neutral-500">New customer</div>
                        )}
                    </div>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">If phone exists, appointment is added to them. If not, a new customer is created.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Service *</label>
                  <select 
                    required
                    value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none bg-white"
                  >
                    <option value="" disabled>Select a service</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Date *</label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Time *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. 10:30 AM"
                    value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Membership (Optional)</label>
                  <select 
                    value={formData.membershipYears} onChange={e => setFormData({...formData, membershipYears: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none bg-white"
                  >
                    <option value="">None</option>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Notes</label>
                  <textarea 
                    rows={2}
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
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
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BILL GENERATION SUCCESS MODAL */}
      {completedAptId && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Service Completed!</h3>
            <p className="text-neutral-500 mb-8 text-sm">
              The appointment has been marked as completed, and the bill has been automatically generated with the service price.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/admin/invoices"
                className="w-full py-3 bg-amber-500 text-neutral-900 font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center"
              >
                View / Print Bill
              </Link>
              <button 
                onClick={() => setCompletedAptId(null)}
                className="w-full py-3 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition-colors"
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
