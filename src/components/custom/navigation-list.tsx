import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { NavigationLink } from "#src/constants/nav-link";
import { Button } from "react-aria-components";
import { useNavigate } from "react-router";

// <div role="list" className="flex flex-col gap-2 p-2.5 sm:p-3">
export const NavigationList = ({ data }: { data: NavigationLink[] }) => {
  return (
    <div
      role="list"
      className="grid gap-2 pt-1.5 pb-4"
    >
      {data.map((item, itemIdx) => (
        <NavigationListItem key={itemIdx} i={itemIdx} item={item} />
      ))}
    </div>
  );
};

export const NavigationListItem = ({
  item,
  i,
}: { i: number; item: NavigationLink }) => {
  const navigate = useNavigate();
  return (
    <TooltipTrigger delay={300}>
      <Button
        className="flex shadow-sm rounded-md border group divide-x hover:shadow-primary"
        onPress={() => navigate(item.href)}
      >
        <div className="shrink-0 h-full flex items-center justify-center w-14 text-sm font-medium rounded-l-md duration-300 bg-muted">
          <item.icon
            className="h-6 w-6 text-foreground  sm:group-hover:-rotate-45 sm:duration-300"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 px-4 py-1.5 text-sm text-start">
          <div className="font-semibold cursor-pointer sm:duration-300">
            {item.title}
          </div>
          <p className="text-muted-foreground line-clamp-1">
            {item.description}
          </p>
        </div>
      </Button>
      <Tooltip className="mt-0.5" placement="bottom">
        <p>{item.description}</p>
      </Tooltip>
    </TooltipTrigger>
  );
};
