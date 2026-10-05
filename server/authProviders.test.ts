import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthProviderStatus } from "./_core/localAuthRoutes";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("local authentication provider readiness", () => {
  it("keeps email sign-in and recovery unavailable without a database", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("RESEND_API_KEY", "resend-key");
    vi.stubEnv("AUTH_EMAIL_FROM", "Mercato <auth@example.test>");

    expect(getAuthProviderStatus()).toEqual({
      email: false,
      passwordRecovery: false,
    });
  });

  it("requires a configured email sender for password recovery", () => {
    vi.stubEnv("DATABASE_URL", "mysql://test.invalid/mercato");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("AUTH_EMAIL_FROM", "");

    expect(getAuthProviderStatus()).toEqual({
      email: true,
      passwordRecovery: false,
    });
  });

  it("marks email sign-in and recovery available when configured", () => {
    vi.stubEnv("DATABASE_URL", "mysql://test.invalid/mercato");
    vi.stubEnv("RESEND_API_KEY", "resend-key");
    vi.stubEnv("AUTH_EMAIL_FROM", "Mercato <auth@example.test>");

    expect(getAuthProviderStatus()).toEqual({
      email: true,
      passwordRecovery: true,
    });
  });
});
