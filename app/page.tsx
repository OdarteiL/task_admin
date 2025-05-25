"use client";

import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const auth = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const groupsRaw = auth.user?.profile["cognito:groups"];
      const userGroups = Array.isArray(groupsRaw)
        ? groupsRaw
        : typeof groupsRaw === "string"
        ? [groupsRaw]
        : [];

      if (userGroups.includes("admin")) {
        setRedirecting(true);
        router.push("/admin");
      } else if (userGroups.includes("field_team")) {
        setRedirecting(true);
        router.push("/team");
      }
    }
  }, [auth.isAuthenticated, auth.user?.profile, router]);

  const signOutRedirect = () => {
    const clientId = "6n0odlf9mqqo07mcldq0l1has6";
    const logoutUri = window.location.origin;
    const cognitoDomain =
      "https://us-west-2tazwhkr2d.auth.us-west-2.amazoncognito.com";

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  if (auth.isLoading || redirecting) {
    return <p className="p-6 text-gray-600">Loading your dashboard...</p>;
  }

  if (auth.error) {
    return <p className="p-6 text-red-600">Error: {auth.error.message}</p>;
  }

  const username =
    (auth.user?.profile["cognito:username"] as string) ||
    (auth.user?.profile["preferred_username"] as string) ||
    (auth.user?.profile.email as string) ||
    "User";

  const groupsRaw = auth.user?.profile["cognito:groups"];
  const userGroups = Array.isArray(groupsRaw)
    ? groupsRaw
    : typeof groupsRaw === "string"
    ? [groupsRaw]
    : [];

  return auth.isAuthenticated ? (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {username} 👋
          </h1>
          <p className="text-sm text-gray-500">
            You are signed in as{" "}
            <span className="font-medium text-blue-600">
              {userGroups.join(", ") || "guest"}
            </span>
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          {userGroups.includes("admin") && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              onClick={() => router.push("/admin")}
            >
              Go to Admin Panel
            </button>
          )}
          {userGroups.includes("field_team") && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              onClick={() => router.push("/team")}
            >
              Go to Team Dashboard
            </button>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button
            className="text-sm text-gray-500 hover:underline"
            onClick={() => auth.removeUser()}
          >
            Sign out (Local)
          </button>
          <button
            className="text-sm text-red-500 hover:underline"
            onClick={signOutRedirect}
          >
            Sign out (Cognito)
          </button>
        </div>
      </div>
    </main>
  ) : (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-xl w-full bg-white p-10 rounded-xl shadow-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to TaskFlow
        </h1>
        <p className="text-gray-600 text-base">
          TaskFlow helps admins assign tasks and team members track progress, meet deadlines, and stay updated in real time.
        </p>
        <button
          onClick={() => auth.signinRedirect()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Sign In to Continue
        </button>
      </div>
    </main>
  );
}
