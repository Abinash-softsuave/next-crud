import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Welcome to Interview Prep</h1>
        {!session ? (
          <>
            <p className="mb-4">
              Please sign in to start your interview or manage questions.
            </p>
            <button
              onClick={() => signIn()}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            <p className="mb-4">Ready to start your interview?</p>
            <Link
              href="/interview"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
            >
              Start Interview
            </Link>
            {session.user.role === "admin" && (
              <Link
                href="/admin"
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Admin Dashboard
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
