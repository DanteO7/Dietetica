import { Suspense, useEffect, lazy } from "react";
import { useAuthStore } from "./store/auth-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { ProtectedRoute } from "./router/protected-router";
import { GuestRoute } from "./router/guest-route";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { me } from "./services/auth";
import Header from "./components/header.jsx";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";

// Lazy pages
const Home = lazy(() => import("./pages/home.jsx"));
const Products = lazy(() => import("./pages/products.jsx"));
const SignIn = lazy(() => import("./pages/sign-in.jsx"));
const Sales = lazy(() => import("./pages/sales.jsx"));
const Page404 = lazy(() => import("./pages/page404.jsx"));

const queryClient = new QueryClient();

export default function App() {
  const { setAuth, logout, finishLoading } = useAuthStore();
  const [location] = useLocation();

  useEffect(() => {
    me()
      .then((user) => setAuth(user))
      .catch(() => logout())
      .finally(() => finishLoading());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <>
            {location !== "/iniciar-sesion" ? <Header /> : <></>}
            <div className="flex justify-center pt-20">
              <Ring
                size="40"
                stroke="5"
                bgOpacity="0"
                speed="2"
                color="#374151"
              />
            </div>
          </>
        }
      >
        <Switch>
          <ProtectedRoute path="/" component={Home} />
          <ProtectedRoute path="/productos" component={Products} />
          <ProtectedRoute path="/ventas" component={Sales} />

          <GuestRoute path="/iniciar-sesion" component={SignIn} />
          <Route>
            <Page404 />
          </Route>
        </Switch>
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
