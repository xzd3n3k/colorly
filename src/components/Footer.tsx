import { Github, Coffee } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";
import qrCode from "../assets/qr-code.png";

const Footer = () => {
    const [qrOpen, setQrOpen] = useState(false);

    return (
        <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © 2025 HypeXTream. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/xzd3n3k"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="GitHub"
                        >
                            <Github className="h-5 w-5" />
                        </a>

                        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label="Buy Me a Coffee"
                                >
                                    <Coffee className="h-5 w-5" />
                                    <span className="hidden sm:inline">Buy me a coffee</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-center">Support this project</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <img
                                        src={qrCode}
                                        alt="Buy Me a Coffee QR Code"
                                        className="h-48 w-48 rounded-lg border border-border"
                                    />
                                    <p className="text-center text-sm text-muted-foreground">
                                        Scan the QR code to support this project
                                    </p>
                                    <a
                                        href="https://buymeacoffee.com/hypextream"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Or click here to donate
                                    </a>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
