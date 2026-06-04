export type Srgb = {
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

    public static srgbChannelToLinear(channel: number): number {
        const n = channel / 255;

        return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    }
}
