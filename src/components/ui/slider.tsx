import * as React from "react";

import { cn } from "#src/utils/misc";

import {
  Slider as AriaSlider,
  SliderOutput as AriaSliderOutput,
  SliderOutputProps as AriaSliderOutputProps,
  SliderProps as AriaSliderProps,
  SliderStateContext as AriaSliderStateContext,
  SliderThumb as AriaSliderThumb,
  SliderThumbProps as AriaSliderThumbProps,
  SliderTrack as AriaSliderTrack,
  SliderTrackProps as AriaSliderTrackProps,
  composeRenderProps,
} from "react-aria-components";

import { labelVariants } from "./field";

const SliderOutput = ({ className, ...props }: AriaSliderOutputProps) => (
  <AriaSliderOutput className={cn(labelVariants(), className)} {...props} />
);

const Slider = ({
  className,
  orientation = "horizontal",
  ...props
}: AriaSliderProps) => (
  <AriaSlider
    className={composeRenderProps(className, (className) =>
      cn(
        "relative flex touch-none select-none items-center",
        {
          "h-full": orientation === "vertical",
          "w-full": orientation === "horizontal",
        },
        className,
      ),
    )}
    orientation={orientation}
    {...props}
  />
);

const SliderTrack = ({ className, ...props }: AriaSliderTrackProps) => (
  <AriaSliderTrack
    className={composeRenderProps(className, (className, renderProps) =>
      cn(
        {
          "h-1.5 w-full": renderProps.orientation === "horizontal",
          "h-full w-1.5": renderProps.orientation === "vertical",
        },
        "relative grow rounded-full bg-primary/20",
        /* Disabled */
        "data-disabled:opacity-50",
        className,
      ),
    )}
    {...props}
  />
);

const SliderFillTrack = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  let state = React.useContext(AriaSliderStateContext)!;
  const orientation = state.orientation === "vertical" ? "height" : "width";
  return (
    <div
      style={{ [orientation]: state.getThumbPercent(0) * 100 + "%" }}
      className={cn(
        "absolute rounded-full bg-primary",
        {
          "h-full": state.orientation === "horizontal",
          "w-full bottom-0": state.orientation === "vertical",
        },
        className,
      )}
      {...props}
    />
  );
};

const SliderThumb = ({ className }: AriaSliderThumbProps) => (
  <AriaSliderThumb
    className={composeRenderProps(className, (className) =>
      cn(
        "left-1/2 top-1/2 block size-4 rounded-full border border-primary/50 bg-background shadow-sm transition-colors",
        /* Disabled */
        "data-disabled:pointer-events-none",
        /* Focus Visible */
        "data-focus-visible:outline-hidden data-focus-visible:ring-1 data-focus-visible:ring-ring",
        className,
      ),
    )}
  />
);

export { Slider, SliderTrack, SliderFillTrack, SliderThumb, SliderOutput };
