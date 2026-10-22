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

`ADMIN_SETTINGS_ENCRYPTION_KEY`-এর জন্য আলাদা random key একবার তৈরি করুন এবং `.env`/hosting secret store-এ স্থায়ীভাবে সংরক্ষণ করুন:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

এই master key হারালে website-এ সংরক্ষিত AI/SMTP/API credentials decrypt করা যাবে না। MongoDB URI, session/admin bootstrap secrets এবং এই encryption master key Admin page-এ প্রবেশ করানো যায় না; সেগুলো hosting provider-এর secret settings-এ দিতে হবে।

এই values `.env` বা hosting provider-এর secret settings-এ রাখুন—source code-এ নয়। `.env` Git-এ commit করবেন না; `.env.example`-এ কেবল blank/sample values রাখুন।

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
6. Admin হিসেবে login করলে profile menu থেকে `/admin/settings` খুলুন। Credential একবার লিখে Save করুন; পরে পরিবর্তন না চাইলে আবার লিখতে হবে না। Field ফাঁকা রাখলে আগের value অক্ষত থাকে। Secret আর কোনো page/API response-এ ফেরত দেখানো হয় না।

Admin settings page-এ provider test থাকলে সেটি provider-এর public models endpoint-এ credential যাচাই করে; SMTP test শুধু connection যাচাই করে, email পাঠায় না। Cuttly/Bitly/reCAPTCHA-এর মতো service-এর key generic ভাবে test করা যায় না—সেগুলোর status “নিজে যাচাই করুন” দেখাতে পারে। Green status কেবল supported direct check সফল হলে দেখায়।

## ৯.১ Admin MFA, activity audit ও recovery

1. Admin হিসেবে login করে `/admin/security` খুলুন।
2. বর্তমান password দিয়ে MFA setup শুরু করুন; Authenticator app-এ setup key যোগ করে ৬ digit code verify করুন।
3. দেখানো ১০টি recovery code একবারই দেখা যায়—password manager বা offline নিরাপদ স্থানে রাখুন। Admin login-এর পর code চাইবে; প্রতি account-এ সর্বোচ্চ ৬টি MFA attempt/minute গ্রহণ হয়।
4. Settings page-এ recent admin action audit দেখা যায়। সেখানে credential value/password/API token রাখা হয় না; শুধু action, actor, status, setting names এবং hashed IP থাকে।
5. `/admin/settings` থেকে encrypted backup download করুন। Backup-এ database ciphertext থাকে—plaintext credential নয়। Restore করতে একই `ADMIN_SETTINGS_ENCRYPTION_KEY` host secret লাগবে। Backup ও ওই key আলাদা নিরাপদ স্থানে রাখুন; restore current DB values-এ encrypted records merge করে।
6. AI provider guardrails `/admin/settings`-এ configure করুন: per-account/provider requests per minute, shared per-provider daily requests এবং per-provider monthly token ceiling। Monthly cap প্রথমে আনুমানিক input tokens ও requested output reserve করে; provider usage পেলে actual count দিয়ে adjust করে। Provider billing আলাদা—এটি dollar limit বা vendor-side spending cap নয়। ৮০% token ceiling-এ API response ও Admin page-এ alert আসে।

Session store বর্তমানে process memory-তে থাকে; restart/deploy হলে session শেষ হয়ে user/admin-কে পুনরায় login করতে হবে। Multi-instance production-এ shared persistent session store ব্যবহার না করা পর্যন্ত একই app instance stickiness নিশ্চিত করুন।

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

## ১২. Vercel-এ deploy (serverless)

প্রজেক্টটি Express app হিসেবে Vercel Functions-এ চলে। Vercel-এ request এলে function জাগে; এটি VPS-এর মতো সারাক্ষণ চালু process নয়। তাই এখানে আলাদা server process চালু করবেন না, `npm start`-ও Vercel-এর Start Command হিসেবে দেবেন না। `vercel.json`-এ daily quota maintenance schedule আছে। Function/session state MongoDB-তে রাখা হয়; `MemoryStore` শুধু local non-Vercel run-এ ব্যবহৃত হয়।

