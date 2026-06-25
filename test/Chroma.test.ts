import { afterEach, describe, expect, it, vi } from "vitest";
import { Chroma } from "../src/index.js";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Chroma.randomInt", () => {
    it("returns the minimum value when Math.random() returns 0", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        expect(Chroma.randomInt(10, 20)).toBe(10);
    });

    it("can return the maximum value", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.9999999999999999);

        expect(Chroma.randomInt(10, 20)).toBe(20);
    });

    it("supports a single-value range", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);

        expect(Chroma.randomInt(10, 10)).toBe(10);
    });

    it("supports negative integer ranges", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        expect(Chroma.randomInt(-20, -10)).toBe(-20);
    });

    it("returns an integer inside the inclusive range", () => {
        for (let i = 0; i < 1000; i++) {
            const value = Chroma.randomInt(-10, 20);

            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(-10);
            expect(value).toBeLessThanOrEqual(20);
        }
    });

    it("ceils/floors decimal bounds before generating the integer range", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        expect(Chroma.randomInt(10.2, 20.8)).toBe(11);
    });

    it("throws when min is not finite", () => {
        expect(() => Chroma.randomInt(Number.NaN, 20)).toThrow();
        expect(() => Chroma.randomInt(Number.POSITIVE_INFINITY, 20)).toThrow();
        expect(() => Chroma.randomInt(Number.NEGATIVE_INFINITY, 20)).toThrow();
    });

    it("throws when max is not finite", () => {
        expect(() => Chroma.randomInt(10, Number.NaN)).toThrow();
        expect(() => Chroma.randomInt(10, Number.POSITIVE_INFINITY)).toThrow();
        expect(() => Chroma.randomInt(10, Number.NEGATIVE_INFINITY)).toThrow();
    });

    it("throws when the integer range is empty", () => {
        expect(() => Chroma.randomInt(10.2, 10.8)).toThrow();
        expect(() => Chroma.randomInt(20, 10)).toThrow();
    });
});

describe("Chroma.randomFloat", () => {
    it("returns the minimum value when Math.random() returns 0", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        expect(Chroma.randomFloat(10, 20)).toBe(10);
    });

    it("cannot return the maximum value", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.9999999999999999);

        const value = Chroma.randomFloat(10, 20);

        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThan(20);
    });

    it("supports negative ranges", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);

        expect(Chroma.randomFloat(-20, -10)).toBeCloseTo(-15);
    });

    it("supports decimal bounds", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);

        expect(Chroma.randomFloat(10.5, 20.5)).toBeCloseTo(15.5);
    });

    it("returns a number inside the half-open range", () => {
        for (let i = 0; i < 1000; i++) {
            const value = Chroma.randomFloat(-10, 20);

            expect(value).toBeGreaterThanOrEqual(-10);
            expect(value).toBeLessThan(20);
        }
    });

    it("throws when min is not finite", () => {
        expect(() => Chroma.randomFloat(Number.NaN, 20)).toThrow();
        expect(() => Chroma.randomFloat(Number.POSITIVE_INFINITY, 20)).toThrow();
        expect(() => Chroma.randomFloat(Number.NEGATIVE_INFINITY, 20)).toThrow();
    });

    it("throws when max is not finite", () => {
        expect(() => Chroma.randomFloat(10, Number.NaN)).toThrow();
        expect(() => Chroma.randomFloat(10, Number.POSITIVE_INFINITY)).toThrow();
        expect(() => Chroma.randomFloat(10, Number.NEGATIVE_INFINITY)).toThrow();
    });

    it("throws when max is equal to min", () => {
        expect(() => Chroma.randomFloat(10, 10)).toThrow();
    });

    it("throws when max is less than min", () => {
        expect(() => Chroma.randomFloat(20, 10)).toThrow();
    });
});

describe("Chroma.randomRgb", () => {
    it("returns an RGB object with r, g, and b channels", () => {
        vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.9999999999999999);

        expect(Chroma.randomRgb()).toEqual({ r: 0, g: 128, b: 255 });
    });

    it("returns integer channels inside the RGB range", () => {
        for (let i = 0; i < 1000; i++) {
            const rgb = Chroma.randomRgb();

            expect(Number.isInteger(rgb.r)).toBe(true);
            expect(Number.isInteger(rgb.g)).toBe(true);
            expect(Number.isInteger(rgb.b)).toBe(true);

            expect(rgb.r).toBeGreaterThanOrEqual(0);
            expect(rgb.r).toBeLessThanOrEqual(255);

            expect(rgb.g).toBeGreaterThanOrEqual(0);
            expect(rgb.g).toBeLessThanOrEqual(255);

            expect(rgb.b).toBeGreaterThanOrEqual(0);
            expect(rgb.b).toBeLessThanOrEqual(255);
        }
    });
});

