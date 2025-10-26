import { chromium, Cookie } from "playwright";
import type { Page } from "playwright";
import type { Pool } from "pg";
import { randomInt } from "crypto";
import {
  ShareJobPayload,
  SerializedCookie,
  ShareAudience,
} from "@poshpilot/shared";
import { logEvent } from "../persistence";

type ShareSummary = {
  total: number;
  succeeded: number;
  failed: number;
  failures: { listingId: string; error: string }[];
};

type Executor = {
  execute: (payload: ShareJobPayload) => Promise<ShareSummary>;
};

function toPlaywrightCookies(cookies: SerializedCookie[]): Cookie[] {
  return cookies.map((cookie) => ({
    ...cookie,
    expires: cookie.expires ?? -1,
  }));
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureAuthenticated(pool: Pool, payload: ShareJobPayload, page: Page) {
  await page.goto("https://poshmark.com/feed", { waitUntil: "networkidle" });

  const challengeDetected = await detectsChallenge(page);
  if (challengeDetected) {
    await logEvent(pool, payload.id, "challenge-detected", "CAPTCHA or 2FA challenge detected", {
      url: page.url(),
    });
    throw new Error("CAPTCHA or 2FA challenge detected");
  }

  const needsLogin = await page.locator("text=Log in").first().isVisible().catch(() => false);
  if (!needsLogin) {
    return;
  }

  await logEvent(pool, payload.id, "auth-refresh", "Session appears stale; attempting refresh");
  if (!payload.authRefreshUrl) {
    throw new Error("Session expired and no authRefreshUrl provided");
  }

  const response = await fetch(payload.authRefreshUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: payload.id }),
  });

  if (!response.ok) {
    throw new Error(`Auth refresh failed with status ${response.status}`);
  }

  const data = (await response.json()) as { cookies: SerializedCookie[] };
  if (!data.cookies?.length) {
    throw new Error("Auth refresh response missing cookies");
  }

  const context = page.context();
  await context.clearCookies();
  await context.addCookies(toPlaywrightCookies(data.cookies));
  await page.reload({ waitUntil: "networkidle" });
  await logEvent(pool, payload.id, "auth-refresh", "Session cookies refreshed", {
    refreshedCookies: data.cookies.length,
  });

  const stillNeedsLogin = await page.locator("text=Log in").first().isVisible().catch(() => false);
  if (stillNeedsLogin) {
    throw new Error("Authentication refresh unsuccessful");
  }
}

async function detectsChallenge(page: Page): Promise<boolean> {
  const captchaText = await page.locator("text=CAPTCHA").first();
  if (await captchaText.isVisible().catch(() => false)) {
    return true;
  }
  const twoFactor = await page.locator("text=verification code").first();
  return twoFactor.isVisible().catch(() => false);
}

async function shareListing(
  page: Page,
  listingId: string,
  audience: ShareAudience
) {
  await page.goto(`https://poshmark.com/listing/${listingId}`, { waitUntil: "networkidle" });

  await page.waitForSelector("button:has-text('Share')", { timeout: 10_000 });
  await page.click("button:has-text('Share')");

  if (audience === "followers") {
    await page.click("button:has-text('To Followers')");
  } else {
    await page.click("button:has-text('To Party')");
  }

  await page.waitForSelector("text=Shared!", { timeout: 15_000 });
}

function computeDelay(minMs: number, maxMs: number): number {
  if (maxMs <= minMs) {
    return minMs;
  }
  return randomInt(minMs, maxMs + 1);
}

export function createExecutor(pool: Pool): Executor {
  return {
    async execute(payload: ShareJobPayload): Promise<ShareSummary> {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      });
      await context.addCookies(toPlaywrightCookies(payload.sessionCookies));
      const page = await context.newPage();

      const summary: ShareSummary = {
        total: payload.listingIds.length,
        succeeded: 0,
        failed: 0,
        failures: [],
      };

      try {
        await ensureAuthenticated(pool, payload, page);

        for (const listingId of payload.listingIds) {
          await logEvent(pool, payload.id, "share-started", "Sharing listing", { listingId });
          try {
            await shareListing(page, listingId, payload.audience);
            summary.succeeded += 1;
            await logEvent(pool, payload.id, "share-succeeded", "Listing shared", { listingId });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            summary.failed += 1;
            summary.failures.push({ listingId, error: message });
            await logEvent(pool, payload.id, "share-failed", message, { listingId });
          }

          const delay = computeDelay(payload.rate.minMs, payload.rate.maxMs);
          await sleep(delay);
        }
      } finally {
        await browser.close();
      }

      return summary;
    },
  };
}
