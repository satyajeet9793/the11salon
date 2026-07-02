"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Instagram */}
      <motion.a
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        href="https://www.instagram.com/the_11_salon/"
        target="_blank"
        rel="noopener noreferrer"
        className="h-12 w-12 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Instagram"
      >
        <FaInstagram size={24} />
      </motion.a>

      {/* Call */}
      <motion.a
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        href="tel:+917447488880"
        className="h-12 w-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Call Us"
      >
        <Phone size={24} />
      </motion.a>

      {/* WhatsApp */}
      <motion.a
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        href="https://wa.me/917447488880"
        target="_blank"
        rel="noopener noreferrer"
        className="h-14 w-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        aria-label="WhatsApp Us"
      >
        <MessageCircle size={32} />
      </motion.a>
    </div>
  );
}
