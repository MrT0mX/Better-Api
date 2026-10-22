const assert = require("node:assert/strict");
const { test } = require("node:test");
const { effects, renderEffectSvg, getEffect } = require("../lib/text-effects");

test("provides original grouped styles with stable identifiers", () => {
  assert.ok(effects.length >= 30);
  assert.equal(new Set(effects.map((effect) => effect.id)).size, effects.length);
  assert.ok(effects.every((effect) => effect.group && effect.name));
  assert.equal(getEffect("neon").name, "Neon Glow");
  assert.equal(getEffect("not-a-style"), undefined);
});

test("renders every catalog style as valid escaped SVG", () => {
  for (const effect of effects) {
    const svg = renderEffectSvg({ text: "<safe>", effectId: effect.id });
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /&lt;safe&gt;/);
  }
});

test("renders escaped text and a second line as a valid SVG document", () => {
  const svg = renderEffectSvg({
    text: `<script>&"`,
    secondLine: "Safe subtitle",
    effectId: "aurora",
  });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /&lt;script&gt;&amp;&quot;/);
  assert.match(svg, /Safe subtitle/);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /linearGradient/);
});

test("rejects unknown render styles", () => {
  assert.throws(
    () => renderEffectSvg({ text: "hello", effectId: "unknown" }),
    /Unsupported text effect/
  );
});
