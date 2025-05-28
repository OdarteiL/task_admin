"use client";

import { AuthProvider } from "react-oidc-context";
import React, { useEffect } from "react";

const oidcConfig = {
  authority: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_TaZwHKR2d",
  client_id: "6n0odlf9mqqo07mcldq0l1has6",
  redirect_uri: typeof window !== "undefined" 
    ? `${window.location.origin}/` 
    : "https://main.d345rptlcv0lr0.amplifyapp.com/",
  response_type: "code",
  scope: "email openid phone",
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    // Remove the query parameters that OIDC adds
    window.history.replaceState(
      {}, 
      document.title, 
      window.location.pathname
    );
  },
};

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
}