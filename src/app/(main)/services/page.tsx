"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Scissors, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

function AccordionItem({ category, isOpen, onToggle, services }: any) {
  return (
    <div className="border border-amber-500/20 rounded-xl overflow-hidden bg-white/40 backdrop-blur-sm shadow-sm transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
      >
        <h2 className="text-2xl font-semibold text-brown-dark">{category}</h2>
        <ChevronDown 
          className={`h-6 w-6 text-amber-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 pt-2 bg-white/60">
            <ul className="divide-y divide-amber-500/10 mb-8">
              {services.map((service: any) => (
                <li key={service.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-amber-50/30 transition-colors rounded-lg px-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-brown-dark">{service.name}</h3>
                    {service.description && (
                      <p className="text-brown-light text-sm mt-1">{service.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <span className="flex items-center text-amber-700 font-bold text-lg">
                      ₹{service.price}
                    </span>
                    <span className="flex items-center text-brown-light/70 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <Clock className="h-3 w-3 mr-1" />
                      {service.duration} mins
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="flex justify-center w-full pt-4 border-t border-amber-500/10">
               <Link 
                  href="/booking" 
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-full shadow-lg shadow-amber-600/30 transition-all hover:scale-105"
                >
                  Book an Appointment
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/admin/services");
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const groupedServices = services.reduce((acc: any, service: any) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {});

  const categories = Object.keys(groupedServices);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
             <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-sm">
              <Scissors className="h-8 w-8 -rotate-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brown-dark">Our Menu</h1>
          <p className="text-lg text-brown-light max-w-2xl mx-auto">
            Explore our curated selection of premium salon and spa services.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-brown-light bg-white/40 rounded-xl border border-amber-200">
            No services available at the moment. Please check back later.
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category, index) => (
              <AccordionItem 
                key={category}
                category={category}
                services={groupedServices[category]}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
