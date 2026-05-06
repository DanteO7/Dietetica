import { forwardRef } from "react";
import { useDataStore } from "../store/data-store";

const Ticket = forwardRef(({ sale }, ref) => {
  console.log(sale);

  const { commerceName } = useDataStore();

  return (
    <div ref={ref} className="w-[50mm] font-mono text-[10px] p-[2mm] m-auto">
      <h2 className="text-center text-[12px] font-bold">{commerceName}</h2>

      <p className="text-center">
        Ticket #{sale?.ticketNumber.toString().padStart(6, "0")}
      </p>

      <p className="text-center">
        {new Date(sale?.createdAt).toLocaleString("es-AR")}
      </p>

      <hr className="border-t border-dashed border-black my-[5px]" />

      {sale?.items.map((i) => (
        <div key={i.id} className="mt-[4px]">
          <div className="flex justify-between">
            <span className="font-medium">{i.productName}</span>
          </div>

          <div className="flex justify-between text-[9px]">
            <span>
              x{i.quantity.toLocaleString("es-AR")}
              {i.productType === "Unit" ? "" : "g"}
            </span>

            <span>
              ${i.unitPrice.toLocaleString("es-AR")}
              {i.productType === "Weight" ? "/kg" : ""}
            </span>
          </div>
        </div>
      ))}

      <hr className="border-t border-dashed border-black my-[5px]" />

      <div className="flex justify-between font-bold mt-[5px]">
        <span>Total</span>
        <span>${sale?.total.toLocaleString("es-AR")}</span>
      </div>

      <p className="text-center text-[10px]">{sale?.paymentMethod.name}</p>

      <p className="text-center text-[10px] mt-[8px]">
        ¡Gracias por su compra!
      </p>
    </div>
  );
});

export default Ticket;
