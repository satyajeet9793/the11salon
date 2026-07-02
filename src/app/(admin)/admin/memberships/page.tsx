"use client";

import { useState, useEffect } from "react";
import { Search, Crown, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function MembershipsPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        // Filter only members
        const activeMembers = data.filter((c: any) => c.isMember);
        setMembers(activeMembers);
      }
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipStatus = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const daysLeft = differenceInDays(end, today);

    if (daysLeft < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired ({Math.abs(daysLeft)} days ago)
        </span>
      );
    } else if (daysLeft <= 30) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expiring Soon ({daysLeft} days)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center">
            <Crown className="h-8 w-8 text-amber-500 mr-3" />
            Memberships
          </h1>
          <p className="text-neutral-500 mt-1">Manage active memberships and track upcoming renewals.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search members by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-medium">Member Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Start Date</th>
                <th className="px-6 py-4 font-medium">End Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading memberships...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No active memberships found.</td>
                </tr>
              ) : (
                members.map((member: any) => (
                  <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold mr-3">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-neutral-900">{member.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">{member.phone}</td>
                    <td className="px-6 py-4 font-medium text-neutral-800">
                      {member.membershipYears} Year{member.membershipYears > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {member.membershipStartDate ? format(new Date(member.membershipStartDate), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-medium">
                      {member.membershipEndDate ? format(new Date(member.membershipEndDate), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {getMembershipStatus(member.membershipEndDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