### ১২.১ আগে প্রস্তুত করুন

1. GitHub-এ repository push করুন; `.env` বা real credential commit করবেন না।
2. Accessible MongoDB Atlas/managed MongoDB database তৈরি করুন। Atlas `Network Access`-এ Vercel-এর outbound IP স্থির না থাকলে provider-supported static egress/private networking ব্যবহার করুন। `0.0.0.0/0` কেবল ঝুঁকি বুঝে সাময়িকভাবে ব্যবহার করুন; এটি সব IP-কে DB connection চেষ্টা করতে দেয়।
3. নিচের secret locally generate করুন; terminal output কখনো chat/GitHub-এ দেবেন না:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   এই command আলাদা করে `SESSION_SECRET`, `ADMIN_SETTINGS_ENCRYPTION_KEY` ও `CRON_SECRET`-এর জন্য চালান; প্রতিটির value আলাদা রাখুন।
4. First-run admin-এর জন্য নতুন unique `ADMIN_PASSWORD` বানান। আগে public/chat-এ শেয়ার করা password পুনরায় ব্যবহার করবেন না।

### ১২.২ Vercel project তৈরি করুন

1. Vercel account-এ GitHub repository import করুন; Root Directory হবে project root (`Better-Api`)।
2. Framework auto-detect হলে সেটি রাখুন; না হলে **Other** নির্বাচন করুন। Install Command দিন `npm ci --legacy-peer-deps`; Build Command, Output Directory ও Start Command ফাঁকা/default রাখুন। `package.json`/`index.js` থেকে Vercel Express app শনাক্ত করে Function তৈরি করে।
3. Project → **Settings → Environment Variables**-এ values যোগ করুন। Production-এর জন্য অন্তত:

   ```text
   NODE_ENV=production
   mongodb=<সম্পূর্ণ MongoDB connection URI>
   SESSION_SECRET=<আলাদা 64-hex random secret>
   ADMIN_SETTINGS_ENCRYPTION_KEY=<আলাদা 64-hex random secret>
   CRON_SECRET=<আলাদা 64-hex random secret>
   ADMIN_USERNAME=<admin username>
   ADMIN_EMAIL=<আপনার নিয়ন্ত্রিত email>
   ADMIN_PASSWORD=<নতুন unique password>
   LIMIT_APIKEY=200
   domain=<আপনার Vercel domain, https:// ছাড়া>
   ```

   Vercel-এ variable name case-sensitive; উপরের বানান ঠিক রাখুন। `mongodb`-এর URI-তে database user/password ও database name থাকতে হবে; special character URL-encode করুন।
4. AI চাইলে `GEMINI_API_KEY`/অন্যান্য provider key, email চাইলে `sendemail`, `fromsendemail`, `sendpwmail`, `servicesmtp`, আর CAPTCHA চাইলে `recaptcha_key_1`, `recaptcha_key_2` environment-এ দিন। এগুলো ঐচ্ছিক। Website-এর admin settings page-এ AI/SMTP credential দিলেও সেটি MongoDB-তে encrypted হয়।
5. Variables Production environment-এ যোগ করে **Redeploy** করুন; variable পরিবর্তন পুরোনো deployment-এ লাগে না। প্রথম deployment-এ app MongoDB-তে connect করে bootstrap admin তৈরি করবে; এরপর `/login`-এ username/email ও password দিয়ে login করুন।

### ১২.৩ Deploy পরীক্ষা ও Cron

Deployment URL-এ নিচের address পরীক্ষা করুন:

```text
/
/healthz
/login
/api/creative/styles
/api/ai/providers
```

`/healthz`-এ `200` এবং `"database":"connected"` না এলে MongoDB URI, Atlas network access ও credentials ঠিক করে redeploy করুন। Admin settings/security URL login ছাড়া খুলবে না। Vercel Cron প্রতিদিন 19:00 UTC-তে `/api/maintenance/daily` চালায়—এটি Dhaka সময় রাত ১টায় daily request counter reset করে এবং মাসের প্রথম দিনে account quota-ও reset করে। `CRON_SECRET` environment variable প্রয়োজন; cron route সঠিক `Authorization: Bearer ...` ছাড়া কাজ করবে না। Cron schedule সাধারণত Production deployment-এ চলে; plan অনুযায়ী Cron availability/limits যাচাই করুন।

