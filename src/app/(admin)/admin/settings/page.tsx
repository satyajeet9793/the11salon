"use client";

import { useState, useEffect } from "react";
import { Save, Store, Clock, Bell, Shield, Smartphone, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [generalSettings, setGeneralSettings] = useState({
    salonName: "The 11 Professional Family Salon",
    phone: "+91 7447488880",
    email: "contact@the11salon.com",
    address: "Kolhapur, Maharashtra",
    currency: "INR (₹)",
  });

  const [businessHours, setBusinessHours] = useState([
    { day: "Monday", open: "10:00 AM", close: "08:00 PM", isOpen: true },
    { day: "Tuesday", open: "10:00 AM", close: "08:00 PM", isOpen: true },
    { day: "Wednesday", open: "10:00 AM", close: "08:00 PM", isOpen: true },
    { day: "Thursday", open: "10:00 AM", close: "08:00 PM", isOpen: true },
    { day: "Friday", open: "10:00 AM", close: "08:00 PM", isOpen: true },
    { day: "Saturday", open: "10:00 AM", close: "09:00 PM", isOpen: true },
    { day: "Sunday", open: "10:00 AM", close: "09:00 PM", isOpen: true },
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        
        if (data.salonName) {
          setGeneralSettings({
            salonName: data.salonName || generalSettings.salonName,
            phone: data.phone || generalSettings.phone,
            email: data.email || generalSettings.email,
            address: data.address || generalSettings.address,
            currency: data.currency || generalSettings.currency,
          });
        }
        
        if (data.businessHours) {
          try {
            const parsedHours = JSON.parse(data.businessHours);
            if (Array.isArray(parsedHours) && parsedHours.length === 7) {
              setBusinessHours(parsedHours);
            }
          } catch (e) {
            console.error("Failed to parse business hours from DB", e);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const body = {
        ...generalSettings,
        businessHours: JSON.stringify(businessHours)
      };
      
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("An error occurred while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your salon's configuration and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {[
              { id: "general", label: "General", icon: Store },
              { id: "hours", label: "Business Hours", icon: Clock },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Security", icon: Shield },
              { id: "integrations", label: "Integrations", icon: Smartphone },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${
                  activeTab === tab.id
                    ? "bg-amber-100 text-amber-900"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-amber-600" : "text-neutral-400"}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSave}>
              {activeTab === "general" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-neutral-900 border-b border-neutral-100 pb-4">General Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Salon Name</label>
                      <input 
                        type="text" 
                        value={generalSettings.salonName}
                        onChange={(e) => setGeneralSettings({...generalSettings, salonName: e.target.value})}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Currency</label>
                      <select 
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                      >
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Phone Number</label>
                      <input 
                        type="tel" 
                        value={generalSettings.phone}
                        onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Email Address</label>
                      <input 
                        type="email" 
                        value={generalSettings.email}
                        onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-neutral-700">Address</label>
                      <textarea 
                        rows={3}
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "hours" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-neutral-900 border-b border-neutral-100 pb-4">Business Hours</h2>
                  
                  <div className="space-y-4">
                    {businessHours.map((day, index) => (
                      <div key={day.day} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <div className="flex items-center gap-4 w-1/3">
                          <input 
                            type="checkbox" 
                            checked={day.isOpen}
                            onChange={(e) => {
                              const newHours = [...businessHours];
                              newHours[index].isOpen = e.target.checked;
                              setBusinessHours(newHours);
                            }}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 rounded"
                          />
                          <span className="font-medium text-neutral-900">{day.day}</span>
                        </div>
                        <div className="flex items-center gap-3 w-2/3 justify-end">
                          <input 
                            type="text" 
                            value={day.open}
                            disabled={!day.isOpen}
                            onChange={(e) => {
                              const newHours = [...businessHours];
                              newHours[index].open = e.target.value;
                              setBusinessHours(newHours);
                            }}
                            className="w-28 px-3 py-1.5 text-sm bg-white border border-neutral-200 rounded-md disabled:opacity-50"
                          />
                          <span className="text-neutral-400">to</span>
                          <input 
                            type="text" 
                            value={day.close}
                            disabled={!day.isOpen}
                            onChange={(e) => {
                              const newHours = [...businessHours];
                              newHours[index].close = e.target.value;
                              setBusinessHours(newHours);
                            }}
                            className="w-28 px-3 py-1.5 text-sm bg-white border border-neutral-200 rounded-md disabled:opacity-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab !== "general" && activeTab !== "hours" && (
                <div className="py-12 text-center text-neutral-500 animate-in fade-in duration-300">
                  This section is currently under development.
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
