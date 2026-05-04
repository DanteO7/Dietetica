import { useState } from "react";
import { Link, useLocation } from "wouter";
import CommerceDataForm from "./commerce-data-form";

export default function Header() {
  const [location] = useLocation();
  const [openDateModal, setOpenDateModal] = useState(false);

  const linkClass = (path) =>
    `px-4 py-2 transition-all duration-200 pb-[16px] ${
      location === path ? "tab-active " : "rounded-xl hover:text-gray-400"
    }`;

  return (
    <>
      <header className="sticky top-0 bg-gray-700 h-14 z-40 flex justify-center text-[#efefef] w-full">
        <div className="w-full flex items-center justify-center relative">
          <button
            className="absolute left-15 cursor-pointer hover:text-gray-400 transition-all duration-200"
            onClick={() => setOpenDateModal(true)}
          >
            Cambiar Información
          </button>
          <div className="flex items-end justify-center gap-6 h-full">
            <Link href="/" className={linkClass("/")}>
              Inicio
            </Link>

            <Link href="/productos" className={linkClass("/productos")}>
              Productos
            </Link>

            <Link href="/ventas" className={linkClass("/ventas")}>
              Ventas
            </Link>
          </div>
        </div>
        {openDateModal && (
          <CommerceDataForm close={() => setOpenDateModal(false)} />
        )}
      </header>
      <div className="w-full  bg-[#ede9ee] h-3"></div>
    </>
  );
}
