"use client";

import React from "react";
import { Check, Minus } from "lucide-react";
import {
  Checkbox as AriaCheckbox,
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps,
  ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";

import { cn } from "#src/utils/misc";
import { FieldError, Label, labelVariants } from "./field";

const CheckboxGroup = AriaCheckboxGroup;

const Checkbox = ({ className, children, ...props }: AriaCheckboxProps) => (
  <AriaCheckbox
    className={composeRenderProps(className, (className) =>
      cn(
        "group/checkbox flex items-center gap-x-2",
        /* Disabled */
        "data-disabled:cursor-not-allowed data-disabled:opacity-70",
        labelVariants,
        className,
      ),
    )}
    {...props}
  >
    {composeRenderProps(children, (children, renderProps) => (
      <>
        <div
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary text-current shadow-sm",
            /* Focus Visible */
            "group-data-focus-visible/checkbox:outline-hidden group-data-focus-visible/checkbox:ring-1 group-data-focus-visible/checkbox:ring-ring",
            /* Selected */
            "group-data-indeterminate/checkbox:bg-primary group-data-selected/checkbox:bg-primary group-data-indeterminate/checkbox:text-primary-foreground  group-data-selected/checkbox:text-primary-foreground",
            /* Disabled */
            "group-data-disabled/checkbox:cursor-not-allowed group-data-disabled/checkbox:opacity-50",
            /* Invalid */
            "group-data-invalid/checkbox:border-destructive group-data-selected/checkbox:group-data-invalid/checkbox:bg-destructive group-data-selected/checkbox:group-data-invalid/checkbox:text-destructive-foreground",
            /* Resets */
            "focus-visible:outline-hidden",
          )}
        >
          {renderProps.isIndeterminate ? (
            <Minus className="size-4" />
          ) : renderProps.isSelected ? (
            <Check className="size-4" />
          ) : null}
        </div>
        {children}
      </>
    ))}
  </AriaCheckbox>
);

interface JollyCheckboxGroupProps extends AriaCheckboxGroupProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

function JollyCheckboxGroup({
  label,
  description,
  errorMessage,
  className,
  children,
  ...props
}: JollyCheckboxGroupProps) {
  return (
    <CheckboxGroup
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      {composeRenderProps(children, (children) => (
        <>
          <Label>{label}</Label>
          {children}
          {description && (
            <Text className="text-sm text-muted-foreground" slot="description">
              {description}
            </Text>
          )}
          <FieldError>{errorMessage}</FieldError>
        </>
      ))}
    </CheckboxGroup>
  );
}

export { Checkbox, CheckboxGroup, JollyCheckboxGroup };
export type { JollyCheckboxGroupProps };
