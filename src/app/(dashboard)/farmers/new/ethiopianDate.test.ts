import { describe, expect, it } from "vitest";
import { toEthiopianDate } from "./ethiopianDate";

describe("toEthiopianDate", () => {
  it("starts the Ethiopian year on 11 September", () => {
    expect(toEthiopianDate("2025-09-11")).toBe("01/01/2018");
    expect(toEthiopianDate("2026-09-11")).toBe("01/01/2019");
  });

  it("converts a date inside the year", () => {
    expect(toEthiopianDate("2026-10-23")).toBe("13/02/2019");
  });

  it("counts Pagume, and starts the year on 12 September after a Gregorian leap year", () => {
    expect(toEthiopianDate("2026-09-10")).toBe("05/13/2018");
    expect(toEthiopianDate("2023-09-12")).toBe("01/01/2016");
    expect(toEthiopianDate("2023-09-11")).toBe("06/13/2015");
  });

  it("returns nothing for an empty or malformed date", () => {
    expect(toEthiopianDate("")).toBe("");
    expect(toEthiopianDate("23/10/2026")).toBe("");
  });
});
