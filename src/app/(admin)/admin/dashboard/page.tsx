"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  CalendarDays, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  X,
  Loader2,
  Trash2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
  const [timeSpan, setTimeSpan] = useState('today');
  const [stats, setStats] = useState({
    revenue: 0,
    customers: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    performance: "0%",
    chartData: [],
    upcomingAppointments: [],
    expiringMemberships: [],
    loading: true
  });

  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState("");
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [drillDownType, setDrillDownType] = useState<'REVENUE' | 'PENDING' | 'COMPLETED' | 'CUSTOMERS'>('REVENUE');

  const fetchDashboard = async () => {
    setStats(prev => ({ ...prev, loading: true }));
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/admin/dashboard?timeSpan=${timeSpan}&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          ...data,
          loading: false
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeSpan]);

  // Click handler for Charts (Specific Time Range)
  const handleChartClick = async (data: any, type: 'REVENUE' | 'COMPLETED') => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    const payload = data.activePayload[0].payload;
    if (!payload.dateStart || !payload.dateEnd) return;
    
    setDrillDownType(type);
    setDrillDownTitle(`Report: ${payload.name}`);
    setShowDrillDown(true);
    setIsDrillDownLoading(true);

    try {
      const res = await fetch(`/api/admin/dashboard/details?start=${payload.dateStart}&end=${payload.dateEnd}`);
      if (res.ok) {
        const details = await res.json();
        setDrillDownData(details);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrillDownLoading(false);
    }
  };

  // Click handler for Stat Cards (Entire current TimeSpan)
  const handleCardClick = async (type: 'REVENUE' | 'PENDING' | 'COMPLETED' | 'CUSTOMERS', title: string) => {
    setDrillDownType(type);
    setDrillDownTitle(`${title} (${timeSpanLabels[timeSpan]})`);
    setShowDrillDown(true);
    setIsDrillDownLoading(true);

    try {
      const res = await fetch(`/api/admin/dashboard/details?timeSpan=${timeSpan}`);
      if (res.ok) {
        const details = await res.json();
        setDrillDownData(details);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrillDownLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string, type: 'INVOICE' | 'APPOINTMENT' | 'CUSTOMER') => {
    if (!confirm(`Are you sure you want to completely delete this ${type.toLowerCase()}? This cannot be undone.`)) return;
    
    let endpoint = "";
    if (type === 'INVOICE') endpoint = `/api/admin/invoices/${id}`;
    if (type === 'APPOINTMENT') endpoint = `/api/admin/appointments/${id}`;
    if (type === 'CUSTOMER') endpoint = `/api/admin/customers/${id}`;

    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        // Optimistically remove from modal table
        if (drillDownData) {
          if (type === 'INVOICE') {
            setDrillDownData({ ...drillDownData, invoices: drillDownData.invoices.filter((i: any) => i.id !== id) });
          } else if (type === 'APPOINTMENT') {
            setDrillDownData({ 
              ...drillDownData, 
              pendingAppointments: drillDownData.pendingAppointments?.filter((a: any) => a.id !== id),
              completedAppointments: drillDownData.completedAppointments?.filter((a: any) => a.id !== id)
            });
          } else if (type === 'CUSTOMER') {
            setDrillDownData({ ...drillDownData, newCustomers: drillDownData.newCustomers?.filter((c: any) => c.id !== id) });
          }
        }
        // Immediately refresh the background dashboard stats to stay in sync
        fetchDashboard();
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    }
  };

  const timeSpanLabels: Record<string, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    '6months': "Last 6 Months"
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back. Here's what's happening {timeSpanLabels[timeSpan].toLowerCase()}.</p>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm flex overflow-hidden">
          {['today', 'week', 'month', '6months'].map((span) => (
            <button
              key={span}
              onClick={() => setTimeSpan(span)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                timeSpan === span 
                  ? 'bg-amber-500 text-white' 
                  : 'text-neutral-600 hover:bg-neutral-50'
              } ${span !== '6months' ? 'border-r border-neutral-200' : ''}`}
            >
              {timeSpanLabels[span]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenue" 
          value={`₹${stats.revenue.toLocaleString()}`} 
          icon={CreditCard} 
          trend={timeSpanLabels[timeSpan]} 
          isPositive={true}
          loading={stats.loading}
          onClick={() => handleCardClick('REVENUE', 'Total Revenue')}
        />
        <StatCard 
          title="Pending Appointments" 
          value={stats.pendingAppointments} 
          icon={CalendarDays} 
          trend={timeSpanLabels[timeSpan]} 
          isPositive={true}
          loading={stats.loading}
          onClick={() => handleCardClick('PENDING', 'Pending Appointments')}
        />
        <StatCard 
          title="Completed Appointments" 
          value={stats.completedAppointments} 
          icon={CalendarDays} 
          trend={timeSpanLabels[timeSpan]} 
          isPositive={true}
          loading={stats.loading}
          onClick={() => handleCardClick('COMPLETED', 'Completed Appointments')}
        />
        <StatCard 
          title="New Customers" 
          value={stats.customers} 
          icon={Users} 
          trend={timeSpanLabels[timeSpan]} 
          isPositive={true}
          loading={stats.loading}
          onClick={() => handleCardClick('CUSTOMERS', 'New Customers')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advanced Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative group">
          <h3 className="text-lg font-semibold mb-1 text-neutral-900">Revenue Overview</h3>
          <p className="text-xs text-neutral-500 mb-4">Click any bar for a detailed invoice breakdown.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} onClick={(data) => handleChartClick(data, 'REVENUE')} style={{cursor: 'pointer'}}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{fill: '#fef3c7'}}
                  contentStyle={{borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="url(#colorRev)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Advanced Appointments Chart */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative group">
          <h3 className="text-lg font-semibold mb-1 text-neutral-900">Appointments Trend</h3>
          <p className="text-xs text-neutral-500 mb-4">Click any point for a detailed appointment breakdown.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} onClick={(data) => handleChartClick(data, 'COMPLETED')} style={{cursor: 'pointer'}}>
                <defs>
                  <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} dx={-10} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="appointments" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#colorAppt)" activeDot={{r: 8, fill: '#d97706', stroke: '#fff', strokeWidth: 2}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Upcoming Appointments</h3>
            <Link href="/admin/appointments" className="text-sm text-amber-600 font-medium hover:text-amber-700">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {stats.loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">Loading appointments...</td>
                  </tr>
                ) : stats.upcomingAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">No upcoming appointments today.</td>
                  </tr>
                ) : (
                  stats.upcomingAppointments.map((apt: any) => (
                    <tr key={apt.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{apt.customer?.name}</div>
                        <div className="text-neutral-500 text-xs">{apt.customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-700">{apt.service?.name}</td>
                      <td className="px-6 py-4 text-neutral-700">{apt.timeSlot}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <Crown className="h-5 w-5 text-amber-500 mr-2" />
              Expiring Memberships
            </h3>
            <Link href="/admin/memberships" className="text-sm text-amber-600 font-medium hover:text-amber-700">Manage All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Member</th>
                  <th className="px-6 py-3 font-medium">End Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {stats.loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">Loading memberships...</td>
                  </tr>
                ) : !stats.expiringMemberships || stats.expiringMemberships.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">No expiring memberships.</td>
                  </tr>
                ) : (
                  stats.expiringMemberships.map((member: any) => {
                    const daysLeft = differenceInDays(new Date(member.membershipEndDate), new Date());
                    const isExpired = daysLeft < 0;
                    return (
                      <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-neutral-900">{member.name}</div>
                          <div className="text-neutral-500 text-xs">{member.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-neutral-700">
                          {format(new Date(member.membershipEndDate), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                            {isExpired ? 'Expired' : `${daysLeft} days left`}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drill Down Modal */}
      {showDrillDown && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{drillDownTitle}</h2>
                <p className="text-sm text-neutral-500 mt-1">Detailed Data Breakdown</p>
              </div>
              <button 
                onClick={() => setShowDrillDown(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {isDrillDownLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-amber-500" />
                  <p>Loading precise historical data...</p>
                </div>
              ) : drillDownType === 'REVENUE' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Invoice ID</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Service</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {!drillDownData?.invoices || drillDownData.invoices.length === 0 ? (
                        <tr><td colSpan={6} className="py-8 text-center text-neutral-500">No revenue generated in this period.</td></tr>
                      ) : (
                        drillDownData.invoices.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-neutral-50 group/row transition-colors">
                            <td className="px-4 py-3 text-neutral-900">{format(new Date(inv.createdAt), "MMM d, yyyy h:mm a")}</td>
                            <td className="px-4 py-3 font-medium text-neutral-600">INV-{inv.id.substring(0,6).toUpperCase()}</td>
                            <td className="px-4 py-3 text-neutral-900">{inv.appointment?.customer?.name || "Walk-in"}</td>
                            <td className="px-4 py-3 text-neutral-600">{inv.appointment?.service?.name}</td>
                            <td className="px-4 py-3 font-bold text-amber-600 text-right">₹{inv.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleDeleteRecord(inv.id, 'INVOICE')}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100"
                                title="Delete Invoice"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : drillDownType === 'PENDING' || drillDownType === 'COMPLETED' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date & Time</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Service</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(!drillDownData || (drillDownType === 'PENDING' ? drillDownData.pendingAppointments : drillDownData.completedAppointments)?.length === 0) ? (
                        <tr><td colSpan={5} className="py-8 text-center text-neutral-500">No appointments found for this period.</td></tr>
                      ) : (
                        (drillDownType === 'PENDING' ? drillDownData.pendingAppointments : drillDownData.completedAppointments).map((apt: any) => (
                          <tr key={apt.id} className="hover:bg-neutral-50 group/row transition-colors">
                            <td className="px-4 py-3 font-medium text-neutral-900">
                              {format(new Date(apt.date), "MMM d, yyyy")} at {apt.timeSlot}
                            </td>
                            <td className="px-4 py-3 text-neutral-900">{apt.customer?.name}</td>
                            <td className="px-4 py-3 text-neutral-600">{apt.service?.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleDeleteRecord(apt.id, 'APPOINTMENT')}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100"
                                title="Delete Appointment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Join Date</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Member</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {!drillDownData?.newCustomers || drillDownData.newCustomers.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-neutral-500">No new customers found for this period.</td></tr>
                      ) : (
                        drillDownData.newCustomers.map((cust: any) => (
                          <tr key={cust.id} className="hover:bg-neutral-50 group/row transition-colors">
                            <td className="px-4 py-3 text-neutral-600">{format(new Date(cust.createdAt), "MMM d, yyyy")}</td>
                            <td className="px-4 py-3 font-medium text-neutral-900">{cust.name}</td>
                            <td className="px-4 py-3 text-neutral-600">{cust.phone}</td>
                            <td className="px-4 py-3">
                              {cust.isMember ? (
                                <span className="inline-flex items-center text-amber-600"><Crown className="h-4 w-4 mr-1"/> Yes</span>
                              ) : "No"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleDeleteRecord(cust.id, 'CUSTOMER')}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100"
                                title="Delete Customer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end">
               <button 
                  onClick={() => setShowDrillDown(false)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium text-sm"
                >
                  Close View
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isPositive, loading, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:border-amber-300' : ''}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Icon className="h-24 w-24 text-amber-900" />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-neutral-500 group-hover:text-amber-700 transition-colors">{title}</h3>
        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
          <Icon className="h-5 w-5 text-amber-600" />
        </div>
      </div>
      <div className="flex items-end justify-between relative z-10">
        <div>
          {loading ? (
            <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-neutral-900">{value}</p>
          )}
        </div>
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
          {trend}
        </div>
      </div>
    </div>
  );
}
