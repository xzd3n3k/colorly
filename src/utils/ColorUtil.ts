import { formatHex, oklch, parse } from "culori";
import chroma from "chroma-js";
import toast from "react-hot-toast";
import {tailwindPalette} from "./utils";

// Type Definitions
type ColorScale = Record<string, string>;
type OklchColor = { l: number; c: number; h: number | undefined };

// Core Algorithm Constants

// 11 shades in a Tailwind scale
const SHADES = [
    '50', '100', '200', '300', '400',
    '500', '600', '700', '800', '900', '950'
];

/**
 * Master Lightness Curve (based on Tailwind's 'zinc' scale).
 * This defines the target lightness for each shade.
 * '50' is lightest (0.98), '950' is darkest (0.25).
 */
const TARGET_LIGHTNESS: Record<string, number> = {
    '50': 0.98,
    '100': 0.95,
    '200': 0.90,
    '300': 0.85,
    '400': 0.77,
    '500': 0.69,
    '600': 0.60,
    '700': 0.52,
    '800': 0.43,
    '900': 0.34,
    '950': 0.25,
};

/**
 * Master Chroma Curve (based on Tailwind's 'sky' scale).
 * This defines the target *maximum* chroma for a vibrant color at each shade.
 * Note how chroma peaks in the middle (400-600) and fades at the ends.
 */
const MAX_CHROMA_CURVE: Record<string, number> = {
    '50': 0.03,
    '100': 0.06,
    '200': 0.11,
    '300': 0.16,
    '400': 0.19,
    '500': 0.21,
    '600': 0.20,
    '700': 0.19,
    '800': 0.17,
    '900': 0.15,
    '950': 0.13,
};

const SEMANTIC_BASE: Record<'info' | 'danger' | 'success' | 'warning', string> = {
    info: '#2563eb',
    danger: '#dc2626',
    success: '#16a34a',
    warning: '#f59e0b',
};

// Helper Functions

function findPerceptualShade(lightness: number, hue: number): string {
    let perceivedL = lightness;

    if (hue >= 40 && hue <= 90) {
        // Yellows appear lighter → compensate down
        perceivedL -= 0.10;
    } else if (hue >= 200 && hue <= 260) {
        // Blues appear darker → compensate up
        perceivedL += 0.05;
    } else if (hue >= 100 && hue <= 140) {
        // Greens slightly lighter
        perceivedL -= 0.03;
    } else if (hue >= 340 || hue <= 20) {
        // Reds slightly darker
        perceivedL += 0.02;
    }

    return SHADES.reduce((prev, curr) => {
        const prevDiff = Math.abs(TARGET_LIGHTNESS[prev] - perceivedL);
        const currDiff = Math.abs(TARGET_LIGHTNESS[curr] - perceivedL);
        return currDiff < prevDiff ? curr : prev;
    });
}

function getLuminance(hex: string): number {
    const { r, g, b } = parse(hex) as any;

    const linear = (v: number) =>
        v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

    const R = linear(r);
    const G = linear(g);
    const B = linear(b);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hex1: string, hex2: string): number {
    const L1 = getLuminance(hex1);
    const L2 = getLuminance(hex2);

    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);

    return (lighter + 0.05) / (darker + 0.05);
}


/**
 * The core "bulletproof" algorithm.
 * Generates a full 11-step color scale from a single hex color.
 */
export function generateColorScale(hex: string): { scale: ColorScale, baseShade: string } {
    const parsedColor = parse(hex);
    if (!parsedColor) {
        toast.error("Invalid hex color format, fallback to '#3B82F6'");

        return generateColorScale('#3B82F6');
    }

    const { l, c, h } = oklch(parsedColor) as OklchColor;
    const hue = h ?? 0;
    const baseShade = findPerceptualShade(l, hue);

    const lightnessDifference = TARGET_LIGHTNESS[baseShade] - l;
    const maxChromaForShade = MAX_CHROMA_CURVE[baseShade];

    const saturationFactor = (maxChromaForShade === 0) ? 0 : (c / maxChromaForShade);
    const scale: ColorScale = {};

    for (const shade of SHADES) {
        const newLightness = TARGET_LIGHTNESS[shade] - lightnessDifference;
        const newChroma = MAX_CHROMA_CURVE[shade] * saturationFactor;

        const newColor = {
            mode: 'oklch' as 'oklch',
            l: Math.max(0, Math.min(1, newLightness)),
            c: Math.max(0, newChroma),
            h: hue,
        };

        scale[shade] = formatHex(newColor);
    }

    return { scale, baseShade };
}

export function generateSecondaryPalette(primaryScale: ColorScale, options?: { hueShift?: number, chromaFactor?: number }) {

    const secondaryScale: ColorScale = {};
    const hueShift = options?.hueShift ?? 30; // default shift +30°
    const chromaFactor = options?.chromaFactor ?? 0.85; // slightly less vibrant

    for (const shade of SHADES) {
        const parsed = oklch(parse(primaryScale[shade])!) as OklchColor;
        const newHue = ((parsed.h ?? 0) + hueShift) % 360;

        const newChroma = parsed.c * chromaFactor;

        const newColor = {
            mode: 'oklch' as 'oklch',
            l: parsed.l,
            c: newChroma,
            h: newHue
        };

        secondaryScale[shade] = formatHex(newColor);
    }

    return secondaryScale;
}

