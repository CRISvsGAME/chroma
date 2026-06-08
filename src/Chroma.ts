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

export class Chroma {
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

    public static linearRgbChannelToSrgbChannel(channel: number): number {
        const n = channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;

        return Math.round(n * 255);
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
}
