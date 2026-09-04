import { requireCurrentUser } from "@/lib/services/current-user";

export default async function DashboardPage() {
  const appUser = await requireCurrentUser();

  return (
    <main>
      <h1>ClientFlow Dashboard</h1>

      <p>Welcome {appUser.kindeUser?.given_name}</p>
      <p>Role: {appUser.role}</p>
    </main>
  );
}
