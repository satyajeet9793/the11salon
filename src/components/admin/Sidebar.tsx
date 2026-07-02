"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Briefcase, 
  Scissors, 
  FileText, 
  Settings,
  Globe,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Memberships', href: '/admin/memberships', icon: Crown },
  { name: 'Appointments', href: '/admin/appointments', icon: CalendarDays },
  { name: 'Staff', href: '/admin/staff', icon: Briefcase },
  { name: 'Services', href: '/admin/services', icon: Scissors },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 bg-beige text-brown-dark border-r border-brown-dark/10 h-screen sticky top-0">
      <div className="p-6">
        <div>
          <Image 
            src="/images/logo-hd-transparent.png" 
            alt="The 11 Professional Family Salon" 
            width={180} 
            height={60} 
            className="object-contain"
          />
        </div>
        <p className="text-xs text-brown-light/70 mt-2 uppercase tracking-widest font-bold">Management</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-gold text-cream shadow-sm" 
                  : "text-brown-light hover:bg-cream hover:text-gold"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110", isActive ? "text-cream" : "text-brown-light/70 group-hover:text-gold")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-6">
        <Link href="/" className="flex items-center justify-center px-4 py-2.5 bg-cream border border-brown-dark/10 text-brown-dark rounded-lg text-sm font-medium hover:border-gold hover:text-gold transition-colors group">
          <Globe className="h-4 w-4 mr-2 text-brown-light/70 group-hover:text-gold transition-colors" />
          View Public Website
        </Link>
      </div>

      <div className="p-4 border-t border-brown-dark/10 mt-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cream border border-brown-dark/10 shadow-sm">
          <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
            <span className="text-gold font-bold text-sm">A</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-brown-dark truncate">Admin User</p>
            <p className="text-xs text-brown-light truncate">admin@the11.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
