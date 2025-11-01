import { Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ColorCardProps {
    color: string;
    label?: string;
}

const ColorCard = ({ color, label }: ColorCardProps) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(color);
        setCopied(true);
        toast(`Copied ${color}`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
            onClick={copyToClipboard}
        >
            <div
                className="relative h-28 w-full transition-all duration-300 group-hover:h-32"
                style={{ backgroundColor: color }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="relative bg-card p-4 transition-all duration-300">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {label && (
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                                {label}
                            </p>
                        )}
                        <p className="font-mono text-sm font-medium text-foreground">
                            {color.toUpperCase()}
                        </p>
                    </div>
                    <div className="flex-shrink-0 rounded-full bg-muted/50 p-1.5 transition-all duration-300 group-hover:bg-primary/10">
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorCard;
