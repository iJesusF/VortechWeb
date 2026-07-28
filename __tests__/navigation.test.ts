import { describe, it, expect } from "vitest";
import { siteConfig } from "@/lib/site-config";

describe("Navigation Configuration", () => {
  it("includes Catálogo in navItems", () => {
    const catalogItem = siteConfig.navItems.find((item) => item.label === "Catálogo");
    expect(catalogItem).toBeDefined();
    expect(catalogItem!.href).toBe("/catalogo");
  });

  it("includes Contacto in navItems", () => {
    const contactItem = siteConfig.navItems.find((item) => item.label === "Contacto");
    expect(contactItem).toBeDefined();
    expect(contactItem!.href).toBe("/#contacto");
  });

  it("includes Inicio in navItems", () => {
    const homeItem = siteConfig.navItems.find((item) => item.label === "Inicio");
    expect(homeItem).toBeDefined();
    expect(homeItem!.href).toBe("/");
  });

  it("all anchor links start with /#", () => {
    const anchorItems = siteConfig.navItems.filter((item) => item.isAnchor);
    anchorItems.forEach((item) => {
      expect(item.href).toMatch(/^\/#/);
    });
  });

  it("non-anchor links start with /", () => {
    const pageItems = siteConfig.navItems.filter((item) => !item.isAnchor);
    pageItems.forEach((item) => {
      expect(item.href).toMatch(/^\//);
    });
  });

  it("no empty href values", () => {
    siteConfig.navItems.forEach((item) => {
      expect(item.href).not.toBe("");
      expect(item.href).not.toBe("#");
    });
  });

  it("navItems has correct total count", () => {
    expect(siteConfig.navItems.length).toBe(7);
  });

  it("whatsapp number is configured", () => {
    expect(siteConfig.whatsapp).toBeDefined();
    expect(siteConfig.whatsapp.length).toBeGreaterThan(5);
  });
});
