import { useState } from "react";
import { Palette } from "lucide-react";
import toast from "react-hot-toast";
import ColorCard from "../components/ColorCard";
import {
    generateColorScale,
    generateComplementaryScale,
    generateSecondaryPalette,
    generateSemanticPaletteSmart,
} from "../utils/ColorUtil";
import {Input} from "../components/Input";
import {Button} from "../components/Button";
import Footer from "../components/Footer";

const Index = () => {
    const [hexInput, setHexInput] = useState("");
    const [primaryPalette, setPrimaryPalette] = useState<string[]>([]);
    const [secondaryPalette, setSecondaryPalette] = useState<string[]>([]);
    const [secondaryComplementaryPalette, setSecondaryComplementaryPalette] = useState<string[]>([]);
    const [supportingPalettes, setSupportingPalettes] = useState<{
        info: string[];
        success: string[];
        warning: string[];
        danger: string[];
    } | null>(null);

    const handleGenerate = () => {
        const cleanHex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;

        const primary = generateColorScale(cleanHex);
        const secondary = generateSecondaryPalette(primary.scale);
        const secondaryComplementary = generateComplementaryScale(primary.scale);
        const supporting = generateSemanticPaletteSmart(primary.scale);

        setPrimaryPalette(Object.values(primary.scale));
        setSecondaryPalette(Object.values(secondary));
        setSecondaryComplementaryPalette(Object.values(secondaryComplementary))
        setSupportingPalettes({
            info: Object.values(supporting.info),
            success: Object.values(supporting.success),
            warning: Object.values(supporting.warning),
            danger: Object.values(supporting.danger),
        });

        toast.success("Color palettes generated successfully!");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleGenerate();
        }
    };

    const shadeLabels = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-20 max-w-7xl">
                <header className="mb-20 text-center animate-fade-in">
                    <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-primary/5 p-6">
                        <Palette
                            className="h-12 w-12 text-primary"
                            strokeWidth={1.5}
                            style={{
                                color: primaryPalette.length
                                    ? primaryPalette[5]
                                    : undefined
                            }}
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
                                className="h-14 rounded-xl border-0 bg-card font-mono text-center text-xl shadow-sm ring-1 ring-border/50 transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
                            />
                        </div>
                        <Button
                            onClick={handleGenerate}
                            className="w-full h-14 text-base font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
                            style={{
                                backgroundColor: primaryPalette.length
                                    ? primaryPalette[5]
                                    : undefined,
                            }}
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
            </div>
            <Footer />
        </div>
    );
};

export default Index;
