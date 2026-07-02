import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/admin/login");
  // }

  // Optionally check for roles:
  // if ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN") {
  //   redirect("/");
  // }

  return (
    <div className="flex h-screen bg-cream overflow-hidden text-brown-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-cream">
          {children}
        </main>
      </div>
    </div>
  );
}
