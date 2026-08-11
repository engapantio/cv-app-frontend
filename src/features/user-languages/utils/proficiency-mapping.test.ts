import { PROFICIENCY_MAP, PROFICIENCY_OPTIONS } from "./proficiency-mapping";

describe("proficiency-mapping", () => {
  it("maps every proficiency level to a color", () => {
    for (const level of PROFICIENCY_OPTIONS) {
      expect(PROFICIENCY_MAP[level]).toBeDefined();
      expect(PROFICIENCY_MAP[level].color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("covers every expected proficiency level", () => {
    expect(PROFICIENCY_OPTIONS).toEqual(["A1", "A2", "B1", "B2", "C1", "C2", "Native"]);
  });
});
