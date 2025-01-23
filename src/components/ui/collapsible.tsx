import { cn } from "#src/utils/misc";
import React from "react";
import {
	Disclosure as AriaDisclosure,
	DisclosurePanel as AriaDisclosurePanel,
	DisclosurePanelProps as AriaDisclosurePanelProps,
	DisclosureProps as AriaDisclosureProps,
	Button,
	ButtonProps,
	composeRenderProps,
	Heading,
} from "react-aria-components";

export interface DisclosureProps extends AriaDisclosureProps {
	children: React.ReactNode;
}

function Collapsible({ children, className, ...props }: DisclosureProps) {
	return (
		<AriaDisclosure
			{...props}
			className={composeRenderProps(className, (className) =>
				cn("group", className),
			)}
		>
			{children}
		</AriaDisclosure>
	);
}

export interface DisclosureHeaderProps {
	children: React.ReactNode;
	className?: ButtonProps["className"];
}

function CollapsibleTrigger({ children, className }: DisclosureHeaderProps) {
	return (
		<Heading className="w-full">
			<Button
				slot="trigger"
				className={composeRenderProps(className, (className) => {
					return cn(
						"[data-focused]:outline-hidden data-focus-visible:outline-hidden focus-visible:outline-hidden",
						className,
					);
				})}
			>
				{children}
			</Button>
		</Heading>
	);
}

export interface DisclosurePanelProps extends AriaDisclosurePanelProps {
	children: React.ReactNode;
}

function CollapsibleContent({
	children,
	className,
	...props
}: DisclosurePanelProps) {
	return (
		<AriaDisclosurePanel
			{...props}
			className={"overflow-hidden text-sm transition-all"}
		>
			<div className={cn(className)}>{children}</div>
		</AriaDisclosurePanel>
	);
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
