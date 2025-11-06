import {useEffect, useState} from "react";
import { Copy, Palette } from "lucide-react";
import toast from "react-hot-toast";
import ColorCard from "../components/ColorCard";
import {
    generateColorScale,
    generateComplementaryScale,
    generateSecondaryPalette,
    generateSemanticPaletteSmart, generateTailwindColors,
} from "../utils/ColorUtil";
import {Input} from "../components/Input";
import {Button} from "../components/Button";
import Footer from "../components/Footer";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../components/Dialog";
import {Label} from "../components/Label";
import {Switch} from "../components/Switch";

const Index = () => {
    const [useTailwindMode, setUseTailwindMode] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [hexInput, setHexInput] = useState("#3B82F6");
    const [primaryPalette, setPrimaryPalette] = useState<string[]>([]);
    const [secondaryPalette, setSecondaryPalette] = useState<string[]>([]);
    const [secondaryComplementaryPalette, setSecondaryComplementaryPalette] = useState<string[]>([]);
    const [supportingPalettes, setSupportingPalettes] = useState<{
        info: string[];
        success: string[];
        warning: string[];
        danger: string[];
    } | null>(null);

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
            return;
        }
        handleGenerate(true);
    }, [useTailwindMode]);

    const handleGenerate = (calledProgrammaticaly?: boolean) => {
        let cleanHex = '#3B82F6';
        if (hexInput) {
            cleanHex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
        }

        let primary = generateColorScale(cleanHex).scale;

        if (useTailwindMode) {
            primary = generateTailwindColors(cleanHex);
            setSupportingPalettes(null);
        } else {
            const supporting = generateSemanticPaletteSmart(primary);
            setSupportingPalettes({
                info: Object.values(supporting.info),
                success: Object.values(supporting.success),
                warning: Object.values(supporting.warning),
                danger: Object.values(supporting.danger),
            });
        }

        const secondary = generateSecondaryPalette(primary);
        const secondaryComplementary = generateComplementaryScale(primary);

        setPrimaryPalette(Object.values(primary));
        setSecondaryPalette(Object.values(secondary));
        setSecondaryComplementaryPalette(Object.values(secondaryComplementary))

        document.documentElement.style.setProperty("--primary", Object.values(primary)[5]);
        document.documentElement.style.setProperty("--primary-hover", Object.values(primary)[4]);
        document.documentElement.style.setProperty("--primary-light", Object.values(primary)[0]);
        document.documentElement.style.setProperty("--primary-light-hover", Object.values(primary)[1]);

        document.documentElement.style.setProperty("--ring", Object.values(primary)[6]);

        if (!calledProgrammaticaly) {
            toast.success("Color palettes generated successfully!");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleGenerate();
        }
    };

    const shadeLabels = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

    type PaletteToGenerate =
        | { type: "single"; palette: string[]; prefix: string }
        | { type: "multi"; palettes: Record<string, string[]> };

    const [paletteToGenerate, setPaletteToGenerate] = useState<PaletteToGenerate | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    function openDialog(palette: string[], prefix: string) {
        setPaletteToGenerate({ type: "single", palette, prefix });
        setDialogOpen(true);
    }

    function openDialogForSupportingPalettes(palettes: {
        info: string[];
        success: string[];
        warning: string[];
        danger: string[];
    }) {
        setPaletteToGenerate({ type: "multi", palettes });
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
    }

    const generateCSS = () => {
        if (!paletteToGenerate) return "";

        if (paletteToGenerate.type === "single") {
            const { palette, prefix } = paletteToGenerate;
            return `:root {\n${palette
                .map((color, index) => `  --color-${prefix}-${shadeLabels[index]}: ${color};`)
                .join("\n")}\n}`;
        }

        if (paletteToGenerate.type === "multi") {
            const sections = Object.entries(paletteToGenerate.palettes).map(
                ([name, colors]) => {
                    const lines = colors
                        .map(
                            (color, index) =>
                                `  --color-${name}-${shadeLabels[index]}: ${color};`
                        )
                        .join("\n");
                    return lines;
                }
            );
            return `:root {\n${sections.join("\n\n")}\n}`;
        }

        return "";
    };

    const copyCSS = () => {
        navigator.clipboard.writeText(generateCSS());
        toast.success("CSS copied!");
    };


    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-20 max-w-7xl">
                <div className="fixed top-8 right-8 flex items-center gap-3">
                    <Label htmlFor="mode-switch" className="text-sm font-medium">
                        {useTailwindMode ? 'Tailwind Mode' : 'Basic Mode'}
                    </Label>
                    <Switch
                        id="mode-switch"
                        checked={useTailwindMode}
                        onCheckedChange={setUseTailwindMode}
                    />
                </div>
                <header className="mb-20 text-center animate-fade-in">
                    <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-primary-light p-6">
                        <Palette
                            className="h-12 w-12 text-primary"
                            strokeWidth={1.5}
                        />
                    </div>
                    <h1 className="mb-4 text-6xl font-extralight tracking-tight text-foreground sm:text-7xl">
                        Color Palette Generator
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Generate comprehensive color systems from any hex code
                    </p>
                </header>

                <div className="mx-auto mb-24 max-w-lg">
                    <div className="space-y-4">
                        <div className="relative">
                            <Input
                                id="hex-input"
                                type="text"
                                placeholder="#3B82F6"
                                value={hexInput}
                                onChange={(e) => setHexInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="h-14 rounded-xl border-0 bg-card font-mono text-center text-xl shadow-sm ring-1 ring-border transition-all focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>
                        <Button
                            onClick={() => handleGenerate()}
                            className="w-full h-14 text-base font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                            Generate Palettes
                        </Button>
                    </div>
                </div>

                {primaryPalette.length > 0 && (
                    <div className="space-y-20 animate-fade-in">
                        <section>
                            <div className="mb-8 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Primary Palette
                                </h2>

                                <Button
                                    onClick={() => openDialog(primaryPalette, 'primary')}
                                    className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light-hover transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                    View CSS
                                </Button>

                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
                                {primaryPalette.map((color, index) => (
                                    <ColorCard
                                        key={`primary-${index}`}
                                        color={color}
                                        label={shadeLabels[index]}
                                    />
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="mb-8 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Secondary Palette
                                </h2>

                                <Button
                                    onClick={() => openDialog(secondaryPalette, 'secondary')}
                                    className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light-hover transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                    View CSS
                                </Button>

                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
                                {secondaryPalette.map((color, index) => (
                                    <ColorCard
                                        key={`secondary-${index}`}
                                        color={color}
                                        label={shadeLabels[index]}
                                    />
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="mb-8 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Secondary Complementary Palette
                                </h2>

                                <Button
                                    onClick={() => openDialog(secondaryComplementaryPalette, 'complementary')}
                                    className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light-hover transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                    View CSS
                                </Button>

                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
                                {secondaryComplementaryPalette.map((color, index) => (
                                    <ColorCard
                                        key={`secondary-${index}`}
                                        color={color}
                                        label={shadeLabels[index]}
                                    />
                                ))}
                            </div>
                        </section>

                        {supportingPalettes && (
                            <section>
                                <div className="mb-8 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        Supporting Colors
                                    </h2>

                                    <Button
                                        onClick={() => openDialogForSupportingPalettes(supportingPalettes)}
                                        className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light-hover transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        View CSS
                                    </Button>

                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                </div>
                                <div className="space-y-12">
                                    {Object.entries(supportingPalettes).map(([name, colors]) => (
                                        <div key={name}>
                                            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                                                {name}
                                            </h3>
                                            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
                                                {colors.map((color, index) => (
                                                    <ColorCard
                                                        key={`${name}-${index}`}
                                                        color={color}
                                                        label={shadeLabels[index]}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {primaryPalette.length === 0 && (
                    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card/30 p-20 text-center backdrop-blur-sm">
                        <p className="text-sm text-muted-foreground/70">
                            Enter a hex color code above to generate your palettes
                        </p>
                    </div>
                )}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Generated CSS Variables
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4">
                            <pre className="bg-muted/10 rounded-lg p-4 text-sm font-mono overflow-x-auto max-h-[400px] border border-border">
                                {generateCSS()}
                            </pre>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    copyCSS();
                                    closeDialog();
                                }}
                            >
                                <Copy className="w-4 h-4" />
                                Copy CSS
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Footer />
        </div>
    );
};

export default Index;
