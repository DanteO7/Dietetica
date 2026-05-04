import { SquarePen, Trash2 } from "lucide-react";
import React from "react";

export default function SaleProductItem({
  product,
  quantity,
  selectProduct,
  removeProduct,
  productSelected,
}) {
  const subtotal =
    product.type === "Weight"
      ? (product.price * quantity) / 1000
      : product.price * quantity;
  return (
    <div className="flex items-center gap-4">
      <span className="mb-3 text-2xl">
        x{quantity}
        {product.type === "Unit" ? "u" : "g"}
      </span>
      <div
        onClick={() => selectProduct()}
        className={`grid grid-cols-[1.4fr_1fr_1.2fr_1.2fr_1fr] text-center items-center mb-3 w-full py-5 border rounded-lg cursor-pointer hover:bg-gray-200 transition-all duration-150 ${productSelected.id === product.id ? "bg-[#e3e0e5]" : ""}`}
      >
        <h4 className="truncate">{product.name}</h4>

        <p>
          ${product.price.toLocaleString("es-AR")}
          {product.type === "Weight" && "/kg"}
        </p>

        <p>
          {product.stock.toLocaleString("es-AR")}
          {product.type === "Weight" ? "g" : " unidades"} en stock
        </p>

        <p>Subtotal: ${subtotal.toLocaleString("es-AR")}</p>

        <Trash2
          onClick={(e) => {
            e.stopPropagation();
            removeProduct();
          }}
          className="m-auto text-red-500 hover:text-red-800 transition-all duration-300"
        />
      </div>
    </div>
  );
}
