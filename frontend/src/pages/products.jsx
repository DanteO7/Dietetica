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
    if (!openDetail) return;

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !document.querySelector("[data-modal-dialog]")
      ) {
        setOpenDetail(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openDetail]);

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
      if (
        document.querySelector("[data-modal-dialog]") ||
        e.defaultPrevented ||
        e.target.closest?.(
          "input, textarea, select, [contenteditable='true'], button, a, [data-keyboard-nav-item]",
        )
      )
        return;

      if (e.key === "Enter") {
        clearTimeout(timeout);
        if (buffer.length > 0) {
          handleScan(buffer);
          buffer = "";
        }
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      clearTimeout(timeout);
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
      <div className="flex w-full h-[calc(100vh-64px)] min-h-0">
        <div
          className={`overflow-y-auto min-h-0 transition-all duration-300 ${openDetail ? "w-[60%]" : "w-full"}`}
        >
          <SearchFilters
            disabledEscaner={() => setScannerEnabled(false)}
            enableScanner={() => setScannerEnabled(true)}
          />
          <div>
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
          </div>
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
