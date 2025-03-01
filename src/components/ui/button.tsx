import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { cn } from "#src/utils/misc";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import * as ReactAria from "react-aria-components";

const buttonVariants = cva(
  [
    "inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
    /* Disabled */
    "data-disabled:pointer-events-none data-disabled:opacity-50 ",
    /* Focus Visible */
    "data-focus-visible:outline-hidden data-focus-visible:ring-1 data-focus-visible:ring-ring ",
    /* Resets */
    "focus-visible:outline-hidden",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm data-hovered:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs data-hovered:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-xs  data-hovered:bg-accent data-hovered:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs data-hovered:bg-secondary/50",
        ghost:
          "data-hovered:bg-accent data-hovered:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        link:
          "underline text-primary underline-offset-4 data-hovered:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// export interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
//     VariantProps<typeof buttonVariants> {
//   asChild?: boolean;
// }

export interface ButtonProps
  extends ReactAria.ButtonProps, VariantProps<typeof buttonVariants>
{
  className?: string;
  title?: string;
}

const Button = ({ title, className, variant, size, ...props }: ButtonProps) => {
  const element = (
    <ReactAria.Button
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );

  if (title) {
    return (
      <TooltipTrigger delay={300}>
        {element}
        <Tooltip placement="bottom">
          <p>{title}</p>
        </Tooltip>
      </TooltipTrigger>
    );
  } else {
    return element;
  }
};
Button.displayName = "Button";

export { Button, buttonVariants };
