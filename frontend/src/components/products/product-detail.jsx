import { SquarePen, Trash2, X } from "lucide-react";
import { useState } from "react";
import DeleteProductForm from "./delete-product-form";
import UpdateProductForm from "./update-product-form";
import DeleteCodeForm from "./delete-code-form";
import UpdateCodeForm from "./update-code-form";
import CreateCodeForm from "./create-code-form";

export default function ProductDetail({
  product,
  openDetail,
  productSelected,
  disabledEscaner,
  enableScanner,
}) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [openProductUpdateModal, setOpenProductUpdateModal] = useState(false);
  const [openProductDeleteModal, setOpenProductDeleteModal] = useState(false);

  const [codeSelected, setCodeSelected] = useState(null);

  return (
    <>
      <div className="w-[40%] scrollbar-hide overflow-y-auto h-full">
        <div className="pl-16 flex flex-col gap-3 text-[18px]">
          <div className="flex ml-auto">
            <X
              onClick={() => openDetail(false)}
              size={30}
              className="cursor-pointer hover:text-gray-600 duration-200 transition-all"
            />
          </div>
          <img
            src={product.imageUrl || "image-placeholder.png"}
            className="w-full m-auto object-cover rounded mb-5"
          />

          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-semibold mb-3">{product.name}</h2>

              <p>
                Precio: ${product.price.toLocaleString("es-AR")}
                {product.type === "Weight" && "/kg"}
              </p>

              <p>
                Stock: {product.stock.toLocaleString("es-AR")}
                {product.type === "Weight" ? "g" : "unidades"}
              </p>

              <p className="">
                Tipo de producto:{" "}
                {product.type == "Weight" ? (
                  <span>Por peso</span>
                ) : (
                  <span>Por unidad</span>
                )}
              </p>
            </div>
            <div className="flex flex-col">
              <button
                onClick={() => {
                  disabledEscaner();
                  setOpenProductUpdateModal(true);
                }}
                className="border bg-gray-700 text-[#efefef] rounded-[7px] px-2.5 py-1.5 mt-2 hover:text-gray-800 hover:bg-gray-300 transition-all duration-200 cursor-pointer"
              >
                Editar producto
              </button>
              <button
                onClick={() => {
                  disabledEscaner();
                  setOpenProductDeleteModal(true);
                }}
                className="border bg-red-500 text-[#efefef]  hover:text-red-500  rounded-[7px] px-2.5 py-1.5 mt-2 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
              >
                Eliminar producto
              </button>
            </div>
          </div>

          <div className="flex gap-5 items-center ">
            <h3 className="font-semibold mt-2">Códigos:</h3>
            <button
              onClick={() => {
                disabledEscaner();
                setOpenCreateModal(true);
              }}
              className="border rounded-[7px] px-2 py-1 mt-2 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
            >
              Agregar
            </button>
          </div>
          {product.codes?.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-2 w-full"
            >
              <p className="break-all flex-1 min-w-0">Valor: {c.value}</p>
              <p className="w-28 shrink-0">
                Tipo: {c.type === "Barcode" ? "Barras" : "Auxiliar"}
              </p>
              <SquarePen
                className="cursor-pointer text-gray-500 hover:text-black transition-all duration-300 shrink-0"
                onClick={() => {
                  disabledEscaner();
                  setCodeSelected(c);
                  setOpenUpdateModal(true);
                }}
              />
              <Trash2
                className="text-red-500 cursor-pointer hover:text-red-800 transition-all duration-300 shrink-0"
                onClick={() => {
                  disabledEscaner();
                  setCodeSelected(c);
                  setOpenDeleteModal(true);
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {openDeleteModal && (
        <DeleteCodeForm
          close={() => {
            enableScanner();
            setOpenDeleteModal(false);
          }}
          code={codeSelected}
          productSelected={productSelected}
        />
      )}
      {openUpdateModal && (
        <UpdateCodeForm
          close={() => {
            enableScanner();
            setOpenUpdateModal(false);
          }}
          code={codeSelected}
          productSelected={productSelected}
        />
      )}
      {openCreateModal && (
        <CreateCodeForm
          close={() => {
            enableScanner();
            setOpenCreateModal(false);
          }}
          productSelected={productSelected}
          productId={product.id}
        />
      )}
      {openProductUpdateModal && (
        <UpdateProductForm
          close={() => {
            enableScanner();
            setOpenProductUpdateModal(false);
          }}
          product={product}
          productSelected={productSelected}
        />
      )}
      {openProductDeleteModal && (
        <DeleteProductForm
          close={() => {
            enableScanner();
            setOpenProductDeleteModal(false);
          }}
          product={product}
          productSelected={productSelected}
          closeDetail={() => openDetail(false)}
        />
      )}
    </>
  );
}
