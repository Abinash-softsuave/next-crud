"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "user") {
      setError("Unauthorized: Users only");
      router.push("/");
      return;
    }
  }, [status, session, router]);

  if (status === "loading") return <div>Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!session || session.user.role !== "user") return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">User Dashboard</h1>
        <p className="mb-4 text-center">Welcome, {session.user.name}!</p>
        <div className="text-center">
          <a
            href="/interview"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Start Interview
          </a>
        </div>
      </div>
    </div>
  );
}
