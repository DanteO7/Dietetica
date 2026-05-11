import { useState } from "react";
import Modal from "./modal";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { X } from "lucide-react";

export default function DateModal({ close, changeSelected }) {
  const [selected, setSelected] = useState({
    from: new Date(),
    to: new Date(),
  });

  let footer = <p>Seleccioná un rango.</p>;

  if (selected?.from) {
    footer = (
      <p className="mt-3">
        Desde {format(selected.from, "PP")}
        {selected.to && ` - hasta ${format(selected.to, "PP")}`}
      </p>
    );
  }
  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Seleccionar Fecha</h2>

        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>
      <DayPicker
        className="m-auto w-fit h-103 border px-5 py-3 rounded-2xl shadow-2xs"
        mode="range"
        selected={selected}
        onSelect={setSelected}
        footer={footer}
      />
      <div className="flex gap-3 justify-end mt-5">
        <button
          type="button"
          onClick={close}
          className="px-4 py-2 rounded border cursor-pointer transition-all duration-200 hover:bg-gray-200"
        >
          Cancelar
        </button>

        <button
          onClick={() => {
            if (!selected) return;

            changeSelected({
              from: selected.from,
              to: selected.to ?? undefined,
            });

            close();
          }}
          className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700 cursor-pointer transition-all duration-200"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
}
