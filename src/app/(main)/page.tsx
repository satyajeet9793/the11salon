"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-cream">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/uploaded/storefront-hero.png"
            alt="The 11 Salon Storefront"
            fill
            className="object-cover opacity-50 blur-lg scale-105"
            priority
          />
          <div className="absolute inset-0 bg-cream/50 dark:bg-background/70 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream dark:from-background via-cream/80 dark:via-background/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-[#CE8118] mb-6 leading-tight"
          >
            Transform Your Style. <br />
            <span className="text-gold italic">Elevate Your Confidence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg md:text-xl text-brown-light mb-10 tracking-widest uppercase text-xs md:text-sm font-semibold"
          >
            Hair | Skin | Nail | Spa | Makeup | Mehndi
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/booking"
              onMouseMove={handleMouseMove}
              className="group relative overflow-hidden bg-gold text-cream px-8 py-4 rounded font-semibold uppercase tracking-wider hover:bg-gold-dark transition-all transform hover:scale-105 shadow-md"
            >
              <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.4), transparent 40%)" }} />
              <span className="relative z-10">Book Appointment</span>
            </Link>
            <a
              href="https://wa.me/917447488880"
              target="_blank"
              rel="noopener noreferrer"
              onMouseMove={handleMouseMove}
              className="group relative overflow-hidden bg-transparent border border-brown-light text-brown-dark px-8 py-4 rounded font-semibold uppercase tracking-wider hover:bg-brown-dark hover:text-cream transition-all transform hover:scale-105"
            >
              <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), rgba(221,149,70,0.3), transparent 40%)" }} />
              <span className="relative z-10">WhatsApp Now</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 bg-beige border-t border-brown-dark/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#CE8118] mb-4">Our Premium Services</h2>
            <p className="text-brown-light max-w-2xl mx-auto">
              Experience world-class treatments tailored to your unique beauty needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Hair Styling & Spa",
                desc: "From classic cuts to keratin treatments and luxurious hair spas.",
                img: "/images/gallery/hair-1.jpg",
              },
              {
                title: "Skin & Beauty",
                desc: "Rejuvenating facials, cleanups, and advanced skin care routines.",
                img: "/images/gallery/skin.png",
              },
              {
                title: "Bridal & Makeup",
                desc: "Flawless makeup for weddings, engagements, and special events.",
                img: "/images/gallery/makeup-1.jpg",
              },
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onMouseMove={handleMouseMove}
                className="relative bg-cream rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gold/10 group cursor-pointer flex flex-col"
              >
                <div className="pointer-events-none absolute -inset-px z-10 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(221,149,70,0.15), transparent 40%)" }} />
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between relative z-20">
                  <div>
                    <h3 className="text-2xl font-serif text-[#CE8118] mb-3">{service.title}</h3>
                    <p className="text-brown-light mb-6 font-medium leading-relaxed">{service.desc}</p>
                  </div>
                  <Link href="/services" className="inline-flex items-center text-gold uppercase tracking-widest text-sm font-bold group-hover:text-brown-dark transition-colors">
                    Explore <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-cream border-y border-brown-dark/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent opacity-50 dark:opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <div 
                className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-xl border border-brown-dark/10 group"
                onMouseMove={handleMouseMove}
              >
                <div className="pointer-events-none absolute -inset-px z-10 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.2), transparent 40%)" }} />
                <Image
                  src="/images/uploaded/media__1780631013955.jpg"
                  alt="The 11 Salon Storefront"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-4xl font-serif text-[#CE8118] mb-6">Why Choose The 11 Salon?</h2>
              <p className="text-brown-dark text-lg mb-8 leading-relaxed font-serif">
                At The 11 Professional Family Salon, we don't just provide services; we craft experiences. From our luxurious ambiance to our expert stylists, every detail is designed to make you feel like royalty.
              </p>
              <ul className="space-y-4">
                {[
                  "Highly trained professional stylists",
                  "Premium, authentic beauty products",
                  "Luxurious and relaxing ambiance",
                  "Advanced online booking system",
                  "Strict hygiene protocols"
                ].map((item, i) => (
                  <li 
                    key={i}
                    className="flex items-center gap-3 text-brown-light font-medium group cursor-default transition-all duration-300 hover:translate-x-2 hover:text-gold"
                  >
                    <span className="h-2 w-2 bg-gold rounded-full group-hover:scale-150 transition-transform duration-300 shadow-[0_0_8px_rgba(221,149,70,0.8)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
