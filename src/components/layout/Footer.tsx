import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  let settingsObject: Record<string, string> = {};
  
  try {
    const settingsRecords = await prisma.settings.findMany();
    settingsObject = settingsRecords.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Failed to fetch settings for footer:", error);
  }

  const phone = settingsObject.phone || "+91 74474 88880";
  const email = settingsObject.email || "the11.kolhapur@gmail.com";
  const address = settingsObject.address || "Kolhapur, Maharashtra, India";
  
  // Default hours fallback
  let businessHours = [
    { day: "Mon - Sat", open: "9:00 AM", close: "9:00 PM", isOpen: true },
    { day: "Sunday", open: "10:00 AM", close: "8:00 PM", isOpen: true }
  ];

  if (settingsObject.businessHours) {
    try {
      const parsedHours = JSON.parse(settingsObject.businessHours);
      if (Array.isArray(parsedHours)) {
        businessHours = parsedHours.filter(h => h.isOpen);
      }
    } catch(e) {}
  }

  const phoneLink = phone.replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-beige border-t border-brown-dark/10 pt-16 pb-8 text-brown-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image 
                src="/images/user-logo-transparent.png" 
                alt="The 11 Professional Family Salon" 
                width={200} 
                height={80} 
                className="object-contain h-[75px] w-auto origin-left transition-all duration-300 ease-out hover:scale-105 hover:opacity-90"
              />
            </Link>
            <p className="text-brown-light leading-relaxed mb-6 font-medium">
              Transform Your Style. Elevate Your Confidence. Premium luxury family salon located in the heart of Kolhapur.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/the_11_salon/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-brown-dark/5 flex items-center justify-center text-brown-dark hover:bg-gold hover:text-cream transition-all">
                <FaInstagram size={20} />
              </a>
              <a href={`https://wa.me/${phoneLink.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-brown-dark/5 flex items-center justify-center text-brown-dark hover:bg-[#25D366] hover:text-white transition-all">
                <FaWhatsapp size={20} />
              </a>
              <a href="https://www.google.com/maps/search/The+11+Takala+Chowk+Kolhapur" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-brown-dark/5 flex items-center justify-center text-brown-dark hover:bg-[#EA4335] hover:text-white transition-all">
                <FaMapMarkerAlt size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Quick Links</h4>
            <ul className="space-y-4">
              {['About', 'Services', 'Gallery', 'Testimonials', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-brown-light font-medium hover:text-gold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Contact Us</h4>
            <ul className="space-y-4 text-brown-light font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="text-gold shrink-0 mt-1" size={18} />
                <a href="https://www.google.com/maps/search/The+11+Takala+Chowk+Kolhapur" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  {address}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-gold shrink-0" size={18} />
                <a href={`tel:${phoneLink}`} className="hover:text-gold transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-gold shrink-0" size={18} />
                <a href={`mailto:${email}`} className="hover:text-gold transition-colors">{email}</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Working Hours</h4>
            <ul className="space-y-4 text-brown-light font-medium">
              {businessHours.length > 0 ? businessHours.map((hour: any, idx: number) => (
                <li key={idx} className="flex justify-between border-b border-brown-dark/10 pb-2">
                  <span>{hour.day}</span>
                  <span>{hour.open} - {hour.close}</span>
                </li>
              )) : (
                <li>Contact us for timings</li>
              )}
            </ul>
            <div className="mt-6">
              <Link href="/booking" className="inline-block border border-gold text-gold hover:bg-gold hover:text-cream px-6 py-2 rounded transition-colors uppercase tracking-wider text-sm font-bold shadow-sm">
                Book Appointment
              </Link>
            </div>
          </div>

        </div>

        <div className="border-t border-brown-dark/10 pt-8 flex flex-col md:flex-row justify-between items-center text-brown-light text-sm font-medium gap-4">
          <p>&copy; {new Date().getFullYear()} The 11 Professional Family Salon. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
