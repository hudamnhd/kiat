"use client";

import * as React from "react";
import { Check } from "lucide-react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  RadioProps as AriaRadioProps,
  ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components";

import { cn } from "#src/utils/misc";

import { FieldError, Label, labelVariants } from "./field";

const RadioGroup = ({
  className,
  orientation = "vertical",
  ...props
}: AriaRadioGroupProps) => {
  return (
    <AriaRadioGroup
      className={composeRenderProps(className, (className) =>
        cn(
          {
            "grid gap-2": orientation === "vertical",
            "flex items-center gap-2": orientation === "horizontal",
          },
          className,
        ),
      )}
      {...props}
    />
  );
};

const Radio = ({ className, children, ...props }: AriaRadioProps) => {
  return (
    <AriaRadio
      className={composeRenderProps(className, (className) =>
        cn(
          "group flex items-center gap-x-2",
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
          <span
            className={cn(
              "jolly-Radio flex aspect-square size-4 items-center justify-center rounded-full border border-primary text-primary shadow-sm",
              /* Focus */
              "group-data-focused:outline-hidden",
              /* Focus Visible */
              "group-data-focus-visible:ring-1 group-data-focus-visible:ring-ring",
              /* Disabled */
              "group-data-disabled:cursor-not-allowed group-data-disabled:opacity-50",
              /* Invalid */
              "group-data-invalid:border-destructive",
            )}
          >
            {renderProps.isSelected && (
              <Check className="size-3.5 text-primary" strokeWidth={3} />
            )}
          </span>
          {children}
        </>
      ))}
    </AriaRadio>
  );
};

interface JollyRadioGroupProps extends AriaRadioGroupProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

function JollyRadioGroup({
  label,
  description,
  className,
  errorMessage,
  children,
  ...props
}: JollyRadioGroupProps) {
  return (
    <RadioGroup
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
            <Text slot="description" className="text-sm text-muted-foreground">
              {description}
            </Text>
          )}
          <FieldError>{errorMessage}</FieldError>
        </>
      ))}
    </RadioGroup>
  );
}

export { RadioGroup, Radio, JollyRadioGroup };
export type { JollyRadioGroupProps };
