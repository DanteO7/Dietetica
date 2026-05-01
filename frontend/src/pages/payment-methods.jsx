// import { useQuery } from "@tanstack/react-query";
// import MainLayout from "../layouts/main-layout";
// import { getPaymentMethods } from "../services/payment-method";
// import { useState } from "react";
// import CreateMethodForm from "../components/methods/create-method-result";

// export default function PaymentMethods() {
//   const [openCreateModal, setOpenCreateModal] = useState(false);
//   const {
//     data: methods,
//     error,
//     isLoading,
//   } = useQuery({
//     queryKey: ["getMethods"],
//     queryFn: getPaymentMethods,
//   });

//   return (
//     <MainLayout>
//       <h2 className="font-semibold text-3xl">Métodos de pago</h2>
//       <button onClick={() => setOpenCreateModal(true)}>Crear método</button>
//       <div>
//         {methods?.map((m) => (
//           <p>{m.name}</p>
//         ))}
//       </div>
//       {openCreateModal && (
//         <CreateMethodForm close={() => setOpenCreateModal(false)} />
//       )}
//     </MainLayout>
//   );
// }
