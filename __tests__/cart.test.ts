import { describe, it, expect, beforeEach } from "vitest";

// Test the cart logic without React (pure state management)
describe("Quote Cart Logic", () => {
  interface CartItem {
    productId: string;
    name: string;
    sku?: string;
    quantity: number;
    unitPrice?: number;
    observations?: string;
  }

  interface CartState {
    items: CartItem[];
    generalNote: string;
  }

  let state: CartState;

  beforeEach(() => {
    state = { items: [], generalNote: "" };
  });

  function addItem(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    const existing = state.items.find((i) => i.productId === item.productId);
    if (existing) {
      state = {
        ...state,
        items: state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        ),
      };
    } else {
      state = {
        ...state,
        items: [...state.items, { ...item, quantity: item.quantity || 1 }],
      };
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    state = {
      ...state,
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    };
  }

  function removeItem(productId: string) {
    state = {
      ...state,
      items: state.items.filter((i) => i.productId !== productId),
    };
  }

  function clearCart() {
    state = { items: [], generalNote: "" };
  }

  it("adds a product to cart", () => {
    addItem({ productId: "p1", name: "PLC" });
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(1);
  });

  it("increments quantity for duplicate product", () => {
    addItem({ productId: "p1", name: "PLC" });
    addItem({ productId: "p1", name: "PLC" });
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("adds different products separately", () => {
    addItem({ productId: "p1", name: "PLC" });
    addItem({ productId: "p2", name: "HMI" });
    expect(state.items.length).toBe(2);
  });

  it("updates quantity", () => {
    addItem({ productId: "p1", name: "PLC" });
    updateQuantity("p1", 5);
    expect(state.items[0].quantity).toBe(5);
  });

  it("does not set quantity below 1", () => {
    addItem({ productId: "p1", name: "PLC" });
    updateQuantity("p1", 0);
    expect(state.items[0].quantity).toBe(1);
  });

  it("removes item", () => {
    addItem({ productId: "p1", name: "PLC" });
    addItem({ productId: "p2", name: "HMI" });
    removeItem("p1");
    expect(state.items.length).toBe(1);
    expect(state.items[0].productId).toBe("p2");
  });

  it("clears cart", () => {
    addItem({ productId: "p1", name: "PLC" });
    addItem({ productId: "p2", name: "HMI" });
    state.generalNote = "Nota de prueba";
    clearCart();
    expect(state.items.length).toBe(0);
    expect(state.generalNote).toBe("");
  });

  it("handles product without price", () => {
    addItem({ productId: "p1", name: "Custom System", unitPrice: undefined });
    expect(state.items[0].unitPrice).toBeUndefined();
    expect(state.items.length).toBe(1);
  });

  it("handles product with observations", () => {
    addItem({ productId: "p1", name: "PLC", observations: "Necesito 24VDC" });
    expect(state.items[0].observations).toBe("Necesito 24VDC");
  });
});

describe("WhatsApp Message Generation", () => {
  function generateWhatsAppMessage(items: Array<{ name: string; sku?: string; quantity: number; url?: string; observations?: string }>, generalNote: string) {
    if (items.length === 0) return "";

    let message = "Hola, deseo solicitar una cotización para los siguientes productos:\n\n";

    items.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name}\n`;
      if (item.sku) message += `   SKU: ${item.sku}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      if (item.url) message += `   URL: https://vortech.mx${item.url}\n`;
      if (item.observations) message += `   Observaciones: ${item.observations}\n`;
      message += "\n";
    });

    if (generalNote) {
      message += `Nota general: ${generalNote}\n`;
    }

    return message;
  }

  it("generates message with all products", () => {
    const msg = generateWhatsAppMessage(
      [
        { name: "PLC Compacto", sku: "VT-001", quantity: 2, url: "/catalogo/plc", observations: "Con módulos extra" },
        { name: "HMI 10\"", quantity: 1 },
      ],
      "Urgente"
    );

    expect(msg).toContain("PLC Compacto");
    expect(msg).toContain("SKU: VT-001");
    expect(msg).toContain("Cantidad: 2");
    expect(msg).toContain("https://vortech.mx/catalogo/plc");
    expect(msg).toContain("Con módulos extra");
    expect(msg).toContain("HMI 10\"");
    expect(msg).toContain("Cantidad: 1");
    expect(msg).toContain("Nota general: Urgente");
  });

  it("omits undefined/null fields", () => {
    const msg = generateWhatsAppMessage(
      [{ name: "Producto", quantity: 1 }],
      ""
    );
    expect(msg).not.toContain("SKU:");
    expect(msg).not.toContain("URL:");
    expect(msg).not.toContain("Observaciones:");
    expect(msg).not.toContain("Nota general:");
    expect(msg).not.toContain("undefined");
  });

  it("returns empty string for empty cart", () => {
    const msg = generateWhatsAppMessage([], "");
    expect(msg).toBe("");
  });
});
