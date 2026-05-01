import { Link } from "wouter";
import MainLayout from "../layouts/main-layout";

export default function Page404() {
  return (
    <MainLayout>
      <div className="flex flex-col my-40 items-center">
        <h2 className="m-auto text-9xl text-gray-700">Error 404</h2>
        <h2 className="m-auto text-8xl text-gray-700">Página no encontrada</h2>
        <Link
          href="/"
          className="mt-20 text-2xl underline hover:text-gray-500 transition-all duration-100"
        >
          Volver al inicio
        </Link>
      </div>
    </MainLayout>
  );
}
