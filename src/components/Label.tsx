import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../utils/utils";

const baseLabelClasses = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { className?: string }
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn(baseLabelClasses, className)} {...props} />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
