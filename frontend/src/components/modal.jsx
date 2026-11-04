import { useCallback, useEffect, forwardRef, useRef } from "react";
import { createPortal } from "react-dom";

let openModalCount = 0;

const Modal = forwardRef(function Modal(
  { open, onClose, children, isSuccesOrError, autoFocusFirst = true },
  forwardedRef,
) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusableSelector =
      "a[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [contenteditable='true'], [tabindex]:not([tabindex='-1'])";

    const focusFrame = requestAnimationFrame(() => {
      const firstFocusable = Array.from(
        dialog?.querySelectorAll(focusableSelector) ?? [],
      ).find((element) => element.getClientRects().length > 0);
      (autoFocusFirst && firstFocusable ? firstFocusable : dialog)?.focus();
    });

    const handleKeyDown = (e) => {
      const dialogs = document.querySelectorAll("[data-modal-dialog]");
      if (dialogs[dialogs.length - 1] !== dialog) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    openModalCount += 1;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      openModalCount -= 1;
      if (openModalCount === 0) document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [autoFocusFirst, open]);

  const setDialogRef = useCallback(
    (node) => {
      dialogRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        ref={setDialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-modal-dialog
        className={` bg-white rounded-xl ${isSuccesOrError ? "p-0" : "p-6"} w-120 shadow-xl
          max-h-[90vh] overflow-y-auto
          transition-all duration-300 ease-out
          translate-y-0 opacity-100
          animate-modal`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
});

export default Modal;