/**
 * Generates a complementary 11-shade palette for a primary hex color.
 * Works exactly like generateColorScale, but rotates hue +180°.
 */
export function generateComplementaryScale(primaryScale: ColorScale, options?: { chromaFactor?: number }): ColorScale {
    const chromaFactor = options?.chromaFactor ?? 1; // keep chroma same by default
    const complementaryScale: ColorScale = {};

    for (const shade of SHADES) {
        const parsed = oklch(parse(primaryScale[shade])!) as OklchColor;

        // Rotate hue +180° for complementary color
        const newHue = (parsed.h === undefined ? 0 : (parsed.h + 180) % 360);

        const newChroma = parsed.c * chromaFactor;

        const newColor = {
            mode: 'oklch' as 'oklch',
            l: parsed.l,
            c: newChroma,
            h: newHue
        };

        complementaryScale[shade] = formatHex(newColor);
    }

    return complementaryScale;
}

export function generateContrastGrid(scale: ColorScale): Record<string, Record<string, number>> {
    const grid: Record<string, Record<string, number>> = {};

    for (const shadeA of SHADES) {
        grid[shadeA] = {};
        for (const shadeB of SHADES) {
            if (shadeA === shadeB) {
                grid[shadeA][shadeB] = 1; // same color → contrast ratio 1:1
            } else {
                grid[shadeA][shadeB] = parseFloat(
                    getContrastRatio(scale[shadeA], scale[shadeB]).toFixed(2)
                );
            }
        }
    }

    return grid;
}

export function generateSemanticPaletteSmart(
    primaryScale: ColorScale
): Record<'info' | 'danger' | 'success' | 'warning', Record<string, string>> {
    const semanticScale: Record<'info' | 'danger' | 'success' | 'warning', Record<string, string>> = {
        info: {},
        danger: {},
        success: {},
        warning: {},
    };

    for (const shade of SHADES) {
        const primaryColor = oklch(parse(primaryScale[shade])!) as OklchColor;

        for (const key of Object.keys(SEMANTIC_BASE) as Array<'info' | 'danger' | 'success' | 'warning'>) {
            const baseSemantic = oklch(parse(SEMANTIC_BASE[key])!) as OklchColor;

            const newColor = {
                mode: 'oklch' as 'oklch',
                l: primaryColor.l,
                c: baseSemantic.c * 0.8,
                h: baseSemantic.h ?? 0,
            };

            semanticScale[key][shade] = formatHex(newColor);
        }
    }

    return semanticScale;
}

export function generateTailwindColors(primaryColor: string) {
    const palettes = tailwindPalette.map((colorShades) => {
        const shades = colorShades.map((shade) => {
            return {
                ...shade,
                delta: chroma.deltaE(primaryColor, shade.hexcode),
                lightnessDiff: 0,
            };
        });

        const closestShade = shades.reduce((prev, current) => {
            return prev.delta < current.delta ? prev : current;
        });

        return {
            shades,
            closestShade,
            closestShadeLightness: {
                delta: 0,
                lightnessDiff: 0,
                number: 50,
                hexcode: "#ffffff",
            },
        };
    });

    const palette = palettes.reduce((prev, current) => {
        return prev.closestShade.delta < current.closestShade.delta ? prev : current;
    });

    palette.shades = palette.shades.map((shade) => {
        return {
            ...shade,
            lightnessDiff: Math.abs(
                chroma(shade.hexcode).get("hsl.l") - chroma(primaryColor).get("hsl.l")
            ),
        };
    });

    palette.closestShadeLightness = palette.shades.reduce((prev, current) => {
        return prev.lightnessDiff < current.lightnessDiff ? prev : current;
    });

    const hexColorHue = chroma(primaryColor).get("hsl.h");
    const closestShadeLightnessHue = chroma(
        palette.closestShadeLightness.hexcode
    ).get("hsl.h");
    const hueDelta = hexColorHue - (closestShadeLightnessHue || 0);

    const primaryColorSaturation = chroma(primaryColor).get("hsl.s");
    const closestShadeSaturation = chroma(
        palette.closestShadeLightness.hexcode
    ).get("hsl.s");
    const saturationDelta = primaryColorSaturation / closestShadeSaturation;

    let hueDeltaString = "";
    if (hueDelta === 0) {
        hueDeltaString = closestShadeLightnessHue.toString();
    } else if (hueDelta > 0) {
        hueDeltaString = `+${hueDelta}`;
    } else {
        hueDeltaString = hueDelta.toString();
    }

    return palette.shades
        .map((shade) => {
            let shadeHexcode = shade.hexcode;
            const shadeSaturation = chroma(shadeHexcode).get("hsl.s") * saturationDelta;

            shadeHexcode = chroma(shadeHexcode).set("hsl.s", shadeSaturation).hex();
            shadeHexcode = chroma(shadeHexcode).set("hsl.h", hueDeltaString).hex();

            if (palette.closestShadeLightness.number === shade.number) {
                shadeHexcode = chroma(primaryColor).hex();
            }

            return {
                number: shade.number,
                color: shadeHexcode,
                root: palette.closestShadeLightness.number === shade.number,
            };
        })
        .reduce((acc, shade) => {
            acc[shade.number] = shade.color;

            return acc;
        }, {} as Record<string | number, string>);
}
