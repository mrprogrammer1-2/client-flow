import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { ensureUserAndAgency } from "@/lib/services/ensure-user";

export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) throw new Error("no KindeUser");

  const appUser = await ensureUserAndAgency(kindeUser);

  return (
    <main>
      <h1>ClientFlow Dashboard</h1>

      <p>Welcome {kindeUser?.given_name}</p>
      <p>Role: {appUser?.role}</p>
    </main>
  );
}
