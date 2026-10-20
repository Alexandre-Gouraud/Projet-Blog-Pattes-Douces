// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMe, replace } = vi.hoisted(() => ({ fetchMe: vi.fn(), replace: vi.fn() }));
vi.mock("@/lib/api-client", () => ({ fetchMe }));
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/profile",
}));
vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({ t: { common: { loadError: "ERREUR", retry: "REESSAYER", retrying: "EN COURS" } } }),
}));

import { clearSession, refreshSession, resetSessionForTests, setSessionUser } from "@/lib/auth/session";
import { RequireAuth } from "./RequireAuth";

const me = { id: "a".repeat(24), pseudo: "Pistache", espece: "cat" };
const page = <RequireAuth>PAGE</RequireAuth>;

beforeEach(() => {
  resetSessionForTests();
  fetchMe.mockReset();
  replace.mockReset();
});
afterEach(cleanup);

describe("RequireAuth", () => {
  it("redirects a visitor to the login page", async () => {
    fetchMe.mockResolvedValue(null);
    render(page);
    await act(async () => {});
    expect(replace).toHaveBeenCalledOnce();
    expect(replace.mock.calls[0][0]).toContain("raison=connexion");
    expect(screen.queryByText("PAGE")).toBeNull();
  });

  it("shows the page to a member", async () => {
    fetchMe.mockResolvedValue(me);
    render(page);
    await act(async () => {});
    expect(screen.getByText("PAGE")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows an error with a retry, and does not redirect, when the session is unknown", async () => {
    fetchMe.mockRejectedValue(new Error("down"));
    render(page);
    await act(async () => {});
    expect(screen.getByText("ERREUR")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a pending state while retrying, then the page once the server answers", async () => {
    fetchMe.mockRejectedValueOnce(new Error("down"));
    render(page);
    await act(async () => {});
    let answer!: (value: typeof me) => void;
    fetchMe.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    await act(async () => {
      screen.getByText("REESSAYER").click();
    });
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
    await act(async () => {
      answer(me);
      await Promise.resolve();
    });
    expect(screen.getByText("PAGE")).toBeTruthy();
  });

  it("brings back the retry button when the retry fails again", async () => {
    fetchMe.mockRejectedValue(new Error("down"));
    render(page);
    await act(async () => {});
    await act(async () => {
      screen.getByText("REESSAYER").click();
    });
    expect(screen.getByText("REESSAYER")).toBeTruthy();
  });

  it("does not redirect after a voluntary sign-out of the page that saw the member", async () => {
    setSessionUser(me);
    render(page);
    await act(async () => {});
    expect(screen.getByText("PAGE")).toBeTruthy();
    await act(async () => clearSession({ onPurpose: true }));
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects after a sign-out that was not voluntary (session expired elsewhere)", async () => {
    setSessionUser(me);
    render(page);
    await act(async () => {});
    await act(async () => clearSession());
    expect(replace).toHaveBeenCalledOnce();
  });

  it("still redirects a visitor on a page mounted right after a voluntary sign-out", async () => {
    clearSession({ onPurpose: true });
    fetchMe.mockResolvedValue(null);
    render(page);
    await act(async () => {
      await refreshSession();
    });
    expect(replace).toHaveBeenCalledOnce();
  });
});
