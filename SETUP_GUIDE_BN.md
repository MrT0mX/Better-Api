# Better-Api: A-to-Z সেটআপ গাইড

এই গাইডে লোকাল কম্পিউটারে চালানো, MongoDB, account/email, AI provider, effect API, production secret ও troubleshooting—সব ধাপ এক জায়গায় দেওয়া আছে।

## ১. যা লাগবে

- Node.js `22.22.1` (প্রজেক্টের `engines` সীমার মধ্যে)।
- Git ও npm।
- MongoDB: নিজের কম্পিউটারে MongoDB Community Server, অথবা MongoDB Atlas cluster।
- Account verification/password reset email পাঠাতে SMTP credentials (ঐচ্ছিক)।
- Gemini/অন্য AI ব্যবহার করতে সংশ্লিষ্ট provider-এর API key (ঐচ্ছিক; provider-এর usage/price limit প্রযোজ্য)।

## ২. Project নামানো ও Node.js প্রস্তুত করা

টার্মিনাল খুলে:

```bash
git clone https://github.com/MrT0mX/Better-Api.git
cd Better-Api
```

`nvm` থাকলে:

```bash
nvm install 22.22.1
nvm use 22.22.1
node --version
npm --version
```

Node version `v22.22.1` দেখুন। `nvm` না থাকলে Node.js-এর official installer দিয়ে 22.x install করুন।

## ৩. MongoDB সেটআপ

### বিকল্প A — MongoDB Atlas (beginner-এর জন্য সহজ)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)-এ account খুলুন এবং project তৈরি করুন।
2. Database deployment-এ free/shared tier থাকলে সেটি নির্বাচন করুন। Availability ও limits Atlas বদলাতে পারে।
3. `Database Access` থেকে আলাদা database user ও শক্ত password তৈরি করুন। এটি Atlas website-এর login password নয়।
4. `Network Access`-এ নিজের বর্তমান IP যোগ করুন। Production server-এর outbound IP স্থির ও জানা থাকলে শুধু সেটি allowlist করুন। `0.0.0.0/0` সব IP-কে database connection চেষ্টা করতে দেয়—এটি নিরাপদ default নয়; ব্যবহার করলে শক্ত database password ও স্বল্পমেয়াদি পরীক্ষার মধ্যে সীমিত রাখুন।
5. Cluster-এর `Connect` → `Drivers` থেকে `mongodb+srv://...` connection string কপি করুন।
6. `<password>`-এর জায়গায় database user's password বসান; password-এ `@`, `#`, `/`-এর মতো চিহ্ন থাকলে URL-encode করুন।
7. URI-তে project/database name এবং প্রয়োজন হলে `retryWrites=true&w=majority` রাখুন। উদাহরণ:

   ```text
   mongodb+srv://DB_USER:URL_ENCODED_PASSWORD@cluster.example.mongodb.net/better-api?retryWrites=true&w=majority
   ```

8. এই সম্পূর্ণ URI `.env`-এর lowercase `mongodb` variable-এ রাখুন। URI GitHub-এ বা chat-এ প্রকাশ করবেন না।

### বিকল্প B — নিজের কম্পিউটারে MongoDB