describe("Chroma.rgbToCss", () => {
    it("converts an RGB object to a CSS rgb() string", () => {
        expect(Chroma.rgbToCss({ r: 12, g: 34, b: 56 })).toBe("rgb(12, 34, 56)");
    });

    it("supports minimum RGB channel values", () => {
        expect(Chroma.rgbToCss({ r: 0, g: 0, b: 0 })).toBe("rgb(0, 0, 0)");
    });

    it("supports maximum RGB channel values", () => {
        expect(Chroma.rgbToCss({ r: 255, g: 255, b: 255 })).toBe("rgb(255, 255, 255)");
    });

    it("throws when a channel is below 0", () => {
        expect(() => Chroma.rgbToCss({ r: -1, g: 0, b: 0 })).toThrow();
    });

    it("throws when a channel is above 255", () => {
        expect(() => Chroma.rgbToCss({ r: 256, g: 0, b: 0 })).toThrow();
    });

    it("throws when a channel is not an integer", () => {
        expect(() => Chroma.rgbToCss({ r: 12.5, g: 0, b: 0 })).toThrow();
    });

    it("throws when a channel is not finite", () => {
        expect(() => Chroma.rgbToCss({ r: Number.NaN, g: 0, b: 0 })).toThrow();
        expect(() => Chroma.rgbToCss({ r: Number.POSITIVE_INFINITY, g: 0, b: 0 })).toThrow();
        expect(() => Chroma.rgbToCss({ r: Number.NEGATIVE_INFINITY, g: 0, b: 0 })).toThrow();
    });
});

