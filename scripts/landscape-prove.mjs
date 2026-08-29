#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const URL = "http://127.0.0.1:8080/";
const OUT_PNG = "screenshots/landscape-prove.png";

mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const fails = [];
let metrics = null;

try {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  metrics = await page.evaluate(() => {
    const shell = document.querySelector(".mobile-play-shell");
    const canvas = document.querySelector("canvas.apple-screen");
    const sheet = document.querySelector(".mobile-chrome-sheet");
    const c = canvas?.getBoundingClientRect();
    const s = sheet?.getBoundingClientRect();
    return {
      orientation: shell?.getAttribute("data-orientation") ?? null,
      hasShellLandscape:
        !!document.querySelector(
          '.mobile-play-shell[data-orientation="landscape"]',
        ),
      canvas: c
        ? {
            w: Math.round(c.width),
            h: Math.round(c.height),
            bottom: Math.round(c.bottom),
          }
        : null,
      sheetWidth: s ? Math.round(s.width) : null,
      bodyText: document.body.innerText,
      vh: window.innerHeight,
    };
  });

  if (!metrics.hasShellLandscape) {
    fails.push('missing .mobile-play-shell[data-orientation="landscape"]');
  }

  if (!metrics.canvas) {
    fails.push("missing canvas.apple-screen");
  } else {
    if (metrics.canvas.h < 280) {
      fails.push(
        `canvas height ${metrics.canvas.h} < 280 (near-full 390)`,
      );
    }
    if (metrics.canvas.w < 400) {
      fails.push(`canvas width ${metrics.canvas.w} < 400`);
    }
    if (metrics.canvas.bottom > metrics.vh + 1) {
      fails.push(
        `canvas bottom ${metrics.canvas.bottom} > viewport ${metrics.vh} + 1`,
      );
    }
  }

  if (/rotate to portrait/i.test(metrics.bodyText)) {
    fails.push("body text matches /rotate to portrait/i");
  }

  if (metrics.sheetWidth == null || metrics.sheetWidth > 64) {
    fails.push(
      `collapsed chrome sheet width ${metrics.sheetWidth} > 64`,
    );
  }

  const handle = page.locator(".mobile-chrome-handle").first();
  if ((await handle.count()) === 0) {
    fails.push("missing .mobile-chrome-handle to open Library");
  } else {
    await handle.click();
    await page.waitForTimeout(600);
    const openMetrics = await page.evaluate(() => {
      const canvas = document.querySelector("canvas.apple-screen");
      const c = canvas?.getBoundingClientRect();
      return {
        canvasH: c ? Math.round(c.height) : null,
        chrome: document
          .querySelector(".mobile-play-shell")
          ?.getAttribute("data-chrome"),
      };
    });
    metrics.open = openMetrics;
    if (openMetrics.canvasH == null || openMetrics.canvasH < 280) {
      fails.push(
        `after opening Library, canvas height ${openMetrics.canvasH} < 280`,
      );
    }
  }

  await page.screenshot({ path: OUT_PNG, fullPage: false });
  await context.close();
} catch (err) {
  fails.push(`prove crashed: ${err?.message ?? String(err)}`);
} finally {
  await browser.close();
}

const verdict = {
  ok: fails.length === 0,
  fails,
  metrics,
  screenshot: OUT_PNG,
};

console.log(JSON.stringify(verdict, null, 2));
process.exit(fails.length === 0 ? 0 : 1);
