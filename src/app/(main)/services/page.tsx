"use client";

import { useState, useEffect, useMemo } from "react";
import { Scissors, Clock, Loader2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category));
    return ["All", ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-[#Fdfbf7]">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
             <div className="h-16 w-16 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 rounded-2xl flex items-center justify-center transform rotate-12 shadow-sm border border-amber-300/30">
              <Scissors className="h-8 w-8 -rotate-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">Our Menu</h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto font-medium">
            Explore our curated selection of premium salon and spa services.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-8 sticky top-20 z-40 bg-[#Fdfbf7]/80 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for a service... (e.g. Haircut, Facial)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-lg font-medium"
            />
          </div>

          <div className="flex flex-nowrap overflow-x-auto pb-2 -mb-2 gap-3 justify-start sm:justify-center no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-neutral-900 text-white shadow-md scale-105"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 shadow-sm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Service Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
            <p className="text-neutral-400 font-medium animate-pulse">Loading premium services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <Search className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-1">No services found</h3>
            <p className="text-neutral-500">Try adjusting your search or category filter.</p>
            <button 
              onClick={() => {setSearchQuery(""); setSelectedCategory("All");}}
              className="mt-6 text-amber-600 font-medium hover:text-amber-700 underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredServices.map((service) => (
              <div 
                key={service.id} 
                className="group relative bg-white rounded-3xl p-6 border border-neutral-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:border-amber-200/60 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg tracking-wider uppercase">
                      {service.category}
                    </span>
                    <span className="flex items-center text-neutral-500 text-sm font-medium bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-100">
                      <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                      {service.duration}m
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 leading-tight group-hover:text-amber-700 transition-colors">
                    {service.name}
                  </h3>
                  
                  {service.description && (
                    <p className="text-neutral-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-neutral-100 mt-auto relative z-10">
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-400 font-medium mb-0.5">Price</span>
                    <span className="text-2xl font-black text-neutral-900 tracking-tight">
                      ₹{service.price}
                    </span>
                  </div>
                  <Link 
                    href="/booking" 
                    className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-md"
                  >
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Global styling for hide scrollbar in category pills */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
