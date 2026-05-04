import { FooterDivider } from "flowbite-react";
import { Circle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#ede9ee] py-5">
      <div className="flex justify-center items-center gap-1.5">
        <p>v1.0.1</p>
        <span className="text-[20px]">•</span>
        <p>Teléfono:(+54) 3400-532514</p>
        <span className="text-[20px]">•</span>
        <p>Email: dante.orsetti@gmail.com</p>
      </div>{" "}
      <p className="text-center">
        &copy;2026 Sistema de Ventas. Todos los derechos reservados.
      </p>
    </footer>
  );
}
