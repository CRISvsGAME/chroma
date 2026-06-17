export type Rgb = {
    r: number;
    g: number;
    b: number;
};

export type ContrastDirection = "lighter" | "darker" | "nearest";

type NumberRange = {
    min: number;
    size: number;
};

type LinearRgb = {
    r: number;
    g: number;
    b: number;
};

type LuminanceRange = {
    min: number;
    max: number;
} | null;

type LuminanceRanges = {
    lighter: LuminanceRange;
    darker: LuminanceRange;
};

type ContrastSide = "lighter" | "darker";

type LinearRgbContrastAdjustment = {
    linearRgb: LinearRgb;
    side: ContrastSide;
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

    private static validateContrastDirection(direction: ContrastDirection): void {
        if (direction !== "lighter" && direction !== "darker" && direction !== "nearest") {
            throw new TypeError("The 'direction' must be 'lighter', 'darker', or 'nearest'.");
        }
    }

    private static lighterRelativeLuminanceForContrastRatio(luminance: number, ratio: number): number {
        return ratio * (luminance + 0.05) - 0.05;
    }

    private static darkerRelativeLuminanceForContrastRatio(luminance: number, ratio: number): number {
        return (luminance + 0.05) / ratio - 0.05;
    }

    private static luminanceRangesForContrastRatio(luminance: number, ratio: number): LuminanceRanges {
        const lighterMin = this.lighterRelativeLuminanceForContrastRatio(luminance, ratio);
        const darkerMax = this.darkerRelativeLuminanceForContrastRatio(luminance, ratio);

        return {
            lighter: lighterMin <= 1 ? { min: lighterMin, max: 1 } : null,
            darker: darkerMax >= 0 ? { min: 0, max: darkerMax } : null,
        };
    }

    private static linearRgbWithRelativeLuminance(linearRgb: LinearRgb, luminance: number): LinearRgb {
        const currentLuminance = this.linearRgbRelativeLuminance(linearRgb);
        const { r, g, b } = linearRgb;

        if (luminance < currentLuminance) {
            const scale = luminance / currentLuminance;

            return {
                r: r * scale,
                g: g * scale,
                b: b * scale,
            };
        }

        if (luminance > currentLuminance) {
            const scale = (luminance - currentLuminance) / (1 - currentLuminance);

            return {
                r: r + (1 - r) * scale,
                g: g + (1 - g) * scale,
                b: b + (1 - b) * scale,
            };
        }

        return linearRgb;
    }

    private static linearRgbContrastAdjustment(base: LinearRgb, color: LinearRgb, ratio: number, direction: ContrastDirection): LinearRgbContrastAdjustment {
        const baseLuminance = this.linearRgbRelativeLuminance(base);
        const colorLuminance = this.linearRgbRelativeLuminance(color);
        const { lighter, darker } = this.luminanceRangesForContrastRatio(baseLuminance, ratio);

        if (direction === "lighter") {
            if (!lighter) {
                throw new RangeError("Cannot adjust to a lighter color that meets the contrast ratio.");
            }

            return {
                linearRgb: this.linearRgbWithRelativeLuminance(color, lighter.min),
                side: "lighter",
            };
        }

        if (direction === "darker") {
            if (!darker) {
                throw new RangeError("Cannot adjust to a darker color that meets the contrast ratio.");
            }

            return {
                linearRgb: this.linearRgbWithRelativeLuminance(color, darker.max),
                side: "darker",
            };
        }

        if (lighter && darker) {
            const lighterDistance = Math.abs(colorLuminance - lighter.min);
            const darkerDistance = Math.abs(colorLuminance - darker.max);

            if (lighterDistance <= darkerDistance) {
                return {
                    linearRgb: this.linearRgbWithRelativeLuminance(color, lighter.min),
                    side: "lighter",
                };
            }

            return {
                linearRgb: this.linearRgbWithRelativeLuminance(color, darker.max),
                side: "darker",
            };
        }

        if (lighter) {
            return {
                linearRgb: this.linearRgbWithRelativeLuminance(color, lighter.min),
                side: "lighter",
            };
        }

        if (darker) {
            return {
                linearRgb: this.linearRgbWithRelativeLuminance(color, darker.max),
                side: "darker",
            };
        }

        throw new RangeError("Cannot adjust to a color that meets the contrast ratio.");
    }

    private static linearChannelToEncodedRgbChannel(channel: number): number {
        return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
    }

    private static linearChannelToRgbChannelFloor(channel: number): number {
        return Math.floor(this.linearChannelToEncodedRgbChannel(channel) * 255);
    }

    private static linearChannelToRgbChannelCeil(channel: number): number {
        return Math.ceil(this.linearChannelToEncodedRgbChannel(channel) * 255);
    }

    private static linearRgbToRgbFloor({ r, g, b }: LinearRgb): Rgb {
        return {
            r: this.linearChannelToRgbChannelFloor(r),
            g: this.linearChannelToRgbChannelFloor(g),
            b: this.linearChannelToRgbChannelFloor(b),
        };
    }

    private static linearRgbToRgbCeil({ r, g, b }: LinearRgb): Rgb {
        return {
            r: this.linearChannelToRgbChannelCeil(r),
            g: this.linearChannelToRgbChannelCeil(g),
            b: this.linearChannelToRgbChannelCeil(b),
        };
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

    public static adjustToContrast(base: Rgb, color: Rgb, ratio: number, direction: ContrastDirection = "nearest"): Rgb {
        this.validateRgb(base);
        this.validateRgb(color);
        this.validateContrastRatio(ratio);
        this.validateContrastDirection(direction);

        const adjustment = this.linearRgbContrastAdjustment(this.rgbToLinearRgb(base), this.rgbToLinearRgb(color), ratio, direction);

        if (adjustment.side === "lighter") {
            return this.linearRgbToRgbCeil(adjustment.linearRgb);
        }

        return this.linearRgbToRgbFloor(adjustment.linearRgb);
    }
}
