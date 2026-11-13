import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

/* jsdom ne fournit pas `ResizeObserver`, que `scroll-rail.tsx` construit au
   montage : sans ce bouchon, rendre un rail jette avant la première assertion. */
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
