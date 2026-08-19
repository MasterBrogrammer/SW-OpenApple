#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(
  () => document.querySelector("[data-emu-status]")?.getAttribute("data-emu-status") === "ready",
);
await page.waitForTimeout(4000);

const probe = await page.evaluate(() => {
  const m = window.__oa;
  const vm = m.apple2.getVideoModes();
  const gr = vm.getLoresPage(1);
  const cpu = m.apple2.getCPU();
  const beforeDirty = { ...gr.dirty };
  const beforeText = vm.getText();
  const state = vm.getState();

  // Force a full video refresh + blit
  gr.refresh();
  const dirtyAfterRefresh = { ...gr.dirty };
  const blitted = vm.blit();

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let bright = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] + data[i + 1] + data[i + 2] > 80) bright += 1;
  }

  // Probe whether CPU writes dirty the lores page
  const d1 = { ...gr.dirty };
  cpu.write(0x04, 0x00, 0xc1);
  const d2 = { ...gr.dirty };

  const mmu = m.apple2.getMMU();
  let writeHandler = null;
  try {
    // peek internal pages if possible
    writeHandler = mmu._writePages?.[4]?.constructor?.name || typeof mmu._writePages?.[4]?.write;
  } catch (e) {
    writeHandler = String(e);
  }

  return {
    beforeDirty,
    dirtyAfterRefresh,
    blitted,
    bright,
    beforeText: beforeText.slice(0, 200),
    state,
    d1,
    d2,
    writeHandler,
    charset0: gr.charset ? undefined : "no charset field",
  };
});

console.log(JSON.stringify(probe, null, 2));
await page.locator("canvas").screenshot({ path: "/workspace/screenshots/emu-forced-refresh.png" });
await browser.close();
