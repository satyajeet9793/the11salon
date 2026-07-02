"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sneha Patil",
    rating: 5,
    text: "Absolutely stunning service! I got my bridal makeup done here and the staff was extremely professional. The ambiance is top-notch and the products they use are premium.",
  },
  {
    id: 2,
    name: "Rahul Deshmukh",
    rating: 5,
    text: "Best haircut and beard styling I've had in Kolhapur. The stylists really know what they are doing. Very hygienic and clean salon.",
  },
  {
    id: 3,
    name: "Pooja Sharma",
    rating: 4,
    text: "Had a great hair spa experience. The massage was very relaxing and my hair feels incredibly soft. Would definitely recommend The 11 Salon to my friends.",
  },
  {
    id: 4,
    name: "Neha Kadam",
    rating: 5,
    text: "I went in for a keratin treatment and the results are amazing. The staff was very polite and explained the entire process. Pricing is also very reasonable for the luxury experience.",
  },
  {
    id: 5,
    name: "Aditya Jadhav",
    rating: 5,
    text: "Very premium vibe. It's truly a family salon where I can take my kids for haircuts too. The staff handles kids with great care.",
  },
  {
    id: 6,
    name: "Simran Kaur",
    rating: 4,
    text: "Loved the nail art and manicure. The attention to detail is commendable. Will be visiting again soon for a facial.",
  }
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen pt-24 bg-cream">
      {/* Header */}
      <div className="relative py-16 bg-beige border-b border-brown-dark/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-ochre mb-4">
            Client <span className="text-gold">Testimonials</span>
          </h1>
          <p className="text-brown-light max-w-2xl mx-auto font-medium">
            Hear what our beautiful clients have to say about their experience at The 11 Salon.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((review) => (
            <div key={review.id} className="glass-card p-8 rounded-xl border border-gold/10 hover:border-gold/30 transition-all shadow-sm hover:shadow-md">
              <div className="flex text-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < review.rating ? "fill-gold" : "text-brown-dark/20"} />
                ))}
              </div>
              <p className="text-brown-light italic mb-6 leading-relaxed">
                "{review.text}"
              </p>
              <h4 className="font-serif font-bold text-[#CE8118] text-lg">- {review.name}</h4>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-serif text-ochre mb-6">Leave a Review</h2>
          <a
            href="https://g.page/r/your-google-link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gold text-cream px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-gold-dark transition-colors shadow-md"
          >
            Review us on Google
          </a>
        </div>
      </div>
    </div>
  );
}