describe("Chroma.contrast", () => {
    it("returns 21 for black and white", () => {
        expect(Chroma.contrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21);
    });

    it("returns 1 for identical colours", () => {
        expect(Chroma.contrast({ r: 120, g: 80, b: 40 }, { r: 120, g: 80, b: 40 })).toBeCloseTo(1);
    });

    it("returns the same ratio regardless of colour order", () => {
        const first = { r: 30, g: 60, b: 90 };
        const second = { r: 220, g: 230, b: 240 };

        expect(Chroma.contrast(first, second)).toBeCloseTo(Chroma.contrast(second, first));
    });

    it("returns a known WCAG contrast ratio", () => {
        expect(Chroma.contrast({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 })).toBeCloseTo(2.1489, 4);
    });

    it("throws when the first RGB colour is invalid", () => {
        expect(() => Chroma.contrast({ r: -1, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toThrow();
    });

    it("throws when the second RGB colour is invalid", () => {
        expect(() => Chroma.contrast({ r: 0, g: 0, b: 0 }, { r: 256, g: 255, b: 255 })).toThrow();
    });
});

describe("Chroma.meetsContrast", () => {
    it("returns true when colours meet the default WCAG AA normal ratio", () => {
        expect(Chroma.meetsContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBe(true);
    });

    it("returns false when colours do not meet the default WCAG AA normal ratio", () => {
        expect(Chroma.meetsContrast({ r: 120, g: 120, b: 120 }, { r: 130, g: 130, b: 130 })).toBe(false);
    });

    it("supports a custom contrast ratio", () => {
        expect(Chroma.meetsContrast({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 2)).toBe(true);
        expect(Chroma.meetsContrast({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 3)).toBe(false);
    });

    it("returns true when the contrast is exactly equal to the requested ratio", () => {
        expect(Chroma.meetsContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 21)).toBe(true);
    });

    it("throws when the first RGB colour is invalid", () => {
        expect(() => Chroma.meetsContrast({ r: -1, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toThrow();
    });

    it("throws when the second RGB colour is invalid", () => {
        expect(() => Chroma.meetsContrast({ r: 0, g: 0, b: 0 }, { r: 256, g: 255, b: 255 })).toThrow();
    });

    it("throws when the contrast ratio is invalid", () => {
        expect(() => Chroma.meetsContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 0)).toThrow();
        expect(() => Chroma.meetsContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 22)).toThrow();
        expect(() => Chroma.meetsContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, Number.NaN)).toThrow();
    });
});

describe("Chroma.adjustToContrast", () => {
    it("adjusts a colour to meet the default WCAG AA normal contrast ratio", () => {
        const base = { r: 0, g: 0, b: 0 };
        const color = { r: 0, g: 0, b: 0 };
        const adjusted = Chroma.adjustToContrast(base, color);

        expect(Chroma.meetsContrast(base, adjusted)).toBe(true);
    });

    it("supports a custom contrast ratio", () => {
        const base = { r: 0, g: 0, b: 0 };
        const color = { r: 0, g: 0, b: 0 };
        const adjusted = Chroma.adjustToContrast(base, color, { ratio: Chroma.WCAG_AAA_NORMAL });

        expect(Chroma.meetsContrast(base, adjusted, Chroma.WCAG_AAA_NORMAL)).toBe(true);
    });

    it("returns a valid RGB colour", () => {
        const adjusted = Chroma.adjustToContrast({ r: 50, g: 100, b: 150 }, { r: 60, g: 110, b: 160 });

        expect(Number.isInteger(adjusted.r)).toBe(true);
        expect(Number.isInteger(adjusted.g)).toBe(true);
        expect(Number.isInteger(adjusted.b)).toBe(true);

        expect(adjusted.r).toBeGreaterThanOrEqual(0);
        expect(adjusted.r).toBeLessThanOrEqual(255);

        expect(adjusted.g).toBeGreaterThanOrEqual(0);
        expect(adjusted.g).toBeLessThanOrEqual(255);

        expect(adjusted.b).toBeGreaterThanOrEqual(0);
        expect(adjusted.b).toBeLessThanOrEqual(255);
    });

    it("can adjust in the lighter direction", () => {
        const base = { r: 0, g: 0, b: 0 };
        const color = { r: 0, g: 0, b: 0 };

        const adjusted = Chroma.adjustToContrast(base, color, { direction: "lighter" });

        expect(Chroma.meetsContrast(base, adjusted)).toBe(true);
        expect(Chroma.contrast(base, adjusted)).toBeGreaterThanOrEqual(Chroma.WCAG_AA_NORMAL);
    });

    it("can adjust in the darker direction", () => {
        const base = { r: 255, g: 255, b: 255 };
        const color = { r: 255, g: 255, b: 255 };
        const adjusted = Chroma.adjustToContrast(base, color, { direction: "darker" });

        expect(Chroma.meetsContrast(base, adjusted)).toBe(true);
        expect(Chroma.contrast(base, adjusted)).toBeGreaterThanOrEqual(Chroma.WCAG_AA_NORMAL);
    });

    it("supports flexible adjustment", () => {
        const base = { r: 0, g: 0, b: 0 };
        const color = { r: 0, g: 0, b: 0 };
        const adjusted = Chroma.adjustToContrast(base, color, { flexible: true });

        expect(Chroma.meetsContrast(base, adjusted)).toBe(true);
        expect(Chroma.contrast(base, adjusted)).toBeGreaterThanOrEqual(Chroma.WCAG_AA_NORMAL);
    });

    it("throws when the base colour is invalid", () => {
        expect(() => Chroma.adjustToContrast({ r: -1, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toThrow();
    });

    it("throws when the colour to adjust is invalid", () => {
        expect(() => Chroma.adjustToContrast({ r: 0, g: 0, b: 0 }, { r: 256, g: 255, b: 255 })).toThrow();
    });

    it("throws when the contrast ratio is invalid", () => {
        expect(() => Chroma.adjustToContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { ratio: 0 })).toThrow();
        expect(() => Chroma.adjustToContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { ratio: 22 })).toThrow();
        expect(() => Chroma.adjustToContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { ratio: Number.NaN })).toThrow();
    });

    it("throws when the contrast direction is invalid", () => {
        expect(() => Chroma.adjustToContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { direction: "invalid" as never })).toThrow();
    });

    it("throws when flexible is not a boolean", () => {
        expect(() => Chroma.adjustToContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { flexible: "yes" as never })).toThrow();
    });
});

describe("Chroma.randomWithContrast", () => {
    it("returns a colour that meets the default WCAG AA normal contrast ratio", () => {
        const base = { r: 0, g: 0, b: 0 };
        const result = Chroma.randomWithContrast(base);

        expect(Chroma.meetsContrast(base, result)).toBe(true);
    });

    it("returns a valid RGB colour", () => {
        const result = Chroma.randomWithContrast({ r: 50, g: 100, b: 150 });

        expect(Number.isInteger(result.r)).toBe(true);
        expect(Number.isInteger(result.g)).toBe(true);
        expect(Number.isInteger(result.b)).toBe(true);

        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);

        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);

        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
    });

    it("supports a custom contrast ratio", () => {
        const base = { r: 0, g: 0, b: 0 };
        const result = Chroma.randomWithContrast(base, { ratio: Chroma.WCAG_AAA_NORMAL });

        expect(Chroma.meetsContrast(base, result, Chroma.WCAG_AAA_NORMAL)).toBe(true);
    });

    it("supports direction options", () => {
        const base = { r: 255, g: 255, b: 255 };
        const result = Chroma.randomWithContrast(base, { direction: "darker" });

        expect(Chroma.meetsContrast(base, result)).toBe(true);
    });

    it("supports flexible adjustment", () => {
        const base = { r: 0, g: 0, b: 0 };
        const result = Chroma.randomWithContrast(base, { flexible: true });

        expect(Chroma.meetsContrast(base, result)).toBe(true);
    });

    it("throws when the base colour is invalid", () => {
        expect(() => Chroma.randomWithContrast({ r: -1, g: 0, b: 0 })).toThrow();
    });

    it("throws when the contrast ratio is invalid", () => {
        expect(() => Chroma.randomWithContrast({ r: 0, g: 0, b: 0 }, { ratio: 0 })).toThrow();
        expect(() => Chroma.randomWithContrast({ r: 0, g: 0, b: 0 }, { ratio: 22 })).toThrow();
        expect(() => Chroma.randomWithContrast({ r: 0, g: 0, b: 0 }, { ratio: Number.NaN })).toThrow();
    });

    it("throws when the contrast direction is invalid", () => {
        expect(() => Chroma.randomWithContrast({ r: 0, g: 0, b: 0 }, { direction: "invalid" as never })).toThrow();
    });

    it("throws when flexible is not a boolean", () => {
        expect(() => Chroma.randomWithContrast({ r: 0, g: 0, b: 0 }, { flexible: "yes" as never })).toThrow();
    });
});
