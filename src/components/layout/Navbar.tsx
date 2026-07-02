"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Gallery", href: "/gallery" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-200 ${
          isScrolled ? "bg-cream/90 backdrop-blur-md shadow-sm border-b border-brown-dark/5 py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50">
            <Image 
              src="/images/user-logo-transparent.png" 
              alt="The 11 Professional Family Salon" 
              width={260} 
              height={100} 
              className="object-contain h-[85px] md:h-[110px] w-auto origin-left transition-all duration-300 ease-out hover:scale-105 hover:opacity-90"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm uppercase tracking-widest hover:text-gold transition-colors font-semibold ${
                  pathname === link.href ? "text-gold" : "text-brown-dark"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 z-50">
            <Link
              href="/admin/login"
              className="text-sm uppercase tracking-widest text-brown-dark hover:text-gold transition-colors font-bold"
            >
              Admin
            </Link>
            <Link
              href="/booking"
              className="bg-gold text-cream px-6 py-2.5 rounded hover:bg-gold-dark transition-colors uppercase tracking-wider text-sm font-bold shadow-sm"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-brown-dark z-50 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-cream/95 backdrop-blur-xl pt-24 pb-6 px-6 flex flex-col justify-between lg:hidden border-b border-brown-dark/10"
          >
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-serif tracking-wide ${
                    pathname === link.href ? "text-gold font-bold" : "text-brown-dark"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-4">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center border-2 border-brown-dark/20 text-brown-dark py-4 rounded uppercase tracking-wider font-bold"
              >
                Admin Portal
              </Link>
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-gold text-cream py-4 rounded uppercase tracking-wider font-bold shadow-md"
              >
                Book Appointment
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
