"use client";

import { useState, useEffect } from "react";
import { Plus, Scissors, Clock, Pencil, Trash2 } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Hair Mens",
    description: "",
    price: "",
    duration: "60",
    benefits: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (service: any) => {
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      benefits: service.benefits || "",
    });
    setEditingId(service.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error("Failed to delete service", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editMode ? `/api/admin/services/${editingId}` : "/api/admin/services";
      const method = editMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", category: "Hair Mens", description: "", price: "", duration: "60", benefits: "" });
        setEditMode(false);
        setEditingId(null);
        fetchServices();
      }
    } catch (error) {
      console.error("Error saving service", error);
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc: any, service: any) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {});

  // Extract unique categories for the dropdown
  const allCategories = Array.from(new Set(services.map((s: any) => s.category)));
  if (allCategories.length === 0) {
    allCategories.push("Hair Mens", "Hair Women", "Facial", "Make Up", "Spa");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Services Menu</h1>
          <p className="text-neutral-500 mt-1">Manage your salon's service offerings and pricing.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: "", category: allCategories[0] as string, description: "", price: "", duration: "60", benefits: "" });
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-neutral-500">Loading services...</div>
      ) : Object.keys(groupedServices).length === 0 ? (
        <div className="py-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-200">
          No services found. Start by adding a new service.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedServices).map(([category, items]: [string, any]) => (
            <div key={category} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900">{category}</h2>
              </div>
              <ul className="divide-y divide-neutral-100">
                {items.map((service: any) => (
                  <li key={service.id} className="p-6 hover:bg-neutral-50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900">{service.name}</h3>
                      <p className="text-neutral-500 text-sm mt-1 mb-3">{service.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="flex items-center text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
                          <Clock className="h-4 w-4 mr-1.5 text-neutral-400" />
                          {service.duration} mins
                        </span>
                        <span className="flex items-center text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                          ₹{service.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button 
                        onClick={() => handleEditClick(service)}
                        className="p-2 text-neutral-600 hover:text-amber-600 border border-neutral-200 hover:border-amber-200 rounded-lg transition-colors"
                        title="Edit Service"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(service.id)}
                        className="p-2 text-neutral-600 hover:text-red-600 border border-neutral-200 hover:border-red-200 rounded-lg transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">{editMode ? "Edit Service" : "Add New Service"}</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Service Name *</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Category *</label>
                  <input 
                    type="text" required
                    list="category-list"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                  <datalist id="category-list">
                    {(allCategories as string[]).map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Duration (Minutes) *</label>
                  <input 
                    type="number" required
                    value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Price (₹) *</label>
                  <input 
                    type="number" required
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
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
                  {editMode ? "Save Changes" : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
