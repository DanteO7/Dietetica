import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";

export function GuestRoute({ component: Component, ...rest }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <Route
      {...rest}
      component={() => (isAuthenticated ? <Redirect to="/" /> : <Component />)}
    />
  );
}
