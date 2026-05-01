import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence } from "framer-motion";
import Ticket from "../ticket";

export default function SaleCard({ sale, select, saleSelected }) {
  const ticketRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
  });

  return (
    <div key={sale.id}>
      <div style={{ display: "none" }}>
        <Ticket ref={ticketRef} sale={sale} />
      </div>

      <motion.div
        onClick={
          saleSelected?.id === sale.id ? () => select(null) : () => select(sale)
        }
        className="border rounded-xl py-5 px-6 cursor-pointer text-2xl hover:bg-gray-200 mb-4"
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <div className="grid grid-cols-[1fr_1fr_1fr] text-center items-center gap-25">
          <p>Venta: {sale.ticketNumber.toString().padStart(6, "0")}</p>
          <p>{new Date(sale.createdAt).toLocaleString("es-AR")}</p>
          <p>{sale.paymentMethod.name}</p>
        </div>

        <AnimatePresence>
          {saleSelected?.id === sale.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden text-xl border-t mt-4 pt-4"
            >
              {sale.items.map((i) => (
                <div
                  key={i.id}
                  className="grid grid-cols-[1fr_1.4fr_1fr] text-center items-center mb-3 w-[90%] m-auto"
                >
                  <p>
                    x{i.quantity.toLocaleString("es-AR")}
                    {i.productType == "Unit" ? "u." : "g"}
                  </p>
                  <p>{i.productName}</p>
                  <p>
                    ${i.unitPrice.toLocaleString("es-AR")}
                    {i.productType == "Unit" ? "" : "/kg"}
                  </p>
                </div>
              ))}

              <div className="flex items-center mt-5 justify-between m-auto border-t pt-5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrint();
                  }}
                  className="ml-5 border bg-gray-700 text-[#efefef] rounded-[7px] px-3 py-2 hover:text-gray-800 hover:bg-gray-300 transition-all duration-200 cursor-pointer"
                >
                  Imprimir Ticket
                </button>

                <p className="font-semibold mr-5">
                  Total: ${sale.total.toLocaleString("es-AR")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
