"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Search, Plus, MessageCircle, Mail, Trash2, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    serviceId: "",
    amount: "",
    method: "CASH",
  });

  useEffect(() => {
    fetchInvoices();
    fetchDropdownData();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [resCust, resServ] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/services')
      ]);
      if (resCust.ok) setCustomers(await resCust.json());
      if (resServ.ok) setServices(await resServ.json());
    } catch (error) {
      console.error("Error fetching dropdowns", error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ customerId: "", serviceId: "", amount: "", method: "CASH" });
        setCustomerSearch("");
        fetchInvoices();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBase64ImageFromUrl = async (imageUrl: string) => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePDF = async (invoice: any) => {
    const doc = new jsPDF();
    
    // Set brand font
    doc.setFont("times", "normal");
    
    // --- Page Border ---
    doc.setDrawColor(196, 121, 27); // Ochre Gold
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287);
    doc.setLineWidth(0.3);
    doc.rect(7, 7, 196, 283);

    // --- Background Watermark ---
    try {
      const logoBgBase64 = await getBase64ImageFromUrl("/images/logo-no-bg.png");
      doc.setGState(new (doc as any).GState({opacity: 0.05}));
      doc.addImage(logoBgBase64 as string, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
      doc.setGState(new (doc as any).GState({opacity: 1}));
    } catch(e) {}

    // --- Header Banner ---
    doc.setFillColor(247, 238, 212); // Cream background
    doc.rect(5, 5, 200, 45, 'F');
    
    // Draw a thin gold line under the header
    doc.setFillColor(196, 121, 27); // --color-ochre #c4791b
    doc.rect(5, 50, 200, 2, 'F');

    try {
      const logoBase64 = await getBase64ImageFromUrl("/images/logo-no-bg.png");
      doc.addImage(logoBase64 as string, 'PNG', 14, 10, 78, 30, undefined, 'FAST');
    } catch (e) {
      console.warn("Could not load logo", e);
      doc.setFontSize(26);
      doc.setFont("times", "bold");
      doc.setTextColor(221, 149, 70); // Gold
      doc.text("THE 11 SALON", 14, 30);
    }
    
    // Header Info (Right aligned)
    doc.setFontSize(28);
    doc.setFont("times", "bold");
    doc.setTextColor(51, 22, 6); // Brown dark
    doc.text("INVOICE", 195, 22, { align: "right" });
    
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.setTextColor(93, 48, 17); // Brown light
    doc.text(`Invoice No: INV-${invoice.id.substring(0, 8).toUpperCase()}`, 195, 32, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 195, 38, { align: "right" });

    // --- Billing Details Section ---
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.setTextColor(196, 121, 27); // Gold
    doc.text("Billed To:", 15, 65);
    
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.setTextColor(51, 22, 6); // Brown dark
    doc.text(invoice.appointment?.customer?.name || "Walk-in Customer", 15, 73);
    
    doc.setFont("times", "normal");
    doc.setTextColor(93, 48, 17); // Brown light
    doc.text(invoice.appointment?.customer?.phone || "Phone: N/A", 15, 80);

    // Salon Details (Right aligned)
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.setTextColor(196, 121, 27); // Gold
    doc.text("Salon Details:", 195, 65, { align: "right" });
    
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.setTextColor(93, 48, 17); // Brown light
    doc.text("The 11 Professional Family Salon", 195, 73, { align: "right" });
    doc.text("Kolhapur, Maharashtra, India", 195, 79, { align: "right" });
    doc.text("Phone: +91 74474 88880", 195, 85, { align: "right" });

    // Status Pill Design
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    if (invoice.status === 'PAID') {
      doc.setFillColor(220, 252, 231); // Green 100 bg
      doc.roundedRect(85, 70, 40, 8, 2, 2, 'F');
      doc.setTextColor(22, 163, 74); // Green 600 text
      doc.text(`STATUS: PAID`, 105, 75.5, { align: "center" });
    } else {
      doc.setFillColor(254, 243, 199); // Amber 100 bg
      doc.roundedRect(80, 70, 50, 8, 2, 2, 'F');
      doc.setTextColor(217, 119, 6); // Amber 600 text
      doc.text(`STATUS: ${invoice.status}`, 105, 75.5, { align: "center" });
    }
    doc.setFont('times', 'normal');

    // --- Services Table ---
    autoTable(doc, {
      startY: 100,
      margin: { left: 15, right: 15 },
      head: [['Description', 'Payment Method', 'Qty', 'Unit Price', 'Total']],
      body: [
        [
          invoice.appointment?.service?.name || "Premium Salon Service",
          invoice.method || "CASH",
          '1',
          `Rs. ${invoice.amount.toLocaleString()}`,
          `Rs. ${invoice.amount.toLocaleString()}`
        ],
      ],
      headStyles: { 
        fillColor: [196, 121, 27], // Ochre
        textColor: [247, 238, 212], // Cream
        font: 'times',
        fontStyle: 'bold',
        fontSize: 12
      },
      styles: {
        font: 'times',
        fontSize: 11,
        cellPadding: 8,
        textColor: [51, 22, 6] // Brown dark
      },
      alternateRowStyles: {
        fillColor: [247, 238, 212] // Cream background for alt rows
      },
      tableLineColor: [196, 121, 27], // Gold border
      tableLineWidth: 0.1
    });

    // --- Totals Section ---
    const finalY = (doc as any).lastAutoTable.finalY || 135;
    
    // Draw a summary box
    doc.setDrawColor(196, 121, 27); // Gold border
    doc.setLineWidth(0.5);
    doc.setFillColor(240, 228, 198); // Beige
    doc.roundedRect(120, finalY + 10, 75, 30, 2, 2, 'FD');

    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.setTextColor(93, 48, 17); // Brown light
    doc.text("Subtotal:", 130, finalY + 19);
    doc.text(`Rs. ${invoice.amount.toLocaleString()}`, 185, finalY + 19, { align: "right" });
    
    // Divider line inside total box
    doc.setDrawColor(196, 121, 27);
    doc.setLineWidth(0.2);
    doc.line(125, finalY + 23, 190, finalY + 23);

    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.setTextColor(51, 22, 6); // Brown dark
    doc.text("Total Amount:", 130, finalY + 33);
    
    doc.setTextColor(196, 121, 27); // Ochre
    doc.text(`Rs. ${invoice.amount.toLocaleString()}`, 185, finalY + 33, { align: "right" });

    // Terms and Conditions
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.setTextColor(51, 22, 6); // Brown dark
    doc.text("Terms & Conditions", 15, finalY + 20);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(93, 48, 17); // Brown light
    doc.text("1. This is a computer generated invoice.", 15, finalY + 25);
    doc.text("2. Please retain for your records.", 15, finalY + 30);
    doc.text("3. No refunds on salon services.", 15, finalY + 35);
    
    // Signature
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(51, 22, 6); // Brown dark
    doc.text("Authorized Signatory", 170, 260, { align: "center" });
    doc.line(140, 255, 200, 255); // Signature line
    
    // --- Footer ---
    doc.setFillColor(51, 22, 6); // Brown Dark
    doc.rect(5, 275, 200, 17, 'F');
    
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(247, 238, 212); // Cream
    doc.text("Thank you for choosing The 11 Salon. We look forward to serving you again!", 105, 282, { align: "center" });
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(196, 121, 27); // Gold
    doc.text("the11salon.com", 105, 288, { align: "center" });

    doc.save(`Invoice_The11Salon_${invoice.id.substring(0, 8).toUpperCase()}.pdf`);
  };

  const handleWhatsApp = (invoice: any) => {
    const phone = invoice.appointment?.customer?.phone;
    if (!phone) return alert("No phone number found for this customer.");
    const text = `Hello ${invoice.appointment?.customer?.name || ''},\n\nYour invoice INV-${invoice.id.substring(0,8).toUpperCase()} for Rs.${invoice.amount} has been generated.\n\nThank you for choosing THE 11 SALON!`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = (invoice: any) => {
    const email = invoice.appointment?.customer?.email;
    if (!email) return alert("No email address found for this customer.");
    const subject = `Invoice INV-${invoice.id.substring(0,8).toUpperCase()} from THE 11 SALON`;
    const body = `Hello ${invoice.appointment?.customer?.name || ''},\n\nYour invoice for Rs.${invoice.amount} has been generated.\n\nThank you for choosing THE 11 SALON!`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const filteredInvoices = invoices.filter((inv: any) => 
    inv.id.toLowerCase().includes(search.toLowerCase()) || 
    (inv.appointment?.customer?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setInvoices(invoices.filter((inv: any) => inv.id !== id));
      } else {
        alert("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Billing & Invoices</h1>
          <p className="text-neutral-500 mt-1">Manage payments and generate customer invoices.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by invoice ID or customer name..." 
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
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      INV-{invoice.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{invoice.appointment?.customer?.name || "Walk-in"}</div>
                      <div className="text-xs text-neutral-500">{invoice.appointment?.customer?.phone || ""}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      ₹{invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="p-2 text-neutral-500 hover:text-red-600 bg-neutral-100 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleWhatsApp(invoice)}
                        className="p-2 text-neutral-500 hover:text-green-600 bg-neutral-100 hover:bg-green-50 rounded-lg transition-colors"
                        title="Send via WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEmail(invoice)}
                        className="p-2 text-neutral-500 hover:text-blue-600 bg-neutral-100 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Send via Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => generatePDF(invoice)}
                        className="inline-flex items-center px-3 py-1.5 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium text-xs transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Generate Invoice</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div className="space-y-1 relative">
                <label className="text-sm font-medium text-neutral-700">Select Customer *</label>
                <input 
                  type="text" 
                  required={!formData.customerId}
                  placeholder="Search customer by name or phone..."
                  value={customerSearch}
                  onChange={(e) => {
                     setCustomerSearch(e.target.value);
                     setShowCustomerDropdown(true);
                     if (formData.customerId) setFormData({...formData, customerId: ""});
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => {
                     setTimeout(() => setShowCustomerDropdown(false), 200);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                />
                {showCustomerDropdown && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                     {customers.filter((c: any) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).length > 0 ? (
                       customers.filter((c: any) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).map((c: any) => (
                         <li 
                           key={c.id} 
                           className="px-3 py-2 hover:bg-amber-50 cursor-pointer text-sm"
                           onMouseDown={(e) => {
                             e.preventDefault(); // Prevent focus loss on the input
                             setFormData({...formData, customerId: c.id});
                             setCustomerSearch(`${c.name} (${c.phone})`);
                             setShowCustomerDropdown(false);
                           }}
                         >
                           {c.name} ({c.phone})
                         </li>
                       ))
                     ) : (
                       <li className="px-3 py-2 text-neutral-500 text-sm">No customers found.</li>
                     )}
                  </ul>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">Select Service *</label>
                <select 
                  required
                  value={formData.serviceId} 
                  onChange={e => setFormData({...formData, serviceId: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                >
                  <option value="">-- Choose Service --</option>
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Amount (₹) *</label>
                  <input 
                    type="number" required min="0"
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Payment Method</label>
                  <select 
                    value={formData.method} 
                    onChange={e => setFormData({...formData, method: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 text-neutral-900 rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
                  ) : (
                    "Generate Bill"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
