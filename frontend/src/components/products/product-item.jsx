import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteProductForm from "./delete-product-form";
import UpdateProductForm from "./update-product-form";

export default function ProductItem({
  product,
  openDetail,
  productSelected,
  disabledEscaner,
  enableScanner,
}) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  return (
    <>
      <div
        className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] text-center items-center w-full mb-2 py-5 border rounded-lg cursor-pointer"
        onClick={() => {
          openDetail(true);
          productSelected(product);
        }}
      >
        <h4 className="truncate">{product.name}</h4>

        <p>
          ${product.price.toLocaleString("es-AR")}
          {product.type === "Weight" && <span>/kg</span>}
        </p>

        <p>
          {product.stock.toLocaleString("es-AR")}
          {product.type === "Weight" ? "g" : " unidades"}
        </p>

        <SquarePen
          className="m-auto text-gray-500 hover:text-black transition-all duration-300"
          onClick={(e) => {
            disabledEscaner();
            e.stopPropagation();
            setOpenUpdateModal(true);
          }}
        />

        <Trash2
          className="m-auto text-red-500 hover:text-red-800 transition-all duration-300"
          onClick={(e) => {
            disabledEscaner();
            e.stopPropagation();
            setOpenDeleteModal(true);
          }}
        />
      </div>

      {openUpdateModal && (
        <UpdateProductForm
          product={product}
          close={() => {
            enableScanner();
            setOpenUpdateModal(false);
          }}
          productSelected={productSelected}
        />
      )}

      {openDeleteModal && (
        <DeleteProductForm
          product={product}
          close={() => {
            enableScanner();
            setOpenDeleteModal(false);
          }}
          productSelected
          closeDetail={() => openDetail(false)}
        />
      )}
    </>
  );
}
