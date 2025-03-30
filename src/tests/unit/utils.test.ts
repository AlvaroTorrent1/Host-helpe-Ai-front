/**
 * Tests unitarios para funciones de utilidad
 */

import { describe, test, expect } from "vitest";
import { getThemeValue } from "../../config/theme";

describe("Theme Utils", () => {
  test("getThemeValue debe retornar el valor correcto de un color primario", () => {
    const result = getThemeValue("colors", "primary", "500");
    expect(result).toBe("#0ea5e9");
  });

  test("getThemeValue debe retornar el valor correcto del espaciado", () => {
    const result = getThemeValue("spacing", "md");
    expect(result).toBe("1rem");
  });

  test("getThemeValue debe retornar string vacío si la clave no existe", () => {
    const result = getThemeValue("colors", "nonexistent");
    expect(result).toBe("");
  });

  test("getThemeValue debe retornar string vacío si la subclave no existe", () => {
    const result = getThemeValue("colors", "primary", "nonexistent");
    expect(result).toBe("");
  });
});
