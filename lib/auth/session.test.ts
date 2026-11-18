import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, initials } from "./session";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getCurrentUser", () => {
  it("returns nobody while sign-in is not built", async () => {
    vi.stubEnv("MOCK_USER_NAME", "");
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns the mock user in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MOCK_USER_NAME", "  Ada Lovelace ");
    expect(await getCurrentUser()).toEqual({ name: "Ada Lovelace" });
  });

  it("ignores the mock user in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MOCK_USER_NAME", "Ada Lovelace");
    expect(await getCurrentUser()).toBeNull();
  });
});

describe("initials", () => {
  it.each([
    ["Ada Lovelace", "AL"],
    ["ada", "A"],
    ["  Grace   Brewster Hopper ", "GH"],
    ["élodie durand", "ÉD"],
    ["", "?"],
    ["   ", "?"],
  ])("turns %j into %j", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
