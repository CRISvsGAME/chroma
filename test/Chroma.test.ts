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

        expect(Chroma.randomRgb()).toEqual({
            r: 0,
            g: 128,
            b: 255,
        });
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
        expect(
            Chroma.rgbToCss({
                r: 12,
                g: 34,
                b: 56,
            }),
        ).toBe("rgb(12, 34, 56)");
    });

    it("supports minimum RGB channel values", () => {
        expect(
            Chroma.rgbToCss({
                r: 0,
                g: 0,
                b: 0,
            }),
        ).toBe("rgb(0, 0, 0)");
    });

    it("supports maximum RGB channel values", () => {
        expect(
            Chroma.rgbToCss({
                r: 255,
                g: 255,
                b: 255,
            }),
        ).toBe("rgb(255, 255, 255)");
    });

    it("throws when a channel is below 0", () => {
        expect(() =>
            Chroma.rgbToCss({
                r: -1,
                g: 0,
                b: 0,
            }),
        ).toThrow();
    });

    it("throws when a channel is above 255", () => {
        expect(() =>
            Chroma.rgbToCss({
                r: 256,
                g: 0,
                b: 0,
            }),
        ).toThrow();
    });

    it("throws when a channel is not an integer", () => {
        expect(() =>
            Chroma.rgbToCss({
                r: 12.5,
                g: 0,
                b: 0,
            }),
        ).toThrow();
    });

    it("throws when a channel is not finite", () => {
        expect(() =>
            Chroma.rgbToCss({
                r: Number.NaN,
                g: 0,
                b: 0,
            }),
        ).toThrow();

        expect(() =>
            Chroma.rgbToCss({
                r: Number.POSITIVE_INFINITY,
                g: 0,
                b: 0,
            }),
        ).toThrow();

        expect(() =>
            Chroma.rgbToCss({
                r: Number.NEGATIVE_INFINITY,
                g: 0,
                b: 0,
            }),
        ).toThrow();
    });
});
