export type Srgb = {
    r: number;
    g: number;
    b: number;
};

export type LinearRgb = {
    r: number;
    g: number;
    b: number;
};

export type LuminanceRange = {
    min: number;
    max: number;
} | null;

export type LuminanceRanges = {
    lighter: LuminanceRange;
    darker: LuminanceRange;
};

export class Chroma {
    public static readonly WCAG_AA_LARGE = 3;
    public static readonly WCAG_AA_NORMAL = 4.5;
    public static readonly WCAG_AAA_LARGE = 4.5;
    public static readonly WCAG_AAA_NORMAL = 7;

    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public static randomSrgb(): Srgb {
        return {
            r: this.randomInt(0, 255),
            g: this.randomInt(0, 255),
            b: this.randomInt(0, 255),
        };
    }

    public static srgbToCss({ r, g, b }: Srgb): string {
        return `rgb(${r}, ${g}, ${b})`;
    }

    public static srgbChannelToLinearRgbChannel(channel: number): number {
        const n = channel / 255;

        return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    }

    private static linearRgbChannelToEncodedSrgbChannel(channel: number): number {
        return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
    }

    public static linearRgbChannelToSrgbChannel(channel: number): number {
        return Math.round(this.linearRgbChannelToEncodedSrgbChannel(channel) * 255);
    }

    public static linearRgbChannelToSrgbChannelFloor(channel: number): number {
        return Math.floor(this.linearRgbChannelToEncodedSrgbChannel(channel) * 255);
    }

    public static linearRgbChannelToSrgbChannelCeil(channel: number): number {
        return Math.ceil(this.linearRgbChannelToEncodedSrgbChannel(channel) * 255);
    }

    public static srgbToLinearRgb({ r, g, b }: Srgb): LinearRgb {
        return {
            r: this.srgbChannelToLinearRgbChannel(r),
            g: this.srgbChannelToLinearRgbChannel(g),
            b: this.srgbChannelToLinearRgbChannel(b),
        };
    }

    public static linearRgbToSrgb({ r, g, b }: LinearRgb): Srgb {
        return {
            r: this.linearRgbChannelToSrgbChannel(r),
            g: this.linearRgbChannelToSrgbChannel(g),
            b: this.linearRgbChannelToSrgbChannel(b),
        };
    }

    public static linearRgbToSrgbFloor({ r, g, b }: LinearRgb): Srgb {
        return {
            r: this.linearRgbChannelToSrgbChannelFloor(r),
            g: this.linearRgbChannelToSrgbChannelFloor(g),
            b: this.linearRgbChannelToSrgbChannelFloor(b),
        };
    }

    public static linearRgbToSrgbCeil({ r, g, b }: LinearRgb): Srgb {
        return {
            r: this.linearRgbChannelToSrgbChannelCeil(r),
            g: this.linearRgbChannelToSrgbChannelCeil(g),
            b: this.linearRgbChannelToSrgbChannelCeil(b),
        };
    }

    public static linearRgbRelativeLuminance({ r, g, b }: LinearRgb): number {
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    public static srgbRelativeLuminance(srgb: Srgb): number {
        return this.linearRgbRelativeLuminance(this.srgbToLinearRgb(srgb));
    }

    public static linearRgbContrastRatio(first: LinearRgb, second: LinearRgb): number {
        const firstLuminance = this.linearRgbRelativeLuminance(first);
        const secondLuminance = this.linearRgbRelativeLuminance(second);
        const lighter = Math.max(firstLuminance, secondLuminance);
        const darker = Math.min(firstLuminance, secondLuminance);

        return (lighter + 0.05) / (darker + 0.05);
    }

    public static srgbContrastRatio(first: Srgb, second: Srgb): number {
        return this.linearRgbContrastRatio(this.srgbToLinearRgb(first), this.srgbToLinearRgb(second));
    }

    public static linearRgbMeetsContrastRatio(first: LinearRgb, second: LinearRgb, ratio: number): boolean {
        return this.linearRgbContrastRatio(first, second) >= ratio;
    }

    public static srgbMeetsContrastRatio(first: Srgb, second: Srgb, ratio: number): boolean {
        return this.linearRgbMeetsContrastRatio(this.srgbToLinearRgb(first), this.srgbToLinearRgb(second), ratio);
    }

    public static lighterRelativeLuminanceForContrastRatio(luminance: number, ratio: number): number {
        return ratio * (luminance + 0.05) - 0.05;
    }

    public static darkerRelativeLuminanceForContrastRatio(luminance: number, ratio: number): number {
        return (luminance + 0.05) / ratio - 0.05;
    }

    public static luminanceRangesForContrastRatio(luminance: number, ratio: number): LuminanceRanges {
        const lighterMin = this.lighterRelativeLuminanceForContrastRatio(luminance, ratio);
        const darkerMax = this.darkerRelativeLuminanceForContrastRatio(luminance, ratio);

        return {
            lighter: lighterMin <= 1 ? { min: lighterMin, max: 1 } : null,
            darker: darkerMax >= 0 ? { min: 0, max: darkerMax } : null,
        };
    }

    public static linearRgbWithRelativeLuminance(linearRgb: LinearRgb, luminance: number): LinearRgb {
        const currentLuminance = this.linearRgbRelativeLuminance(linearRgb);

        if (currentLuminance === luminance) {
            return linearRgb;
        }

        const { r, g, b } = linearRgb;

        if (luminance < currentLuminance) {
            const scale = luminance / currentLuminance;

            return {
                r: r * scale,
                g: g * scale,
                b: b * scale,
            };
        }

        const scale = (luminance - currentLuminance) / (1 - currentLuminance);

        return {
            r: r + (1 - r) * scale,
            g: g + (1 - g) * scale,
            b: b + (1 - b) * scale,
        };
    }
}
