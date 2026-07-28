"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice?: number;
  imageUrl?: string;
  url?: string;
  observations?: string;
}

interface CartState {
  items: CartItem[];
  generalNote: string;
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateObservations: (productId: string, observations: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setGeneralNote: (note: string) => void;
  totalItems: number;
}

const STORAGE_KEY = "vortech_quote_cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartState {
  if (typeof window === "undefined") return { items: [], generalNote: "" };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        generalNote: typeof parsed.generalNote === "string" ? parsed.generalNote : "",
      };
    }
  } catch {
    // Ignore corrupted storage
  }
  return { items: [], generalNote: "" };
}

function saveToStorage(state: CartState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [], generalNote: "" });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage on changes (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveToStorage(state);
    }
  }, [state, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...prev,
        items: [...prev.items, { ...item, quantity: item.quantity || 1 }],
      };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }));
  }, []);

  const updateObservations = useCallback((productId: string, observations: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId ? { ...i, observations } : i
      ),
    }));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState({ items: [], generalNote: "" });
  }, []);

  const setGeneralNote = useCallback((note: string) => {
    setState((prev) => ({ ...prev, generalNote: note }));
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateQuantity,
        updateObservations,
        removeItem,
        clearCart,
        setGeneralNote,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useQuoteCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useQuoteCart must be used within a QuoteCartProvider");
  }
  return context;
}
