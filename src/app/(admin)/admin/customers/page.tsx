"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Download, User, Calendar, MapPin, Phone, Mail, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    address: "",
    notes: "",
    membershipYears: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(customers.map((c: any) => ({
      'Name': c.name,
      'Phone': c.phone,
      'Email': c.email || 'N/A',
      'Gender': c.gender || 'N/A',
      'DOB': c.dob ? new Date(c.dob).toLocaleDateString() : 'N/A',
      'Address': c.address || 'N/A',
      'Visits': c.visitCount,
      'Last Visit': c.appointments?.length > 0 ? new Date(c.appointments[0].date).toLocaleDateString() : 'Never',
      'Notes': c.notes || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `Customers_Export_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", phone: "", email: "", gender: "", dob: "", address: "", notes: "", membershipYears: "" });
        fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add customer");
      }
    } catch (error) {
      console.error("Error creating customer", error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("WARNING: Are you sure you want to delete this customer? All of their appointments and invoices will also be PERMANENTLY deleted. This cannot be undone!")) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomers(customers.filter((c: any) => c.id !== id));
      } else {
        alert("Failed to delete customer");
      }
    } catch (error) {
      console.error("Failed to delete customer", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Customers</h1>
          <p className="text-neutral-500 mt-1">Manage your client base and view their history.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium rounded-lg transition-colors shadow-sm"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Visits</th>
                <th className="px-6 py-4 font-medium">Last Visit</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold mr-3">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{customer.name}</div>
                          <div className="text-xs text-neutral-500 flex items-center mt-0.5">
                            {customer.gender && <span className="mr-2">{customer.gender}</span>}
                            {customer.dob && <span>{new Date(customer.dob).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-900 flex items-center mb-1"><Phone className="h-3 w-3 mr-1 text-neutral-400"/> {customer.phone}</div>
                      {customer.email && <div className="text-neutral-500 text-xs flex items-center"><Mail className="h-3 w-3 mr-1 text-neutral-400"/> {customer.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                        {customer.visitCount} visits
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {customer.appointments?.length > 0 
                        ? new Date(customer.appointments[0].date).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-3">
                      <button className="text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors">
                        View History
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Add New Customer</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Full Name *</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Mobile Number *</label>
                  <input 
                    type="tel" required
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Email Address</label>
                  <input 
                    type="email"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Gender</label>
                  <select 
                    value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Date of Birth</label>
                  <input 
                    type="date"
                    value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
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
                  <label className="text-sm font-medium text-neutral-700">Address</label>
                  <input 
                    type="text"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Internal Notes</label>
                  <textarea 
                    rows={3}
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
