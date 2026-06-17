export type Rgb = {
    r: number;
    g: number;
    b: number;
};

type NumberRange = {
    min: number;
    max: number;
    size: number;
};

type LinearRgb = {
    r: number;
    g: number;
    b: number;
};

export class Chroma {
    public static readonly WCAG_AA_LARGE = 3;
    public static readonly WCAG_AA_NORMAL = 4.5;
    public static readonly WCAG_AAA_LARGE = 4.5;
    public static readonly WCAG_AAA_NORMAL = 7;

    private static validateFiniteNumber(value: number, name: string): void {
        if (!Number.isFinite(value)) {
            throw new TypeError(`The '${name}' must be a finite number.`);
        }
    }

    private static getRandomIntRange(min: number, max: number): NumberRange {
        this.validateFiniteNumber(min, "min");
        this.validateFiniteNumber(max, "max");

        const normalizedMin = Math.ceil(min);
        const normalizedMax = Math.floor(max);

        if (normalizedMin > normalizedMax) {
            throw new RangeError("The random integer range must contain at least one integer.");
        }

        if (!Number.isSafeInteger(normalizedMin) || !Number.isSafeInteger(normalizedMax)) {
            throw new RangeError("The random integer range bounds must be safe integers.");
        }

        const rangeSize = normalizedMax - normalizedMin + 1;

        if (!Number.isSafeInteger(rangeSize)) {
            throw new RangeError("The random integer range size must be a safe integer.");
        }

        return {
            min: normalizedMin,
            max: normalizedMax,
            size: rangeSize,
        };
    }

    private static getRandomFloatRange(min: number, max: number): NumberRange {
        this.validateFiniteNumber(min, "min");
        this.validateFiniteNumber(max, "max");

        if (min >= max) {
            throw new RangeError("The random float range must have 'max' greater than 'min'.");
        }

        const rangeSize = max - min;

        if (!Number.isFinite(rangeSize)) {
            throw new RangeError("The random float range size must be a finite number.");
        }

        if (rangeSize <= 0) {
            throw new RangeError("The random float range size must be greater than zero.");
        }

        return {
            min,
            max,
            size: rangeSize,
        };
    }

    private static validateRgbChannel(channel: number, name: string): void {
        if (!Number.isInteger(channel)) {
            throw new TypeError(`The '${name}' RGB channel must be an integer.`);
        }

        if (channel < 0 || channel > 255) {
            throw new RangeError(`The '${name}' RGB channel must be between 0 and 255.`);
        }
    }

    private static validateRgb({ r, g, b }: Rgb): void {
        this.validateRgbChannel(r, "r");
        this.validateRgbChannel(g, "g");
        this.validateRgbChannel(b, "b");
    }

    private static rgbChannelToLinearChannel(channel: number): number {
        const n = channel / 255;

        return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    }

    private static rgbToLinearRgb({ r, g, b }: Rgb): LinearRgb {
        return {
            r: this.rgbChannelToLinearChannel(r),
            g: this.rgbChannelToLinearChannel(g),
            b: this.rgbChannelToLinearChannel(b),
        };
    }

    private static linearRgbRelativeLuminance({ r, g, b }: LinearRgb): number {
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    private static linearRgbContrastRatio(first: LinearRgb, second: LinearRgb): number {
        const firstLuminance = this.linearRgbRelativeLuminance(first);
        const secondLuminance = this.linearRgbRelativeLuminance(second);
        const lighter = Math.max(firstLuminance, secondLuminance);
        const darker = Math.min(firstLuminance, secondLuminance);

        return (lighter + 0.05) / (darker + 0.05);
    }

    private static validateContrastRatio(ratio: number): void {
        this.validateFiniteNumber(ratio, "ratio");

        if (ratio < 1 || ratio > 21) {
            throw new RangeError("The 'ratio' must be between 1 and 21.");
        }
    }

    public static randomInt(min: number, max: number): number {
        const range = this.getRandomIntRange(min, max);

        return Math.floor(Math.random() * range.size) + range.min;
    }

    public static randomFloat(min: number, max: number): number {
        const range = this.getRandomFloatRange(min, max);

        return Math.random() * range.size + range.min;
    }

    public static randomRgb(): Rgb {
        return {
            r: this.randomInt(0, 255),
            g: this.randomInt(0, 255),
            b: this.randomInt(0, 255),
        };
    }

    public static rgbToCss(rgb: Rgb): string {
        this.validateRgb(rgb);

        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    public static contrast(first: Rgb, second: Rgb): number {
        this.validateRgb(first);
        this.validateRgb(second);

        return this.linearRgbContrastRatio(this.rgbToLinearRgb(first), this.rgbToLinearRgb(second));
    }

    public static meetsContrast(first: Rgb, second: Rgb, ratio: number): boolean {
        this.validateRgb(first);
        this.validateRgb(second);
        this.validateContrastRatio(ratio);

        return this.linearRgbContrastRatio(this.rgbToLinearRgb(first), this.rgbToLinearRgb(second)) >= ratio;
    }
}
