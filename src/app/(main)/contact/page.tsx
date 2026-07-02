"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 bg-cream">
      {/* Header */}
      <div className="relative py-16 bg-beige border-b border-brown-dark/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-ochre mb-4">
            Get In <span className="text-gold">Touch</span>
          </h1>
          <p className="text-brown-light max-w-2xl mx-auto font-medium">
            We'd love to hear from you. Book an appointment, ask a question, or simply say hello.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Contact Information */}
          <div className="lg:w-1/3 space-y-8">
            <h2 className="text-3xl font-serif text-ochre mb-8">Contact Information</h2>
            
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-brown-dark/5 rounded-full flex items-center justify-center text-gold shrink-0 border border-gold/20">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-xl text-[#CE8118] mb-1 font-serif font-bold">Location</h4>
                <p className="text-brown-light font-medium leading-relaxed">
                  <a href="https://www.google.com/maps/search/The+11+Takala+Chowk+Kolhapur" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                    Kolhapur,<br />
                    Maharashtra, India
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-brown-dark/5 rounded-full flex items-center justify-center text-gold shrink-0 border border-gold/20">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="text-xl text-[#CE8118] mb-1 font-serif font-bold">Phone</h4>
                <p className="text-brown-light font-medium">
                  <a href="tel:+917447488880" className="hover:text-gold transition-colors">+91 74474 88880</a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-brown-dark/5 rounded-full flex items-center justify-center text-gold shrink-0 border border-gold/20">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-xl text-[#CE8118] mb-1 font-serif font-bold">Email</h4>
                <p className="text-brown-light font-medium">
                  <a href="mailto:the11.kolhapur@gmail.com" className="hover:text-gold transition-colors">the11.kolhapur@gmail.com</a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-brown-dark/5 rounded-full flex items-center justify-center text-gold shrink-0 border border-gold/20">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-xl text-[#CE8118] mb-1 font-serif font-bold">Working Hours</h4>
                <p className="text-brown-light font-medium">Mon - Sat: 9:00 AM - 9:00 PM</p>
                <p className="text-brown-light font-medium">Sunday: 10:00 AM - 8:00 PM</p>
              </div>
            </div>

            <div className="pt-8 border-t border-brown-dark/10">
              <h4 className="text-xl text-[#CE8118] mb-4 font-serif font-bold">Follow Us</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/the_11_salon/" target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                  <FaInstagram size={24} />
                </a>
                <a href="https://wa.me/917447488880" target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                  <FaWhatsapp size={24} />
                </a>
                <a href="https://www.google.com/maps/search/The+11+Takala+Chowk+Kolhapur" target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-[#EA4335] rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                  <FaMapMarkerAlt size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="glass-card p-8 md:p-12 rounded-xl">
              <h2 className="text-3xl font-serif text-[#CE8118] mb-8">Send Us A Message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-brown-dark font-bold">Full Name</label>
                    <input type="text" className="w-full bg-white border border-brown-dark/10 rounded px-4 py-3 text-brown-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors shadow-sm" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-brown-dark font-bold">Phone Number</label>
                    <input type="tel" className="w-full bg-white border border-brown-dark/10 rounded px-4 py-3 text-brown-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors shadow-sm" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-brown-dark font-bold">Email Address</label>
                  <input type="email" className="w-full bg-white border border-brown-dark/10 rounded px-4 py-3 text-brown-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors shadow-sm" placeholder="johndoe@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-brown-dark font-bold">Message</label>
                  <textarea rows={5} className="w-full bg-white border border-brown-dark/10 rounded px-4 py-3 text-brown-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none shadow-sm" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="bg-gold text-cream w-full py-4 rounded font-bold uppercase tracking-wider hover:bg-gold-dark transition-colors shadow-md">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-96 bg-beige relative z-10 border-t border-brown-dark/10">
        <iframe
          src="https://maps.google.com/maps?q=The+11+Takala+Chowk+Kolhapur&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
