import { Button } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";
import { ArrowUp } from "lucide-react";
import React from "react";

export const ScrollTopButton = () => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const handleVisibleButton = () => {
    const shouldShow = window.scrollY > window.innerHeight * 0.75;
    const paginationPage = document.getElementById("pagination-page");
    if (parentRef.current) {
      if (shouldShow) {
        parentRef.current.style.display = "block";

        if (paginationPage instanceof HTMLDivElement) {
          paginationPage.classList.remove("py-5");
          paginationPage?.classList.add("pt-5");
        }
      } else {
        parentRef.current.style.display = "none";

        if (paginationPage instanceof HTMLDivElement) {
          paginationPage.classList.remove("pt-5");
          paginationPage?.classList.add("py-5");
        }
      }
    }
  };

  const handleScrollUp = () => {
    window?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    window.addEventListener("scroll", handleVisibleButton);

    return () => {
      window.removeEventListener("scroll", handleVisibleButton);
    };
  }, []);

  return (
    <div
      ref={parentRef}
      className={cn(
        "sticky  ml-auto w-fit -translate-x-3 z-20 bottom-3",
      )}
      style={{ display: "none" }}
    >
      <Button onPress={handleScrollUp} variant="default" size="icon">
        <ArrowUp />
      </Button>
    </div>
  );
};

export const ScrollToFirstIndex = ({
  handler,
  container,
  className,
}: {
  handler: () => void;
  container: React.RefObject<HTMLDivElement> | null;
  className?: string;
}) => {
  const [showGoTop, setShowGoTop] = React.useState(false);

  const handleVisibleButton = () => {
    if (container?.current) {
      const shouldShow = container.current.scrollTop > 50;
      if (shouldShow !== showGoTop) {
        setShowGoTop(shouldShow);
      }
    }
  };

  const handleScrollUp = () => {
    handler();
  };

  React.useEffect(() => {
    const currentContainer = container?.current;
    if (!currentContainer) return;

    currentContainer.addEventListener("scroll", handleVisibleButton);

    return () => {
      currentContainer.removeEventListener("scroll", handleVisibleButton);
    };
  }, [container, showGoTop]);

  return (
    <div
      className={cn(
        "sticky h-fit inset-x-0 ml-auto w-fit -translate-x-5 z-10 bottom-0 -mt-11",
        !showGoTop && "hidden",
        className,
      )}
    >
      <Button
        onPress={handleScrollUp}
        size="icon"
        className=""
      >
        <ArrowUp />
      </Button>
    </div>
  );
};
