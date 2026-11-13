const upstreamStyles = {
  textpro: {
    site: "https://textpro.me",
    paths: [
      "pencil", "glitch", "blackpink", "berry", "neon", "logobear",
      "3dchristmas", "thunder", "3dboxtext", "glitch2", "glitchtiktok",
      "video-game-classic", "marvel-studios", "ninja-logo", "green-horror",
      "magma", "3d-neon-light", "3d-orange-juice", "chocolate-cake", "strawberry",
    ],
  },
  photooxy: {
    site: "https://photooxy.com",
    paths: [
      "flaming", "shadow-sky", "metallic", "naruto", "pubg", "under-grass",
      "harry-potter", "flower-typography", "picture-of-love", "coffee-cup",
      "butterfly", "night-sky", "carved-wood", "illuminated-metallic", "sweet-candy",
    ],
  },
};

function listUpstreamStyles(provider) {
  const catalog = upstreamStyles[provider];
  if (!catalog) return null;
  const twoLineStyles = provider === "textpro"
    ? new Set(["glitch2", "glitchtiktok", "video-game-classic", "marvel-studios", "ninja-logo"])
    : new Set(["pubg"]);
  return {
    status: true,
    provider,
    upstream: catalog.site,
    requiresApiKey: true,
    note: "Rendered by the upstream website; availability and effect templates may change.",
    styles: catalog.paths.map((id) => ({
      id,
      endpoint: `/api/${provider}/${id}`,
      method: "GET",
      requiredQuery: ["text", ...(twoLineStyles.has(id) ? ["text2"] : [])],
      apiKey: "apikey query parameter or x-api-key header",
    })),
  };
}

module.exports = { upstreamStyles, listUpstreamStyles };
