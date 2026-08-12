"use client";

import { useState, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, LayoutDashboard, Users, CalendarDays, Briefcase, Scissors, FileText, Settings, X, Globe, Gift, MessageCircle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetch('/api/admin/alerts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(console.error);

    fetch('/api/admin/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);
  }, []);

  const handleSendOffer = (phone: string, name: string) => {
    const text = `Happy Birthday ${name}! 🎉\nThe 11 Salon wishes you a fantastic day! Here is a special 20% discount on your next visit. Valid for this week!`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDismissNotif = async (id: string) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      setNotifications(prev => prev.filter((n: any) => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const totalNotifs = alerts.length + notifications.length;

  return (
    <>
      <header className="h-16 bg-beige border-b border-brown-dark/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4 flex-1">
          <button 
            className="md:hidden p-2 text-brown-dark hover:bg-cream rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown-light/70" />
            <input 
              type="text" 
              placeholder="Search customers, appointments..." 
              className="w-full pl-10 pr-4 py-2 bg-cream border border-brown-dark/5 rounded-lg text-sm text-brown-dark placeholder-brown-light/50 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-brown-dark hover:bg-cream rounded-full transition-colors"
            >
              <Bell className="h-5 w-5" />
              {totalNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold border border-beige"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-cream rounded-xl shadow-lg border border-brown-dark/10 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-4 border-b border-brown-dark/10 bg-beige flex justify-between items-center">
                  <h3 className="font-semibold text-brown-dark font-serif">Notifications</h3>
                  {totalNotifs > 0 && (
                    <span className="text-xs font-medium bg-gold text-cream px-2 py-0.5 rounded-full">
                      {totalNotifs} New
                    </span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {totalNotifs === 0 ? (
                    <div className="p-8 text-center text-brown-light/70 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-brown-dark/5">
                      {notifications.map((notif: any) => (
                        <div key={notif.id} className="p-4 hover:bg-beige/50 transition-colors">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0 mt-1">
                              <CalendarDays className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-brown-dark">New Booking</p>
                              <p className="text-xs text-brown-light mt-1">{notif.content}</p>
                              <button 
                                onClick={() => handleDismissNotif(notif.id)}
                                className="mt-2 inline-flex items-center text-xs font-bold text-brown-light hover:text-brown-dark bg-brown-dark/5 hover:bg-brown-dark/10 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {alerts.map((alert: any) => (
                        <div key={alert.id} className="p-4 hover:bg-beige/50 transition-colors">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0 mt-1">
                              {alert.type === 'BIRTHDAY' ? <Gift className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-brown-dark">{alert.title}</p>
                              <p className="text-xs text-brown-light mt-1">{alert.message}</p>
                              {alert.type === 'BIRTHDAY' ? (
                                <button 
                                  onClick={() => handleSendOffer(alert.phone, alert.name)}
                                  className="mt-2 inline-flex items-center text-xs font-bold text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Send Offer
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    const text = `Hi ${alert.name},\nYour membership at The 11 Salon is expiring soon! Renew now to keep enjoying your exclusive benefits.`;
                                    window.open(`https://wa.me/91${alert.phone}?text=${encodeURIComponent(text)}`, "_blank");
                                  }}
                                  className="mt-2 inline-flex items-center text-xs font-bold text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Send Reminder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-8 w-[1px] bg-brown-dark/10 mx-1 md:mx-2"></div>

          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-2 p-2 md:p-0 text-sm font-bold text-brown-light hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-[#0a0a0a] h-full flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
            <div className="p-4 flex items-center justify-between border-b border-neutral-800">
              <h2 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                THE 11 SALON
              </h2>
              <button onClick={() => setMobileMenuOpen(false)} className="text-neutral-400 hover:text-white p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {[
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Customers', href: '/admin/customers', icon: Users },
                { name: 'Appointments', href: '/admin/appointments', icon: CalendarDays },
                { name: 'Staff', href: '/admin/staff', icon: Briefcase },
                { name: 'Services', href: '/admin/services', icon: Scissors },
                { name: 'Invoices', href: '/admin/invoices', icon: FileText },
                { name: 'Settings', href: '/admin/settings', icon: Settings },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-neutral-800">
              <Link href="/" className="flex items-center justify-center px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg text-sm font-medium hover:text-white transition-colors">
                <Globe className="h-4 w-4 mr-2" />
                View Public Website
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