### Vercel-এ জেনে রাখুন

- Vercel serverless function 24/7 process নয়; idle হলে বন্ধ হয়, পরের request-এ cold start হতে পারে। Free plan-এ নিশ্চিত 24/7 availability নেই।
- Function execution duration, payload/bundle size ও plan limits প্রযোজ্য। বড় media/canvas কাজ, ধীর upstream TextPro/Photooxy, এবং ৩০ সেকেন্ড পর্যন্ত অপেক্ষা করা AI provider request সব plan-এ চলবে—এ নিশ্চয়তা নেই। Timeout হলে ওই workload-এর জন্য দীর্ঘ-running Node host ব্যবহার করুন।
- `public/` static assets Vercel CDN থেকে serve হয়; Express `express.static()` production asset serving-এর বিকল্প নয়। EJS views deployment function-এ include করার config `vercel.json`-এ আছে।
- MongoDB-backed session store-এর কারণে login একাধিক function instance-এর মধ্যে টিকে থাকে; `SESSION_SECRET` ও MongoDB URI স্থির রাখুন। MongoDB free tier storage/connection limits প্রযোজ্য।
- Vercel Cron plan/feature availability বদলাতে পারে; deployment-এর **Settings → Cron Jobs** ও function logs-এ schedule এবং response যাচাই করুন। Cron ব্যর্থ হলে protected maintenance endpoint-টি `CRON_SECRET` দিয়ে manual GET করে পরীক্ষা করুন; secret প্রকাশ করবেন না।

## ১৩. Test ও অন্যান্য host-এ deploy

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

## ১৪. সাধারণ সমস্যা

- **`/healthz` 503:** MongoDB service/URI, Atlas IP allowlist, database username/password ও URI encoding পরীক্ষা করুন।
- **Login session টেকে না:** Production `SESSION_SECRET` স্থির, random ও 32+ characters রাখুন।
- **Verification email আসছে না:** SMTP host/service, sender address, app password, spam folder পরীক্ষা করুন।
- **reCAPTCHA কাজ করছে না:** site key ও secret একই domain-এ তৈরি হয়েছে কি না যাচাই করুন; local test-এর জন্য দুটো key ফাঁকা রাখুন।
- **AI endpoint 503:** `/api/ai/providers`, `.env` key spelling, server restart, provider region/quota পরীক্ষা করুন।
- **TextPro/Photooxy endpoint ব্যর্থ:** upstream page/effect বদলে/বন্ধ হয়ে থাকতে পারে; একই text-এর জন্য original SVG `/api/creative/*` ব্যবহার করুন।
- **API key 401/403/429:** key সঠিক কি না, email verified কি না, user quota শেষ কি না যাচাই করুন। Admin ছাড়া normal user-এর quota সীমিত।
- **Vercel-এ `/healthz` 503:** Atlas network access-এ Vercel egress পৌঁছাতে পারছে কি না, `mongodb` variable-এর spelling/value ও database user password যাচাই করে redeploy করুন।
- **Vercel login/session বারবার শেষ হয়:** `SESSION_SECRET` বদলাচ্ছে কি না, MongoDB `sessions` collection accessible কি না এবং একই deployment-এর variables আছে কি না দেখুন।
- **Vercel cron চালায় না:** Production deploy, Cron plan support ও `CRON_SECRET` উপস্থিতি যাচাই করুন; function runtime logs দেখুন।

## নিরাপত্তা checklist

- `.env`, database URI, SMTP password, AI key বা API key commit/share করবেন না।
- Chat/public commit-এ দেওয়া password-কে exposed ধরে rotate করুন।
- Production-এ development/test secret ব্যবহার করবেন না।
- Database IP allowlist যতটা সম্ভব narrow রাখুন।
- Third-party AI/image provider-এর fees, privacy policy, terms ও request limits পড়ুন।
