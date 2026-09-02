import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { ensureUserAndAgency } from "@/lib/services/ensure-user";

import { createClientAction } from "@/app/dashboard/clients/actions";

export default async function ClientsPage() {
  // 1. Identify the authenticated person.
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) {
    redirect("/");
  }

  // 2. Get that person's ClientFlow user record and agency.
  const user = await ensureUserAndAgency({
    id: kindeUser.id,
    email: kindeUser.email,
    given_name: kindeUser.given_name,
  });

  if (!user) {
    throw new Error("Could not find the current user.");
  }

  // 3. Load only this agency's clients.
  const agencyClients = await db
    .select()
    .from(clients)
    .where(eq(clients.agencyId, user.agencyId))
    .orderBy(desc(clients.createdAt));

  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="mt-2 text-gray-600">
          Add and manage your agency&apos;s clients.
        </p>
      </div>

      <section className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Add a client</h2>

        <form action={createClientAction} className="mt-6 space-y-4">
          <input
            name="name"
            required
            placeholder="Contact name"
            className="w-full rounded border p-3"
          />

          <input
            name="companyName"
            required
            placeholder="Company name"
            className="w-full rounded border p-3"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded border p-3"
          />

          <input
            name="phone"
            type="tel"
            placeholder="Phone number (optional)"
            className="w-full rounded border p-3"
          />

          <button
            type="submit"
            className="rounded bg-black px-4 py-3 text-white"
          >
            Add client
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Your clients</h2>

        {agencyClients.length === 0 ? (
          <p className="mt-4 text-gray-600">
            You haven&apos;t added any clients yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {agencyClients.map((client) => (
              <article key={client.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{client.companyName}</h3>
                <p>{client.name}</p>
                <p className="text-sm text-gray-600">{client.email}</p>

                {client.phone ? (
                  <p className="text-sm text-gray-600">{client.phone}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
