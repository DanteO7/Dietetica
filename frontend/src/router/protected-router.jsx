import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";

export function ProtectedRoute({ component: Component, ...rest }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <div>Cargando...</div>;

  if (!isAuthenticated) return <Redirect to="/iniciar-sesion" />;

  return <Route {...rest} component={Component} />;
}
