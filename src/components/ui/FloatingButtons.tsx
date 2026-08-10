"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function FloatingButtons() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 p-2.5 bg-cream/70 dark:bg-[#1C1917]/70 backdrop-blur-xl border border-gold/20 dark:border-gold/10 rounded-full shadow-[0_8px_30px_rgba(221,149,70,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Instagram */}
      <a
        href="https://www.instagram.com/the_11_salon/"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative h-12 w-12 rounded-full flex items-center justify-center text-brown-dark dark:text-cream hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
        aria-label="Instagram"
      >
        <FaInstagram size={22} className="relative z-10" />
      </a>

      {/* Call */}
      <a
        href="tel:+917447488880"
        className="group relative h-12 w-12 rounded-full flex items-center justify-center text-brown-dark dark:text-cream hover:bg-gold hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
        aria-label="Call Us"
      >
        <Phone size={22} className="relative z-10" />
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/917447488880"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative h-12 w-12 rounded-full flex items-center justify-center text-brown-dark dark:text-cream hover:bg-[#25D366] hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
        aria-label="WhatsApp Us"
      >
        <MessageCircle size={24} className="relative z-10" />
      </a>
    </motion.div>
  );
}

