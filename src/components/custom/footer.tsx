import { buttonVariants } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";
import { Copyright } from "lucide-react";
import { Link } from "react-router";

const Footer = () => {
  const date = "__DATE__";
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between w-full text-xs sm:text-sm px-3 py-2 bg-background">
      <Link
        className={cn(
          "no-underline text-muted-foreground font-normal",
        )}
        to="https://id.linkedin.com/in/hudamnhd"
      >
        Kiat Aplikasi
      </Link>
      <div className="Home-built text-muted-foreground">
        Built at : {date}
      </div>
    </div>
  );
};

export default Footer;
