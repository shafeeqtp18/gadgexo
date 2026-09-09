import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const cardVariants = cva("rounded-lg border border-border bg-card text-card-foreground", {
  variants: {
    variant: {
      default: "",
      elevated: "shadow-md",
      interactive: "cursor-pointer transition-all duration-fast hover:border-primary/40 hover:shadow-md",
      selected: "border-primary ring-1 ring-primary",
      disabled: "opacity-50 pointer-events-none",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, className }))} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-h3", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-small text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-4 pt-0", className)} {...props} />;
}
