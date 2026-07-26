import type { GatsbyBrowser } from "gatsby";
import { RootProvider } from "./src/providers/RootProvider";

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({
  element,
}) => <RootProvider>{element}</RootProvider>;
