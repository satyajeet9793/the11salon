"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 bg-cream">
      {/* Header */}
      <div className="relative py-24 bg-beige border-b border-brown-dark/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/uploaded/media__1780631028665.jpg"
            alt="The 11 Salon Interior"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-beige to-transparent" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif text-ochre mb-6">
            About <span className="text-gold">The 11</span> Salon
          </h1>
          <p className="text-brown-light max-w-2xl mx-auto text-lg font-medium">
            A sanctuary of luxury, beauty, and relaxation in Kolhapur.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-serif text-[#CE8118] mb-6">Our Story</h2>
            <p className="text-brown-dark text-lg leading-relaxed mb-6 font-serif">
              Welcome to <strong>The 11 Professional Family Salon</strong>, where passion meets precision. Founded with a vision to redefine the salon experience in Kolhapur, we have curated a space that radiates luxury, warmth, and professionalism.
            </p>
            <p className="text-brown-dark text-lg leading-relaxed font-serif">
              Our mission is simple: to transform your style and elevate your confidence. From world-class haircuts to rejuvenating spas, flawless makeup, and advanced skin care, we bring the latest trends and techniques to you, ensuring every visit leaves you feeling your absolute best.
            </p>
          </div>
          
          <div className="lg:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden h-64 relative shadow-md border border-brown-dark/5">
                <Image src="/images/uploaded/media__1780631013955.jpg" alt="Storefront" fill className="object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden h-64 relative shadow-md border border-brown-dark/5 mt-8">
                <Image src="/images/uploaded/media__1780631034616.jpg" alt="Staff Member" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Philosophy */}
      <section className="bg-beige border-y border-brown-dark/5 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center text-ochre mb-16">Our Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: "Premium Quality", desc: "We use only the finest, authentic products to ensure the best results without compromising hair and skin health." },
              { title: "Expert Artisans", desc: "Our team consists of highly trained professionals who treat styling and makeup as an art form." },
              { title: "Luxury Experience", desc: "Every aspect of our salon, from the ambient lighting to the comfortable seating, is designed for your ultimate relaxation." }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 rounded-xl text-brown-dark border border-gold/20">
                <div className="h-12 w-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-serif font-bold">{i + 1}</div>
                <h3 className="text-xl font-bold mb-4 font-serif">{item.title}</h3>
                <p className="text-brown-light font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
