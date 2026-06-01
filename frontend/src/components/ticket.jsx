import { forwardRef } from "react";
import { useDataStore } from "../store/data-store";

const Ticket = forwardRef(({ sale }, ref) => {
  const { commerceName } = useDataStore();
  console.log(sale);

  return (
    <div
      ref={ref}
      className="w-[72mm] font-mono text-[11px] leading-tight tracking-tight p-[2mm] m-auto text-black bg-white"
    >
      <h2 className="text-center text-[14px] font-bold uppercase">
        {commerceName}
      </h2>
      <p className="text-center">
        Ticket #{sale?.ticketNumber.toString().padStart(6, "0")}
      </p>
      <p className="text-center">
        {new Date(sale?.createdAt).toLocaleString("es-AR")}
      </p>
      <hr className="border-t border-dashed border-black my-[6px]" />
      <div className="space-y-[6px]">
        {sale?.items.map((i) => (
          <div key={i.id}>
            <div className="flex justify-between gap-2">
              <span className="font-medium break-words flex-1">
                {i.productName}
              </span>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>
                x{i.quantity.toLocaleString("es-AR")}
                {i.productType === "Weight" ? "g" : ""}
              </span>

              <span>
                $
                {(i.productType === "Weight"
                  ? (i.unitPrice * i.quantity) / 1000
                  : i.unitPrice * i.quantity
                ).toLocaleString("es-AR", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
      <hr className="border-t border-dashed border-black my-[6px]" />
      <div className="flex justify-between font-bold text-[13px] mt-[4px]">
        <span>Total</span>
        <span>${sale?.total.toLocaleString("es-AR")}</span>
      </div>
      <p className="text-center text-[10px] mt-[6px]">
        {sale?.paymentMethod.name}
        {sale?.paymentMethod.discount
          ? ` con ${sale?.paymentMethod.discount}% de descuento`
          : ""}
      </p>
      <p className="text-center text-[10px] mt-[10px]">
        ¡Gracias por su compra!
      </p>
      <div className="h-[25mm]" />
      <span className="text-[1px]">.</span>
    </div>
  );
});

export default Ticket;
