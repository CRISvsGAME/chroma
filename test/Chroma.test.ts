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
    });

    it("throws when max is not finite", () => {
        expect(() => Chroma.randomInt(10, Number.NaN)).toThrow();
        expect(() => Chroma.randomInt(10, Number.POSITIVE_INFINITY)).toThrow();
    });

    it("throws when the integer range is empty", () => {
        expect(() => Chroma.randomInt(10.2, 10.8)).toThrow();
        expect(() => Chroma.randomInt(20, 10)).toThrow();
    });
});
