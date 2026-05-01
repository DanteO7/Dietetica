import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 transition-all duration-200 pb-[16px] ${
      location === path ? "tab-active " : "rounded-xl hover:bg-gray-600"
    }`;

  return (
    <header className="sticky top-0 bg-gray-700 h-14 z-40 flex justify-center text-[#efefef]">
      <div className="w-full">
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
        <div className="w-full px-6 bg-[#ede9ee] h-3"></div>
      </div>
    </header>
  );
}
