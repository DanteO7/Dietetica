import { useCallback, useEffect, useRef, useState } from "react";

const NAVIGABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
  "[data-keyboard-nav-item]",
].join(", ");

const EDITABLE_SELECTOR =
  "input, textarea, select, [contenteditable='true']";
const CHECKABLE_SELECTOR =
  "input[type='checkbox'], input[type='radio'], [role='checkbox'], [role='radio'], [role='switch']";
const INTERACTIVE_ROLE_SELECTOR =
  "[role='combobox'], [role='listbox'], [role='slider'], [role='spinbutton'], [role='textbox'], [role='searchbox'], [role='tree'], [role='grid'], [role='menu']";

function isVisibleAndEnabled(element) {
  if (
    element.matches(":disabled, [aria-disabled='true']") ||
    element.closest("[hidden], [inert], [aria-hidden='true']")
  ) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.visibility !== "collapse" &&
    element.getClientRects().length > 0
  );
}

function getNavigationScope() {
  const dialogs = Array.from(
    document.querySelectorAll("[data-modal-dialog]"),
  ).filter(isVisibleAndEnabled);
  return dialogs.at(-1) || document;
}

function getNavigableElements(scope) {
  return Array.from(scope.querySelectorAll(NAVIGABLE_SELECTOR)).filter(
    isVisibleAndEnabled,
  );
}

function getCenter(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export default function useKeyboardNavigation() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const enabledRef = useRef(false);
  const interactingRef = useRef(false);
  const selectedRef = useRef(null);
  const ctrlPressedRef = useRef(false);
  const ctrlChordRef = useRef(false);

  const toggleMode = useCallback(() => {
    const nextEnabled = !enabledRef.current;
    enabledRef.current = nextEnabled;
    setIsEnabled(nextEnabled);
    interactingRef.current = false;
    setIsInteracting(false);

    if (!nextEnabled && selectedRef.current) {
      selectedRef.current.removeAttribute("data-keyboard-selected");
      selectedRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleFocusIn = (event) => {
      const current =
        event.target instanceof Element
          ? event.target.closest(NAVIGABLE_SELECTOR)
          : null;
      const previous = selectedRef.current;

      if (previous && previous !== current) {
        previous.removeAttribute("data-keyboard-selected");
      }

      selectedRef.current = current instanceof HTMLElement ? current : null;
      selectedRef.current?.setAttribute("data-keyboard-selected", "true");

      if (interactingRef.current && previous !== current) {
        interactingRef.current = false;
        setIsInteracting(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Control" && !event.repeat) {
        ctrlPressedRef.current = true;
        ctrlChordRef.current = false;
        return;
      }

      if (ctrlPressedRef.current && event.key !== "Control") {
        ctrlChordRef.current = true;
      }

      if (
        !enabledRef.current ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      if (event.key === "Escape" && interactingRef.current) {
        if (document.querySelector("[data-modal-dialog]")) return;
        event.preventDefault();
        interactingRef.current = false;
        setIsInteracting(false);
        selectedRef.current?.focus({ preventScroll: true });
        return;
      }

      if (event.key === "Enter") {
        const current =
          event.target instanceof Element
            ? event.target.closest(NAVIGABLE_SELECTOR)
            : null;
        if (!current) return;

        if (current.matches(CHECKABLE_SELECTOR)) {
          event.preventDefault();
          interactingRef.current = true;
          setIsInteracting(true);
          current.click();
          return;
        }

        if (
          current.matches(EDITABLE_SELECTOR) ||
          current.matches(INTERACTIVE_ROLE_SELECTOR) ||
          current.isContentEditable
        ) {
          const isFirstInputActivation =
            !interactingRef.current &&
            current.matches(
              "input:not([type='date']):not([type='time']):not([type='month']):not([type='week']):not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='file'])",
            );
          interactingRef.current = true;
          setIsInteracting(true);
          if (isFirstInputActivation) event.preventDefault();
          return;
        }

        if (
          (current.hasAttribute("data-keyboard-activate") ||
            current.matches("[role='button'], [role='link']")) &&
          !current.matches("button, a[href]")
        ) {
          event.preventDefault();
          current.click();
        }
        return;
      }

      const directionByKey = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const direction = directionByKey[event.key];
      if (!direction) return;

      if (interactingRef.current) return;

      const scope = getNavigationScope();
      const elements = getNavigableElements(scope);
      if (elements.length === 0) return;

      const current =
        event.target instanceof Element
          ? event.target.closest(NAVIGABLE_SELECTOR)
          : null;
      const origin = current
        ? getCenter(current)
        : event.target instanceof Element && event.target !== document.body
          ? getCenter(event.target)
          : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      let next = null;
      let nextScore = Infinity;

      elements.forEach((element) => {
        if (element === current) return;
        const point = getCenter(element);
        const dx = point.x - origin.x;
        const dy = point.y - origin.y;
        const forward =
          direction === "up"
            ? -dy
            : direction === "down"
              ? dy
              : direction === "left"
                ? -dx
                : dx;
        const perpendicular =
          direction === "up" || direction === "down"
            ? Math.abs(dx)
            : Math.abs(dy);

        if (forward <= 0) return;

        const score = Math.hypot(forward, perpendicular * 1.5);
        if (score < nextScore) {
          next = element;
          nextScore = score;
        }
      });

      event.preventDefault();
      if (next) {
        next.focus({ preventScroll: true });
        next.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    };

    const handleKeyUp = (event) => {
      if (event.key !== "Control" || !ctrlPressedRef.current) return;

      ctrlPressedRef.current = false;
      if (!ctrlChordRef.current) toggleMode();
      ctrlChordRef.current = false;
    };

    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);

    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
      selectedRef.current?.removeAttribute("data-keyboard-selected");
    };
  }, [toggleMode]);

  return { isEnabled, isInteracting };
}
