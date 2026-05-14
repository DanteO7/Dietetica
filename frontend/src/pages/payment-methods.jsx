import { useQuery } from "@tanstack/react-query";
import MainLayout from "../layouts/main-layout";
import { getPaymentMethods } from "../services/payment-method";
import { useState } from "react";
import MethodCard from "../components/methods/method-card";
import { Plus } from "lucide-react";
import CreateMethodForm from "../components/methods/create-method-form";
import { Ring } from "ldrs/react";
import UpdateMethodForm from "../components/methods/update-method-form";

export default function PaymentMethods() {
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const { data: methods, isLoading } = useQuery({
    queryKey: ["getMethods"],
    queryFn: getPaymentMethods,
  });

  return (
    <MainLayout>
      <h2 className="font-semibold text-3xl">Métodos de pago</h2>
      <div className="grid grid-cols-4 gap-10">
        {isLoading && (
          <div className="flex justify-center pt-20">
            <Ring
              size="40"
              stroke="5"
              bgOpacity="0"
              speed="2"
              color="#374151"
            />
          </div>
        )}
        {methods?.map((m) => (
          <MethodCard key={m.id} method={m} />
        ))}
        <div
          onClick={() => setOpenCreateModal(true)}
          className="border flex justify-center items-center rounded-2xl p-7 text-2xl w-55 h-55 text-center shadow-xl hover:bg-[#e1e1e9] transition-all duration-200 cursor-pointer"
        >
          <Plus className="text-gray-700" strokeWidth={0.5} size={150} />
        </div>
      </div>
      {openCreateModal && (
        <CreateMethodForm close={() => setOpenCreateModal(false)} />
      )}
    </MainLayout>
  );
}
