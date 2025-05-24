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
    const logoutUri = "http://localhost:3000"; // use http if testing locally
    const cognitoDomain =
      "https://us-west-2tazwhkr2d.auth.us-west-2.amazoncognito.com";

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  if (auth.isLoading || redirecting) {
    return <p className="p-4 text-gray-600">Loading...</p>;
  }

  if (auth.error) {
    return <p className="p-4 text-red-600">Error: {auth.error.message}</p>;
  }

  // Define username safely for JSX
  let username = "User";
  if (auth.isAuthenticated) {
    username =
      (auth.user?.profile["cognito:username"] as string) ||
      (auth.user?.profile["preferred_username"] as string) ||
      (auth.user?.profile.email as string) ||
      "User";
  }

  if (auth.isAuthenticated) {
    const groupsRaw = auth.user?.profile["cognito:groups"];
    const userGroups = Array.isArray(groupsRaw)
      ? groupsRaw
      : typeof groupsRaw === "string"
      ? [groupsRaw]
      : [];

    return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Welcome, {username}</h2>

        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(auth.user, null, 2)}
        </pre>

        <div className="space-x-4">
          {userGroups.includes("admin") ? (
            <>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Admin Panel
              </button>
            </>
          ) : (
            <>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Team Dashboard
              </button>
            </>
          )}
          <button
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            onClick={() => auth.removeUser()}
          >
            Sign out (local)
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={signOutRedirect}
          >
            Sign out (Cognito)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Not signed in</h2>
      <button
        onClick={() => auth.signinRedirect()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Sign in
      </button>
    </div>
  );
}