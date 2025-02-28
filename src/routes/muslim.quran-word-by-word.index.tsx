import { Header } from "#src/components/custom/header";
import NavigationSurah from "#src/components/custom/navigation-surah";
import React from "react";

export function Component() {
  return (
    <React.Fragment>
      <Header redirectTo="/" title="Susun Kata" />
      <NavigationSurah />
    </React.Fragment>
  );
}
