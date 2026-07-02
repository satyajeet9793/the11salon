# The 11 Professional Family Salon

Welcome to the official repository for **The 11 Professional Family Salon**. This is a premium, full-stack web application built to serve as a luxurious digital storefront and an advanced business management dashboard for the salon.

## Core Features

- **Public Storefront:** A fully responsive, beautifully designed UI for showcasing salon services, a dynamic photo gallery, customer testimonials, and an interactive booking system.
- **Admin Dashboard:** A secured management portal to handle all daily salon operations.
- **Appointment Management:** Real-time scheduling, waitlist tracking, and status updates (Pending, Booked, Checked-in, Completed).
- **Billing & Invoicing:** Integrated automated invoice generation with custom PDF downloads.
- **Customer CRM:** Track client visits, manage memberships, and automatically receive alerts for upcoming customer birthdays or expiring memberships.
- **Staff & Service Management:** Easily add new services, adjust pricing, and track staff schedules and performance.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes, NextAuth for secure admin authentication
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Deployment:** Vercel (Recommended)

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm installed on your machine. You will also need access to a PostgreSQL database connection string.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/satyajeet9793/the11salon.git
   cd the11salon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your database and authentication credentials:
   ```env
   DATABASE_URL="your-postgres-url"
   DIRECT_URL="your-direct-postgres-url"
   NEXTAUTH_SECRET="a-secure-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the Database:**
   Push the schema to your database to set up all tables:
   ```bash
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live public site. 
The admin portal is securely accessible via `/admin/login`.

## Contact & Support

For any technical queries or deployment assistance, please refer to the internal development team documentation or contact the repository administrator.

---
*Designed & developed exclusively for The 11 Professional Family Salon.*
