import { redirect } from "next/navigation";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/server/session";

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session || session.profile.role !== "super_admin")
    redirect("/dashboard");
  const snapshot = await getAdminFirestore()
    .collection("businesses")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-5 py-10">
      <div>
        <p className="text-sm font-medium text-primary">Super Admin</p>
        <h1 className="text-3xl font-bold">Negocios registrados</h1>
      </div>
      <div className="overflow-x-auto rounded-xl border border-default-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-default-100">
            <tr>
              <th className="p-4">Negocio</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Slug</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.docs.map((document) => {
              const business = document.data();
              return (
                <tr key={document.id} className="border-t border-default-200">
                  <td className="p-4">{business.name}</td>
                  <td className="p-4">{business.plan}</td>
                  <td className="p-4">{business.subscriptionStatus}</td>
                  <td className="p-4">{business.slug}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
