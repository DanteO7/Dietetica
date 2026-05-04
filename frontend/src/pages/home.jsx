import { useCallback, useEffect, useRef, useState } from "react";
import MainLayout from "../layouts/main-layout";
import { getProductByCode } from "../services/product";
import SaleProductItem from "../components/home/sale-product-item";
import AddProductForm from "../components/home/add-product-form";
import PrintTicketConfirm from "../components/home/print-ticket-confirm";
import SaleConfirm from "../components/home/sale-confirm";
import { useReactToPrint } from "react-to-print";
import Ticket from "../components/ticket";

export default function Home() {
  const [error, setError] = useState("");
  const [productSelected, setProductSelected] = useState(null);
  const [items, setItems] = useState([]);
  const removeProduct = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openSaleModal, setOpenSaleModal] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState();
  const [saleData, setSaleData] = useState(null);
  const [sale, setSale] = useState(null);

  const total = items.reduce((acc, item) => {
    if (item.product.type === "Weight") {
      return acc + (item.product.price * item.quantity) / 1000;
    }

    return acc + item.product.price * item.quantity;
  }, 0);

  const addProduct = (product, quantity) => {
    quantity = parseFloat(quantity);
    if (quantity <= 0) {
      setError("Cantidad inválida");
      return;
    }

    if (quantity > product.stock) {
      setError(`La cantidad supera el stock disponible de: ${product.name}`);
      return;
    }

    setError(null);

    setItems((prev) => {
      const exists = prev.find((i) => i.productId === product.id);

      if (exists) {
        const newQty = exists.quantity + quantity;

        if (newQty > product.stock) {
          setError(`Supera el stock disponible de: ${product.name}`);
          return prev;
        }

        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQty } : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity,
        },
      ];
    });
    setProductSelected(product);
  };

  const handleScan = useCallback(async (code) => {
    try {
      const product = await getProductByCode(code);
      addProduct(product, 1);
    } catch {
      alert("Producto no encontrado");
    }
  }, []);

  useEffect(() => {
    let buffer = "";
    let timeout = null;

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      clearTimeout(timeout);

      if (e.key === "Enter") {
        if (buffer.length > 0) {
          handleScan(buffer);
          buffer = "";
        }
        return;
      }

      buffer += e.key;

      timeout = setTimeout(() => {
        buffer = "";
      }, 100);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleScan]);

  const createData = () => {
    if (!paymentMethodId) {
      setError("Seleccioná un método de pago");
      return null;
    }

    if (items.length === 0) {
      setError("No hay productos en la venta");
      return null;
    }

    const data = {
      paymentMethodId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    return data;
  };

  const handleOpenSale = () => {
    const data = createData();

    if (!data) return; // si hay error, no abre

    setSaleData(data);
    setOpenSaleModal(true);
  };
  const ticketRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
  });

  return (
    <MainLayout>
      <div style={{ display: "none" }}>
        {sale && <Ticket ref={ticketRef} sale={sale} />}
      </div>
      <div className="flex w-full justify-between h-full">
        <div className="w-[55%]  flex flex-col">
          <div className="flex justify-between items-center  shrink-0">
            <h2 className="font-semibold text-3xl">Productos de la venta:</h2>
            <button
              onClick={() => setOpenAddModal(true)}
              className="border bg-gray-700 text-[#efefef] rounded-[7px] px-2.5 py-1.5 mt-2 hover:text-gray-800 hover:bg-gray-300 transition-all duration-200 cursor-pointer"
            >
              Agregar producto
            </button>
          </div>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <div className="my-5 flex-1 overflow-y-auto pr-2">
            {items.map((i) => (
              <SaleProductItem
                key={i.productId}
                product={i.product}
                quantity={i.quantity}
                selectProduct={() => setProductSelected(i.product)}
                removeProduct={() => {
                  removeProduct(i.productId);
                  setProductSelected(null);
                }}
                productSelected={productSelected}
              />
            ))}
          </div>

          <div className="flex justify-between items-center shrink-0 pt-4 border-t">
            <div className="text-xl flex items-center w-[60%] gap-5">
              <label className="text-black">Método de pago:</label>

              <select
                onChange={(e) => setPaymentMethodId(Number(e.target.value))}
                className="rounded-[13px] px-1 py-2 min-w-[25%] border-gray-200 border-[1.7px] bg-[#efefef] cursor-pointer"
              >
                <option value="">Seleccionar</option>
                <option value="1">Transferencia</option>
                <option value="2">Efectivo</option>
                <option value="3">Tarjeta</option>
              </select>
            </div>

            <p className="text-3xl font-semibold">
              Total: ${total.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
        <div className="w-[40%] flex flex-col justify-between">
          <div className="flex flex-col gap-3 text-[19px] overflow-y-auto">
            <img
              src={productSelected?.imageUrl || "image-placeholder.png"}
              className="w-full m-auto object-cover rounded mb-1 aspect-[1054/653]"
            />

            <h2 className="text-4xl font-semibold">{productSelected?.name}</h2>

            {productSelected && (
              <p>
                Precio: ${productSelected?.price.toLocaleString("es-AR")}
                {productSelected?.type === "Weight" && "/kg"}
              </p>
            )}

            {productSelected && (
              <p>
                Stock: {productSelected?.stock.toLocaleString("es-AR")}
                {productSelected?.type === "Weight" && "g"}
              </p>
            )}

            {productSelected && (
              <p className="">
                Tipo de producto:{" "}
                {productSelected?.type == "Weight" ? (
                  <span>Por peso</span>
                ) : (
                  <span>Por unidad</span>
                )}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-5 text-xl border-t pt-2.25">
            <button
              onClick={() => {
                if (saleData == null) {
                  setError("Primero tenes que realizar la venta");
                  return;
                }
                handlePrint();
              }}
              className="border bg-gray-700 text-[#efefef] rounded-[7px] px-3 py-2 mt-2 hover:text-gray-800 hover:bg-gray-300 transition-all duration-200 cursor-pointer"
            >
              Imprimir Ticket
            </button>
            <button
              onClick={() => handleOpenSale()}
              className="border bg-green-700 text-[#efefef] rounded-[7px] px-3 py-2 mt-2 hover:text-green-700 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
            >
              Realizar Venta
            </button>
          </div>
        </div>
      </div>
      {openAddModal && (
        <AddProductForm
          close={() => setOpenAddModal(false)}
          addProduct={addProduct}
        />
      )}
      {openSaleModal && (
        <SaleConfirm
          close={() => setOpenSaleModal(false)}
          data={saleData}
          setSale={setSale}
        />
      )}
    </MainLayout>
  );
}
