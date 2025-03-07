import { Check } from "lucide-react";
import * as ReactAria from "react-aria-components";

import { cn } from "#src/utils/misc";
import { Button, type ButtonProps } from "./button";

export const Select = <T extends object>({
  className,
  ...props
}: ReactAria.SelectProps<T>) => {
  return <ReactAria.Select className={cn("w-full", className)} {...props} />;
};

export interface SelectContentProps<T>
  extends Omit<ReactAria.PopoverProps, "children" | "style">,
    Omit<ReactAria.ListBoxProps<T>, "style"> {
  className?: string;
  popoverClassName?: string;
}

export const SelectContent = <T extends object>({
  className,
  popoverClassName,
  ...props
}: SelectContentProps<T>) => {
  return (
    <ReactAria.Popover
      className={cn(
        "min-w-(--trigger-width) overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-border dark:bg-background",
        // Entering
        "entering:animate-in entering:fade-in",
        // Exiting
        "exiting:animate-in exiting:fade-in exiting:direction-reverse",
        // Top
        "placement-top:slide-in-from-bottom-2",
        // Bottom
        "placement-bottom:slide-in-from-top-2",
        popoverClassName,
      )}
      {...props}
    >
      <ReactAria.ListBox className={cn("outline-hidden", className)} {...props} />
    </ReactAria.Popover>
  );
};

export const SelectItem = ({
  className,
  children,
  ...props
}: ReactAria.ListBoxItemProps) => {
  return (
    <ReactAria.ListBoxItem
      className={cn(
        "group",
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-foreground outline-hidden transition-colors dark:text-foreground",
        // Focus
        "focus:bg-accent dark:focus:bg-accent",
        "data-[selected=true]:[&_svg]:visible",
        className,
      )}
      {...props}
    >
      <>
        <Check strokeWidth="3" className="invisible h-4 w-4" />
        {children}
      </>
    </ReactAria.ListBoxItem>
  );
};

export const SelectValue = <T extends object>(
  props: ReactAria.SelectValueProps<T>,
) => {
  return <ReactAria.SelectValue {...props} />;
};

export const SelectButton = ({ className, ...props }: ButtonProps) => {
  return (
    <Button
      className={cn(
        [
          "flex w-full items-center justify-between font-normal",
          // Disabled
          "disabled:cursor-not-allowed disabled:pointer-events-auto",
        ],
        className,
      )}
      {...props}
    />
  );
};
