import assert from "node:assert/strict";
import test from "node:test";
import {
  bootError,
  commandEchoed,
  isIdleBasicPrompt,
  looksLikeDos,
  readPrompt,
} from "./boot-parse.ts";

test("readPrompt sees a lone Applesoft ]", () => {
  assert.equal(readPrompt("\n\n]\n"), "]");
  assert.equal(readPrompt("]\u007f"), "]");
});

test("readPrompt ignores the APPLE ][ banner line", () => {
  assert.equal(readPrompt("APPLE ][\n"), null);
});

test("looksLikeDos matches the System Master HELLO banner", () => {
  const hello =
    "DOS VERSION 3.3  08/25/80\nAPPLE II PLUS OR ROMCARD  SYSTEM MASTER\n(LOADING INTEGER INTO LANGUAGE CARD)\n";
  assert.equal(looksLikeDos(hello), true);
  assert.equal(looksLikeDos("]"), false);
});

test("commandEchoed does not treat LOADING INTEGER as INT", () => {
  const hello =
    "DOS VERSION 3.3  08/25/80\n(LOADING INTEGER INTO LANGUAGE CARD)\n]";
  assert.equal(commandEchoed(hello, "]", "INT"), false);
  assert.equal(commandEchoed("]INT", "]", "INT"), true);
  assert.equal(commandEchoed("]INT\r", "]", "INT\r"), true);
});

test("commandEchoed requires the RUN line, not a catalog hit", () => {
  const catalog = "A 028 LITTLE BRICK OUT\nA 009 COLOR DEMOSOFT\n]";
  assert.equal(commandEchoed(catalog, "]", "RUN LITTLE BRICK OUT"), false);
  assert.equal(
    commandEchoed("]RUN LITTLE BRICK OUT", "]", "RUN LITTLE BRICK OUT\r"),
    true,
  );
});

test("idle BASIC prompt detector", () => {
  assert.equal(isIdleBasicPrompt("]\u007f"), true);
  assert.equal(isIdleBasicPrompt("LOADING TB_6502 BY VINCE WEAVER"), false);
});

test("bootError", () => {
  assert.match(bootError("?FILE NOT FOUND") ?? "", /FILE NOT FOUND/);
  assert.equal(bootError("HELLO"), null);
});
