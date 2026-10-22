const assert = require("node:assert/strict");
const { test } = require("node:test");
const express = require("express");
const creativeRoutes = require("../routes/creative");
const { listUpstreamStyles } = require("../lib/creative/upstream-catalog");

test("creative APIs list styles and render original text, logo, and animated SVGs", async () => {
  const app = express();
  app.use(creativeRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const catalogResponse = await fetch(`${baseUrl}/api/creative/styles`);
    const catalog = await catalogResponse.json();
    assert.equal(catalog.status, true);
    assert.ok(Object.values(catalog.groups).flat().length >= 30);
    assert.equal(catalog.logoStyles.length, 6);
    assert.equal(catalog.animations.length, 4);
    assert.equal(listUpstreamStyles("textpro").styles.length, 20);
    assert.equal(listUpstreamStyles("photooxy").styles.length, 15);
    assert.equal(listUpstreamStyles("photooxy").requiresApiKey, true);
    assert.deepEqual(
      listUpstreamStyles("textpro").styles.find((style) => style.id === "video-game-classic").requiredQuery,
      ["text", "text2"]
    );
    assert.deepEqual(
      listUpstreamStyles("photooxy").styles.find((style) => style.id === "pubg").requiredQuery,
      ["text", "text2"]
    );

    const textResponse = await fetch(`${baseUrl}/api/creative/text/render?text=%3Cscript%3E&style=extrude`);
    const textSvg = await textResponse.text();
    assert.equal(textResponse.status, 200);
    assert.match(textResponse.headers.get("content-type"), /image\/svg\+xml/);
    assert.match(textSvg, /&lt;script&gt;/);
    assert.doesNotMatch(textSvg, /<script>/);

    const upstreamCatalogResponse = await fetch(`${baseUrl}/api/textpro/styles`);
    const upstreamCatalog = await upstreamCatalogResponse.json();
    assert.equal(upstreamCatalog.styles.length, 20);
    assert.equal(upstreamCatalog.styles[0].endpoint, "/api/textpro/pencil");

    const logoResponse = await fetch(`${baseUrl}/api/creative/logo/render?text=MrTom+Studio&style=shield&tagline=Original+designs`);
    assert.equal(logoResponse.status, 200);
    assert.match(await logoResponse.text(), /aria-label="MrTom Studio Shield Crest logo"/);

    const animationResponse = await fetch(`${baseUrl}/api/creative/animation/render?text=Hello&motion=shimmer`);
    const animationSvg = await animationResponse.text();
    assert.equal(animationResponse.status, 200);
    assert.match(animationSvg, /@keyframes shimmer/);

    const invalidResponse = await fetch(`${baseUrl}/api/creative/logo/render?text=Hello&style=unknown`);
    assert.equal(invalidResponse.status, 400);
    assert.equal((await invalidResponse.json()).status, false);

    const controlCharacterResponse = await fetch(`${baseUrl}/api/creative/text/render?text=Hello%00World`);
    assert.equal(controlCharacterResponse.status, 400);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
