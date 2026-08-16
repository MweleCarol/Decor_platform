import { DESIGNS } from "./designs.data";

export { DESIGNS } from "./designs.data";

const MOCK_DELAY_MS = 400;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getMockDesigns() {
  const designs = [...DESIGNS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return delay({ designs });
}