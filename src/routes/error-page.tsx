import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

import { Button } from "#src/components/ui/button";
import { cn } from "#src/utils/misc";

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean;
}

export default function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const navigate = useNavigate();
  const error = useRouteError();
  console.error(error);
  return (
    <div className={cn("h-svh w-full", className)}>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        {!minimal && (
          <h1 className="text-[7rem] font-bold leading-tight">500</h1>
        )}
        <span className="font-medium">Ups! Ada sesuatu yang salah {`:')`}</span>
        <p className="text-center text-muted-foreground">
          {isRouteErrorResponse(error)
            // note that error is type `ErrorResponse`
            ? `${error.status} | ${error.statusText}`
            : (
              <span>
                "Kami mohon maaf atas ketidaknyamanan ini. <br />{" "}
                Silakan coba lagi nanti."
              </span>
            )}
        </p>
        {!minimal && (
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onPress={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onPress={() => navigate("/")}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  );
}
