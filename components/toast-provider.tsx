"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0e1a2b",
          color: "#f8fbff",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
        },
        success: {
          iconTheme: { primary: "#13d8ff", secondary: "#0e1a2b" },
        },
        error: {
          iconTheme: { primary: "#f87171", secondary: "#0e1a2b" },
        },
      }}
    />
  );
}
