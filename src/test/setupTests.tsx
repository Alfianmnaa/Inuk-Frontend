import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";

// Re-export everything for convenience in test files
export * from "@testing-library/react";
export { render };
export type { RenderOptions };