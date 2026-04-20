import { Suspense } from "react";
import ProductosPage from "./ProductosPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Cargando productos...</div>}>
      <ProductosPage />
    </Suspense>
  );
}