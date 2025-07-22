import { Navigate } from "react-router-dom";

// Redirect logged-in users away from Auth ("/")
export function PublicRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/menu" replace />;
  return children;
}

// Guests and logged-in users allowed
export function GuestOrUserRoute({ children }: { children: JSX.Element }) {
  // no token means guest; token means logged in
  return children;
}

// Only logged-in users allowed
export function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/menu" replace />;
  return children;
}
