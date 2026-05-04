import { useRef, useEffect, useState, useCallback } from "react";
import { useInfiniteProducts } from "../hooks/useInfiniteProducts";
import ProductItem from "../components/products/product-item";
import MainLayout from "../layouts/main-layout";
import ProductDetail from "../components/products/product-detail";
import SearchFilters from "../components/products/search-filters";
import { getProductByCode } from "../services/product";

export default function Products() {
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [productSelected, setProductSelected] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const sentinelRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts();

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScan = useCallback(async (code) => {
    try {
      const product = await getProductByCode(code);
      setProductSelected(product);
      setOpenDetail(true);
    } catch {
      alert("Producto no encontrado");
    }
  }, []);

  useEffect(() => {
    if (!scannerEnabled) return;
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
  }, [handleScan, scannerEnabled]);

  return (
    <MainLayout>
      <div className="flex w-full">
        <div
          className={`overflow-y-auto scrollbar-hide transition-all duration-300 ${openDetail ? "w-[60%]" : "w-full"}`}
        >
          <SearchFilters
            disabledEscaner={() => setScannerEnabled(false)}
            enableScanner={() => setScannerEnabled(true)}
          />
          {products.map((p) => (
            <ProductItem
              key={p.id}
              product={p}
              openDetail={setOpenDetail}
              productSelected={setProductSelected}
              disabledEscaner={() => setScannerEnabled(false)}
              enableScanner={() => setScannerEnabled(true)}
            />
          ))}
          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <p className="text-center py-4 text-sm text-gray-400">
              Cargando más...
            </p>
          )}
        </div>

        {openDetail && (
          <ProductDetail
            product={productSelected}
            productSelected={setProductSelected}
            openDetail={setOpenDetail}
            disabledEscaner={() => setScannerEnabled(false)}
            enableScanner={() => setScannerEnabled(true)}
          />
        )}
      </div>
    </MainLayout>
  );
}
