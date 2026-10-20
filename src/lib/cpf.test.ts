import { describe, expect, it } from "vitest";
import { cpfOk } from "./cpf";

describe("cpfOk", () => {
  it("aceita CPF válido com ou sem máscara", () => {
    expect(cpfOk("529.982.247-25")).toBe(true);
    expect(cpfOk("52998224725")).toBe(true);
  });
  it("recusa dígito verificador errado", () => {
    expect(cpfOk("529.982.247-24")).toBe(false);
  });
  it("recusa números repetidos e tamanho errado", () => {
    expect(cpfOk("111.111.111-11")).toBe(false);
    expect(cpfOk("5299822472")).toBe(false);
  });
});
