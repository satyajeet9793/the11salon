"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const categories = ["All", "Hair", "Skin", "Nail", "Spa", "Makeup", "Mehndi"];

const galleryImages = [
  { id: 12, src: "/images/gallery/hair-1.jpg", category: "Hair", alt: "Beautiful Hair Styling and Highlights" },
  { id: 13, src: "/images/gallery/hair-2.jpg", category: "Hair", alt: "Elegant Floral Hair Braid" },
  { id: 2, src: "/images/gallery/skin.png", category: "Skin", alt: "Facial Skin Treatment" },
  { id: 3, src: "/images/gallery/nail-art-1.jpg", category: "Nail", alt: "Elegant Nail Art Manicure" },
  { id: 7, src: "/images/gallery/nail-art-2.jpg", category: "Nail", alt: "Beautiful Red Nail Art" },
  { id: 4, src: "/images/gallery/spa.png", category: "Spa", alt: "Relaxing Luxury Spa" },
  { id: 8, src: "/images/gallery/makeup-1.jpg", category: "Makeup", alt: "Beautiful Bridal Makeup" },
  { id: 9, src: "/images/gallery/makeup-2.jpg", category: "Makeup", alt: "Glamorous Makeup Look" },
  { id: 10, src: "/images/gallery/makeup-3.jpg", category: "Makeup", alt: "Elegant Traditional Makeup" },
  { id: 11, src: "/images/gallery/makeup-4.jpg", category: "Makeup", alt: "Stunning Makeup Artistry" },
  { id: 14, src: "/images/gallery/mehndi-1.png", category: "Mehndi", alt: "Traditional Indian Mehndi Design" },
  { id: 15, src: "/images/gallery/mehndi-2.png", category: "Mehndi", alt: "Intricate Bridal Mehndi Hand" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredImages = galleryImages.filter(
    (img) => activeCategory === "All" || img.category === activeCategory || (activeCategory === "Transformations" && img.category === "Transformations")
  );

  return (
    <div className="min-h-screen pt-24 bg-cream">
      {/* Header */}
      <div className="relative py-16 bg-beige border-b border-brown-dark/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-ochre mb-4">
            Our <span className="text-gold">Gallery</span>
          </h1>
          <p className="text-brown-light max-w-2xl mx-auto font-medium">
            A visual journey of our artistic creations and luxury transformations.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm uppercase tracking-wider font-bold transition-all border ${
                activeCategory === cat
                  ? "bg-gold border-gold text-cream shadow-sm"
                  : "bg-transparent border-brown-dark/20 text-brown-light hover:border-gold hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="relative h-80 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-brown-dark/5"
              onClick={() => setSelectedImage(img.src)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-cream/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                <span className="text-brown-dark font-serif text-xl border border-brown-dark px-6 py-2 rounded-full font-bold">View</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-brown-dark/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-cream hover:text-gold transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div
            className="relative w-full max-w-5xl h-[80vh] rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={selectedImage} alt="Fullscreen View" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
