"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft, Clock, MessageCircle, Search } from "lucide-react";
import { format, addDays } from "date-fns";

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  
  const [formData, setFormData] = useState({
    serviceIds: [] as string[],
    date: "",
    time: "",
    name: "",
    phone: "",
    notes: ""
  });
  
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      // In production, fetch from /api/admin/services or use action
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (formData.date && formData.serviceIds.length > 0) {
      async function loadSlots() {
        setLoadingSlots(true);
        try {
          const serviceIdsQuery = formData.serviceIds.join(',');
          const res = await fetch(`/api/booking/slots?date=${formData.date}&serviceIds=${serviceIdsQuery}`);
          if (res.ok) {
            const data = await res.json();
            setAvailableSlots(data.slots || []);
          }
        } catch (e) {
          console.error("Failed to load slots", e);
        } finally {
          setLoadingSlots(false);
        }
      }
      loadSlots();
    }
  }, [formData.date, formData.serviceIds]);

  const selectedServices = services.filter(s => formData.serviceIds.includes(s.id));

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const submitBooking = async () => {
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert("There was an error saving your booking. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 bg-cream flex items-center justify-center px-4">
        <div className="glass-card p-12 rounded-xl text-center max-w-lg w-full border border-gold/30 shadow-xl">
          <div className="flex justify-center mb-6">
            <CheckCircle2 size={80} className="text-[#25D366]" />
          </div>
          <h2 className="text-3xl font-serif text-ochre mb-4">Booking Confirmed!</h2>
          <p className="text-brown-light mb-6 font-medium">
            Your appointment for {selectedServices.map(s => s.name).join(', ')} on {formData.date} at {formData.time} has been successfully scheduled.
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-gold text-cream px-8 py-3 rounded font-bold uppercase tracking-wider hover:bg-gold-dark transition-colors shadow-md"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-cream">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className={`text-xs uppercase tracking-wider font-bold ${step >= i ? 'text-gold' : 'text-brown-dark/30'}`}>
                 Step {i}
               </div>
            ))}
          </div>
          <div className="h-2 bg-brown-dark/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gold"
              initial={{ width: "25%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="glass-card p-6 md:p-12 rounded-xl shadow-lg relative overflow-hidden min-h-[500px]">

          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl font-serif text-ochre">Select Service</h2>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-brown-dark/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/50 border border-brown-dark/10 rounded-full text-brown-dark placeholder:text-brown-dark/40 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all w-full sm:w-64"
                  />
                </div>
              </div>
              {services.length === 0 ? <p className="text-brown-light font-bold">Loading services...</p> : (
                <div className="grid sm:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).map(service => {
                    const isSelected = formData.serviceIds.includes(service.id);
                    return (
                    <div 
                      key={service.id}
                      onClick={() => {
                        let newIds = [...formData.serviceIds];
                        if (isSelected) {
                          newIds = newIds.filter(id => id !== service.id);
                        } else {
                          newIds.push(service.id);
                        }
                        setFormData({ ...formData, serviceIds: newIds, date: "", time: "" });
                      }}
                      className={`p-6 rounded-lg cursor-pointer border transition-all shadow-sm ${
                        isSelected 
                          ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                          : 'bg-white border-brown-dark/5 hover:border-gold/30'
                      }`}
                    >
                      <h4 className="text-lg font-bold font-serif text-[#CE8118] mb-2">{service.name}</h4>
                      <div className="flex justify-between text-sm text-brown-light font-bold">
                        <span>{service.duration} mins</span>
                        <span className="text-gold">₹{service.price}</span>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-serif text-ochre mb-6">Select Date</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const date = addDays(new Date(), i);
                    const dateStr = format(date, "yyyy-MM-dd");
                    const dayStr = format(date, "EEE");
                    const domStr = format(date, "d");
                    const monStr = format(date, "MMM");
                    
                    return (
                      <div 
                        key={dateStr}
                        onClick={() => setFormData({ ...formData, date: dateStr, time: "" })}
                        className={`min-w-[80px] p-4 text-center rounded-lg cursor-pointer border transition-all shadow-sm ${
                          formData.date === dateStr 
                            ? 'bg-gold border-gold text-cream font-bold' 
                            : 'bg-white border-brown-dark/5 text-brown-dark hover:border-gold/30'
                        }`}
                      >
                        <div className="text-xs uppercase font-bold text-brown-light">{monStr}</div>
                        <div className="text-2xl my-1 font-serif">{domStr}</div>
                        <div className="text-xs font-bold text-brown-light">{dayStr}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {formData.date && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl font-serif text-ochre mb-6">Select Time</h2>
                  {loadingSlots ? (
                    <p className="text-brown-light">Finding available slots...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-red-500 font-medium bg-red-50 p-4 rounded-lg">This time slot is fully booked. Please select another available time.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {availableSlots.map(slot => (
                        <div 
                          key={slot.time}
                          onClick={() => setFormData({ ...formData, time: slot.time })}
                          className={`py-3 text-center rounded-lg cursor-pointer border transition-all text-sm font-bold shadow-sm ${
                            formData.time === slot.time 
                              ? 'bg-gold border-gold text-cream' 
                              : 'bg-white border-brown-dark/5 text-brown-dark hover:border-gold/30 hover:bg-gold/5'
                          }`}
                        >
                          {slot.time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PERSONAL DETAILS */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-serif text-ochre mb-8">Your Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-brown-dark font-bold mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-brown-dark/10 rounded px-4 py-3 text-brown-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold shadow-sm" 
                    placeholder="Jane Doe" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-brown-dark font-bold mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white border border-brown-dark/10 rounded px-4 py-3 text-brown-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold shadow-sm" 
                    placeholder="+91" 
                  />
                </div>

                <div>
                  <label className="block text-sm text-brown-dark font-bold mb-2">Any Notes? (Optional)</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-white border border-brown-dark/10 rounded px-4 py-3 text-brown-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none shadow-sm" 
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & REQUEST */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-serif text-ochre mb-8">Confirm Appointment</h2>
              
              <div className="bg-white p-6 rounded-lg border border-brown-dark/5 shadow-sm space-y-4">
                <div className="flex justify-between pb-4 border-b border-brown-dark/5">
                  <span className="text-brown-light font-bold">Service</span>
                  <span className="font-bold text-brown-dark">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-brown-dark/5">
                  <span className="text-brown-light font-bold">Date & Time</span>
                  <span className="font-bold text-brown-dark">{formData.date} at {formData.time}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-brown-dark/5">
                  <span className="text-brown-light font-bold">Client</span>
                  <span className="font-bold text-brown-dark">{formData.name} ({formData.phone})</span>
                </div>
                <div className="flex justify-between pt-4 text-xl">
                  <span className="font-serif text-brown-dark font-bold">Amount</span>
                  <span className="font-serif text-gold font-bold">₹{selectedService?.price}</span>
                </div>
              </div>

              <div className="bg-gold/10 border border-gold/20 p-4 rounded text-sm text-brown-dark font-bold flex gap-3 items-center">
                <CheckCircle2 size={24} className="shrink-0 text-gold" />
                <p>By clicking confirm, your appointment will be scheduled in our system instantly.</p>
              </div>

            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button 
              onClick={handlePrev}
              className="flex items-center gap-2 text-brown-dark hover:text-gold font-bold transition-colors py-2 px-4"
            >
              <ChevronLeft size={20} /> Back
            </button>
          ) : <div></div>}
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && formData.serviceIds.length === 0) ||
                (step === 2 && (!formData.date || !formData.time)) ||
                (step === 3 && (!formData.name || !formData.phone))
              }
              className="bg-gold text-cream flex items-center gap-2 px-8 py-3 rounded font-bold uppercase tracking-wider hover:bg-gold-dark shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={submitBooking}
              className="bg-gold text-cream flex items-center justify-center gap-2 w-full sm:w-auto px-12 py-4 rounded font-bold uppercase tracking-wider hover:bg-gold-dark shadow-md transition-colors"
            >
              <CheckCircle2 size={20} /> Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
