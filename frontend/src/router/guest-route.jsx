import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";

export function GuestRoute({ component: Component, ...rest }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading)
    return (
      <div className="flex justify-center pt-20">
        <Ring size="40" stroke="5" bgOpacity="0" speed="2" color="#374151" />
      </div>
    );

  return (
    <Route
      {...rest}
      component={() => (isAuthenticated ? <Redirect to="/" /> : <Component />)}
    />
  );
}
