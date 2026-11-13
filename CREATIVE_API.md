# Better-Api Creative Design API

The Creative Studio library is original to Better-Api. The API can render any of its 45 templates as SVG or PNG, with optional text and a user supplied photo. Photo bytes are processed in the API request and are not saved by this feature.

## Catalog

`GET https://better-api-eta.vercel.app/api/creative/catalog`

Returns the 15 categories and their template IDs. Use the `id` from a category and the `id` from one of its templates in render requests.

## Render

`GET` or `POST https://better-api-eta.vercel.app/api/creative/design/render`

Required values:

- `category`: category ID from the catalog, such as `frames`
- `template`: template ID from that category, such as `botanical`
- `text`: main text (up to 42 characters)
- `apikey`: Better-Api account key, or send it as the `x-api-key` header

Optional values:

- `subtext`: second line (up to 32 characters)
- `image`: a `data:image/png;base64,...`, `data:image/jpeg;base64,...`, or `data:image/webp;base64,...` value, up to 2.7 MB decoded
- `intensity`: 20–100; defaults to 70
- `format`: `svg` (default) or `png`

For bot integrations, use `POST` and put the key in the header so it does not appear in URLs or logs:

```js
const response = await fetch("https://better-api-eta.vercel.app/api/creative/design/render", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": process.env.BETTER_API_KEY,
  },
  body: JSON.stringify({
    category: "frames",
    template: "botanical",
    text: "Happy Birthday",
    subtext: "Have a wonderful day",
    image: photoDataUrl, // optional base64 PNG, JPEG, or WEBP
    format: "png",
  }),
});

if (!response.ok) throw new Error(await response.text());
const imageBuffer = Buffer.from(await response.arrayBuffer());
// Send imageBuffer to your bot platform as a PNG attachment.
```

The response is the image itself (`image/png` or `image/svg+xml`), not JSON. An invalid key, category, template, image, or text returns a JSON error response. Requests use the account's existing API quota rules.

## Existing text-art routes

Legacy `/api/photooxy/{style}` paths remain available for existing bots. They render original Better-Api text art locally and return SVG; no Photooxy request is made. List supported styles with `GET /api/photooxy/styles`.
