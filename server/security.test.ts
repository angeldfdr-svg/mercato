import { createServer } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Request } from "express";
import { createApp } from "./_core/app";
import { resolveAppOrigin, isSameOriginMutation } from "./_core/requestOrigin";
import { hashPassword, verifyPassword } from "./localAuth";

function fakeRequest(
  headers: Record<string, string | undefined>,
  protocol = "https"
) {
  return {
    protocol,
    method: "POST",
    get: (name: string) => headers[name.toLowerCase()],
  } as unknown as Request;
}

function clearConfiguredOrigins() {
  vi.stubEnv("APP_URL", "");
  vi.stubEnv("PUBLIC_APP_URL", "");
  vi.stubEnv("VERCEL_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public origin and browser request security", () => {
  it("uses the configured application origin instead of a spoofed Origin header", () => {
    vi.stubEnv("APP_URL", "https://shop.example.com/");
    const req = fakeRequest({
      host: "attacker.example",
      origin: "https://attacker.example",
    });

    expect(resolveAppOrigin(req)).toBe("https://shop.example.com");
  });

  it("rejects a browser Origin that does not match the request host", () => {
    clearConfiguredOrigins();
    const req = fakeRequest({
      host: "shop.example.com",
      origin: "https://attacker.example",
    });

    expect(() => resolveAppOrigin(req)).toThrow(/não corresponde/);
  });

  it("rejects public URLs containing paths or insecure non-local HTTP origins", () => {
    vi.stubEnv("APP_URL", "https://shop.example.com/redirect");
    expect(() =>
      resolveAppOrigin(fakeRequest({ host: "shop.example.com" }))
    ).toThrow(/sem caminho/);

    vi.stubEnv("APP_URL", "http://shop.example.com");
    expect(() =>
      resolveAppOrigin(fakeRequest({ host: "shop.example.com" }))
    ).toThrow(/HTTPS/);
  });

  it("requires a configured public URL in production", () => {
    clearConfiguredOrigins();
    vi.stubEnv("NODE_ENV", "production");

    expect(() =>
      resolveAppOrigin(fakeRequest({ host: "attacker.example" }))
    ).toThrow(/Configure APP_URL/);
  });

  it("allows only exact same-origin browser writes", () => {
    const sameOrigin = fakeRequest(
      {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      "http"
    );
    const crossOrigin = fakeRequest(
      {
        host: "localhost:3000",
        origin: "http://localhost:3001",
      },
      "http"
    );
    const missingOrigin = fakeRequest({ host: "localhost:3000" }, "http");

    expect(isSameOriginMutation(sameOrigin)).toBe(true);
    expect(isSameOriginMutation(crossOrigin)).toBe(false);
    expect(isSameOriginMutation(missingOrigin)).toBe(false);
  });

  it("blocks cross-site API writes and rate-limits repeated login attempts", async () => {
    const app = await createApp({ serveFrontend: false });
    const server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Test server did not bind to a TCP port");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const crossSite = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      });
      expect(crossSite.status).toBe(403);

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            origin: baseUrl,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email: "unknown@example.test",
            password: "not-the-password",
          }),
        });
        expect(response.status).not.toBe(429);
      }

      const limited = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          origin: baseUrl,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "unknown@example.test",
          password: "not-the-password",
        }),
      });
      expect(limited.status).toBe(429);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => (error ? reject(error) : resolve()));
      });
    }
  });
});

describe("local password hashing", () => {
  it("verifies the exact password without trimming user input", async () => {
    const password = "  mercatO-safe-passphrase  ";
    const encoded = await hashPassword(password);

    expect(await verifyPassword(password, encoded)).toBe(true);
    expect(await verifyPassword(password.trim(), encoded)).toBe(false);
    expect(await verifyPassword("incorrect password", encoded)).toBe(false);
  });
});
