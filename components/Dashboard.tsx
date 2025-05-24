// app/components/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

export default function Dashboard() {
  const auth = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (auth.isLoading) {
    return <p>Loading authentication...</p>;
  }

  if (auth.error) {
    return <p>Error: {auth.error.message}</p>;
  }

  if (!auth.user) {
    return <button onClick={() => auth.signinRedirect()}>Login</button>;
  }

  return (
    <div>
      <h1>Welcome</h1>
      <p>Email: {auth.user.profile.email}</p>
      <button onClick={() => auth.signoutRedirect()}>Logout</button>
    </div>
  );
}