1. [MongoDB Community Server](https://www.mongodb.com/try/download/community) install করুন।
2. OS installer-এর service option enable করুন, যাতে MongoDB background-এ চলে।
3. Linux-এ service status দেখুন: `sudo systemctl status mongod`। বন্ধ থাকলে `sudo systemctl start mongod` চালান।
4. MongoDB Compass থাকলে `mongodb://127.0.0.1:27017` দিয়ে connect করে `better-api` database তৈরি/দেখতে পারেন। App প্রথমে connect করলেও database/collection তৈরি হবে।
5. `.env`-এ `mongodb="mongodb://127.0.0.1:27017/better-api"` রাখুন।

লোকাল MongoDB সাধারণত শুধু নিজের কম্পিউটারে সীমাবদ্ধ থাকে। Render/অন্য cloud host-এ deploy করলে সেখান থেকে accessible Atlas/managed MongoDB URI দিন; `127.0.0.1` production database নয়।

## ৪. Environment file তৈরি করা

```bash
cp .env.example .env
```

`.env` editor-এ খুলে প্রয়োজনীয় values দিন। সর্বনিম্ন local run-এর জন্য:

```env
mongodb="mongodb://127.0.0.1:27017/better-api"
PORT=8080
SESSION_SECRET="local-only-change-this-to-a-long-random-value"
```

Production-এ `SESSION_SECRET` অবশ্যই কমপক্ষে 32 অক্ষরের unique random secret হবে। Terminal-এ random value বানাতে পারেন:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

এই value `.env` বা hosting provider-এর secret settings-এ রাখুন—source code-এ নয়। `.env` Git-এ commit করবেন না; `.env.example`-এ কেবল blank/sample values রাখুন।

## ৫. Email ও CAPTCHA (ঐচ্ছিক)

- `sendemail`, `fromsendemail`, `sendpwmail` ও `servicesmtp`-এ আপনার SMTP provider-এর অনুমোদিত SMTP account details দিন।
- SMTP configure না থাকলে server চলতে পারে, তবে verification/password-reset email পাঠানো যাবে না। ফলে email verification নির্ভর feature ব্যবহার সীমিত হবে।
- reCAPTCHA চালু করতে `recaptcha_key_1`-এ site key এবং `recaptcha_key_2`-এ secret key দিন। দুটিই ফাঁকা থাকলে app CAPTCHA middleware skip করে।
- `domain`-এ public domain/host দিন; local-এর জন্য `localhost:8080`।

## ৬. Gemini API key তৈরি ও যোগ করা

1. [Google AI Studio](https://aistudio.google.com/)-এ Google account দিয়ে sign in করুন।
2. API key তৈরির page খুলুন: [AI Studio API keys](https://aistudio.google.com/apikey)।
3. Project নির্বাচন/তৈরি করে API key তৈরি করুন। Google-এর বর্তমান eligibility, quota, regional availability ও billing conditions দেখুন।
4. key-টি `.env`-এ `GEMINI_API_KEY="আপনার-key"` হিসেবে রাখুন।
5. server restart করে `GET /api/ai/providers` দেখুন—Gemini configured হিসেবে আসার কথা। API key কখনো browser JavaScript, public repo বা screenshot-এ রাখবেন না।
6. Gemini request account-এ login করা user-এর dashboard থেকে, অথবা verified account-এর API key দিয়ে পাঠান। Guest AI locked।

অন্যান্য provider-এর জন্য `.env`-এ `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY` ব্যবহার করুন। OpenAI-compatible endpoint হলে `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` দিন। Provider ব্যবহার করলে তাদের নিজস্ব usage terms, quota ও cost প্রযোজ্য।

## ৭. Admin account (ঐচ্ছিক)

প্রথমবারের admin bootstrap-এর জন্য `.env` বা host secret store-এ তিনটি variable একসঙ্গে দিন:

```env
ADMIN_USERNAME="mrtomxx"
ADMIN_EMAIL="নিজের-নিয়ন্ত্রিত-email@example.com"
ADMIN_PASSWORD="নতুন-unique-password-12+chars"
```

Password-এ uppercase, lowercase, number, কমপক্ষে 12 characters লাগবে; whitespace দেওয়া যাবে না। MongoDB-তে account না থাকলে startup-এ bcrypt hash করে verified admin বানায়। একই username ও email-এর account থাকলে সেটিকে admin/verified করে; অন্য account-এর password বদলায় না। তারপর `/login`-এ username বা email দিয়ে স্বাভাবিক login করুন। Automatic login নেই। Admin-এর app API quota unlimited; provider-এর external AI charge তবুও হতে পারে।

## ৮. Dependency install ও server চালানো

প্রজেক্ট root-এ:

```bash
npm ci --legacy-peer-deps
npm start
```

Development mode:

```bash
npm run dev
```

Browser-এ `http://localhost:8080` খুলুন। Server status: `http://localhost:8080/healthz`। Database connect না থাকলে health response `503`/`degraded` দেখাবে—আগে MongoDB URI, service ও network allowlist ঠিক করুন।

## ৯. Account, API key ও dashboard

1. `/signup` থেকে account তৈরি করুন।
2. SMTP configure করা থাকলে email verification link খুলুন; verification ছাড়া account API key কাজ করবে না।
3. `/login`-এ sign in করুন।
4. `/docs` dashboard-এ নিজের API key, quota ও endpoint examples দেখুন।
5. API key URL-এর `apikey` query parameter অথবা `x-api-key` header-এ পাঠান। Public endpoint ছাড়া key কাউকে দেবেন না।

## ১০. Text effect, logo ও animation API

এই project-এ reference site-গুলোতে দেখা effect family—3D, metallic, neon/glow, gradient, fire/ice, nature, retro, digital, photo-art style—থেকে তৈরি **৩১টি original SVG text style**, ৬টি geometric logo style এবং ৪টি SVG motion preset আছে। এছাড়া legacy integrations-এ ২০টি TextPro ও ১৫টি Photooxy endpoint আছে। Preview APIs guest-এর জন্য, প্রতি IP-তে সর্বোচ্চ ৩০ request/minute। SVG response browser-এ দেখা যায় এবং download করা যায়।

Style catalog:

```text
GET /api/creative/styles
GET /api/text-effects/styles
GET /api/textpro/styles
GET /api/photooxy/styles
```

Text effect preview:

```text
GET /api/creative/text/render?text=Hello&style=extrude
GET /api/text-effects/render?text=Hello&effect=neon
```

Logo / animation:

```text
GET /api/creative/logo/render?text=MrTom%20Studio&style=shield&tagline=Original%20designs
GET /api/creative/animation/render?text=Hello&motion=shimmer
```

Logo styles: `monogram`, `shield`, `orbit`, `hexagon`, `seal`, `wave`। Motion: `pulse`, `float`, `shimmer`, `bounce`। `text` সর্বোচ্চ ২৪–২৮ অক্ষর; optional tagline ৩২, second line ২০ অক্ষর।

`/api/text-effects/*` ও `/api/creative/*` original SVG endpoint-এ API key লাগে না; rate limit আছে। পুরোনো `/api/textpro/*` এবং `/api/photooxy/*` image generation endpoints account API key নেয় এবং upstream TextPro/Photooxy service-এর availability/পরিবর্তনের ওপর নির্ভরশীল। Upstream site-এর terms ও limits মানুন; endpoint বন্ধ/পরিবর্তিত হলে request ব্যর্থ হতে পারে।

### বর্তমানে থাকা TextPro endpoints

`/api/textpro/pencil`, `/api/textpro/glitch`, `/api/textpro/blackpink`, `/api/textpro/berry`, `/api/textpro/neon`, `/api/textpro/logobear`, `/api/textpro/3dchristmas`, `/api/textpro/thunder`, `/api/textpro/3dboxtext`, `/api/textpro/glitch2`, `/api/textpro/glitchtiktok`, `/api/textpro/video-game-classic`, `/api/textpro/marvel-studios`, `/api/textpro/ninja-logo`, `/api/textpro/green-horror`, `/api/textpro/magma`, `/api/textpro/3d-neon-light`, `/api/textpro/3d-orange-juice`, `/api/textpro/chocolate-cake`, `/api/textpro/strawberry`।

### বর্তমানে থাকা Photooxy endpoints

`/api/photooxy/flaming`, `/api/photooxy/shadow-sky`, `/api/photooxy/metallic`, `/api/photooxy/naruto`, `/api/photooxy/pubg`, `/api/photooxy/under-grass`, `/api/photooxy/harry-potter`, `/api/photooxy/flower-typography`, `/api/photooxy/picture-of-love`, `/api/photooxy/coffee-cup`, `/api/photooxy/butterfly`, `/api/photooxy/night-sky`, `/api/photooxy/carved-wood`, `/api/photooxy/illuminated-metallic`, `/api/photooxy/sweet-candy`।

TextPro/Photooxy উদাহরণ (সফল response হলে image file লিখবে):

```bash
curl -L -G "http://localhost:8080/api/textpro/neon" \
  --data-urlencode "text=Hello" \
  --data-urlencode "apikey=YOUR_ACCOUNT_API_KEY" \
  -o textpro-neon.png
```

`/api/textpro/styles` ও `/api/photooxy/styles` থেকে endpoint metadata পাওয়া যাবে। অধিকাংশ effect-এ `text` লাগে; TextPro `glitch2`, `glitchtiktok`, `video-game-classic`, `marvel-studios`, `ninja-logo` এবং Photooxy `pubg`-তে `text2`-ও বাধ্যতামূলক।

নিজস্ব SVG output:

```bash
curl -L -G "http://localhost:8080/api/creative/logo/render" \
  --data-urlencode "text=MrTom Studio" \
  --data-urlencode "style=orbit" \
  -o logo.svg
```

Public inspiration pages: [TextPro](https://textpro.me/), [Photooxy](https://photooxy.com/), [FlamingText](https://flamingtext.com/), [Cool Text](https://cooltext.com/), [MockoFun](https://mockofun.com/)। `photo3d.com` fetch এই যাচাইয়ে পাওয়া যায়নি। এগুলোর live design library বড় ও পরিবর্তনশীল; এই project সব site-এর প্রতিটি proprietary template হুবহু mirror করে না। Project-এর SVG styles original implementation, আর upstream-backed routes upstream-এর নিজস্ব output ফেরত দেয়।

## ১১. AI Chat ও Agent

Configured provider status:

```text
GET /api/ai/providers
```

AI chat (verified account API key অথবা logged-in session প্রয়োজন):

```bash
curl -X POST "http://localhost:8080/api/ai/chat" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ACCOUNT_API_KEY" \
  -d '{"provider":"gemini","messages":[{"role":"user","content":"REST API সহজভাবে বুঝিয়ে বলো"}]}'
```

Teaching agent:

```bash
curl -X POST "http://localhost:8080/api/agent/chat" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ACCOUNT_API_KEY" \
  -d '{"provider":"gemini","mode":"teach","messages":[{"role":"user","content":"HTTP status code শেখাও"}]}'
```

Teaching mode prompt-কে tutor-ধাঁচের উত্তর দিতে বলে; conversation/model-কে স্বয়ংক্রিয়ভাবে train বা স্থায়ীভাবে মনে রাখে না। AI provider-এর API key server-এ রাখুন, account quota ও provider cost মাথায় রাখুন।

## ১২. Test ও deploy

Local test:

```bash
npm test
```

Production deploy-এ:

1. GitHub repo-তে code push করুন।
2. Host-এ Node `22.x`, build command `npm ci --legacy-peer-deps`, start command `npm start` দিন।
3. Host-এর secret/environment settings-এ প্রয়োজনীয় `.env` values বসান। `.env` file upload/commit করবেন না।
4. Production MongoDB URI, `SESSION_SECRET` (৩২+ অক্ষর), public `domain`, optional SMTP/CAPTCHA, admin ও AI keys দিন।
5. `/healthz`, `/login`, `/api/creative/styles` দেখে smoke test করুন।
6. Free web services idle হলে sleep হতে পারে; free tier-এ uninterrupted 24/7 নিশ্চয়তা নেই। Service-এর terms বা limits পাশ কাটাতে fake uptime pinger ব্যবহার করবেন না।

## ১৩. সাধারণ সমস্যা

- **`/healthz` 503:** MongoDB service/URI, Atlas IP allowlist, database username/password ও URI encoding পরীক্ষা করুন।
- **Login session টেকে না:** Production `SESSION_SECRET` স্থির, random ও 32+ characters রাখুন।
- **Verification email আসছে না:** SMTP host/service, sender address, app password, spam folder পরীক্ষা করুন।
- **reCAPTCHA কাজ করছে না:** site key ও secret একই domain-এ তৈরি হয়েছে কি না যাচাই করুন; local test-এর জন্য দুটো key ফাঁকা রাখুন।
- **AI endpoint 503:** `/api/ai/providers`, `.env` key spelling, server restart, provider region/quota পরীক্ষা করুন।
- **TextPro/Photooxy endpoint ব্যর্থ:** upstream page/effect বদলে/বন্ধ হয়ে থাকতে পারে; একই text-এর জন্য original SVG `/api/creative/*` ব্যবহার করুন।
- **API key 401/403/429:** key সঠিক কি না, email verified কি না, user quota শেষ কি না যাচাই করুন। Admin ছাড়া normal user-এর quota সীমিত।

## নিরাপত্তা checklist

- `.env`, database URI, SMTP password, AI key বা API key commit/share করবেন না।
- Chat/public commit-এ দেওয়া password-কে exposed ধরে rotate করুন।
- Production-এ development/test secret ব্যবহার করবেন না।
- Database IP allowlist যতটা সম্ভব narrow রাখুন।
- Third-party AI/image provider-এর fees, privacy policy, terms ও request limits পড়ুন।
