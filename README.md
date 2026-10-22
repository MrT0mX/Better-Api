> **Warning**: Owner Of The Repo Stopped working on this repo. So I have decided to edit and modify by myself thanks to Alipbot for giving us this repository.

<p align="center">
  <img src="https://i.postimg.cc/KzFVvQFy/1673631559924.jpg" width="200" height="200" alt="Logo">
</p>

<p align="center">
  <a href="#">
    <img src="http://readme-typing-svg.herokuapp.com?color=d1fa02&center=true&vCenter=true&multiline=false&lines=Welcome+To+MTX+Free+API" alt="Typing Animation">
  </a>
</p>

<p align="center">
  <a href="#"><img title="Creator" src="https://img.shields.io/badge/Modified By MrTomXxX-red.svg?style=for-the-badge&logo=github"></a>
</p>

<p align="center">
  <a href="https://github.com/MrT0mX?tab=followers"><img title="Followers" src="https://img.shields.io/github/followers/MrT0mX?color=green&style=flat-square"></a>
  <a href="https://github.com/MrT0mX/Better-Api/stargazers/"><img title="Stars" src="https://img.shields.io/github/stars/MrT0mX/Better-Api?color=white&style=flat-square"></a>
  <a href="https://github.com/MrT0mX/Better-Api/network/members"><img title="Forks" src="https://img.shields.io/github/forks/MrT0mX/Better-Api?color=yellow&style=flat-square"></a>
  <a href="https://github.com/MrT0mX/Better-Api/watchers"><img title="Watching" src="https://img.shields.io/github/watchers/MrT0mX/Better-Api?label=Watchers&color=red&style=flat-square"></a>
  <a href="https://github.com/MrT0mX/Better-Api"><img title="Open Source" src="https://badges.frapsoft.com/os/v2/open-source.svg?v=103"></a>
  <a href="https://github.com/MrT0mX/Better-Api/"><img title="Size" src="https://img.shields.io/github/repo-size/MrT0mX/Better-Api?style=flat-square&color=darkred"></a>
  <a href="https://hits.seeyoufarm.com"><img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FMrT0mX%2FBetter-Api%2Fhit-counter&count_bg=%2379C83D&title_bg=%23555555&icon=probot.svg&icon_color=%2304FF00&title=hits&edge_flat=false"/></a>
  <a href="https://github.com/MrT0mX/Better-Api/graphs/commit-activity"><img height="20" src="https://img.shields.io/badge/Maintained-No-red.svg"></a>&nbsp;&nbsp;
</p>

## 🛠️ Setup

### STEP 1: Fork this GitHub Repository

[![Fork](https://telegra.ph/file/0ac5b4f21a7c153f3bfc7.png)](https://github.com/MrT0mX/Better-Api/fork)

### STEP 2: Create a MongoDB Account and Database

[![MongoDB](https://telegra.ph/file/1bc5c9749e8a46d167619.png)](https://www.mongodb.com/cloud/atlas/register)

### STEP 3: Create an SMTP Email Account

[How to Create a Free SMTP Email](https://www.youtube.com/watch?v=1YXVdyVuFGA)

### STEP 4: Create a Render Account

[Create Account](https://dashboard.render.com/register)

1. Create a new web service.
2. Connect your GitHub account and select the forked repository.
3. Set the build command to `npm ci --legacy-peer-deps`.
4. Set the start command to `npm start`.
5. Click on "Advanced" and add the following environment variables:

```
mongodb = "mongodb+srv://username:password@cluster.example.mongodb.net/database"
sendemail = 'your-smtp-email@example.com'
fromsendemail = 'your-smtp-email@example.com'
sendpwmail = "replace-with-a-secret"
recaptcha_key_1 = 'your-recaptcha-site-key'
recaptcha_key_2 = 'your-recaptcha-secret-key'
```

## Example

বাস্তব database, SMTP বা reCAPTCHA credentials এখানে রাখবেন না। আগে কোনো public commit-এ credentials থাকলে সংশ্লিষ্ট provider-এ সেগুলো পরিবর্তন করুন।
```
mongodb = "mongodb+srv://username:password@cluster.example.mongodb.net/database"
sendemail = 'your-smtp-email@example.com'
fromsendemail = 'your-smtp-email@example.com'
sendpwmail = "replace-with-a-secret"
recaptcha_key_1 = 'your-recaptcha-site-key'
recaptcha_key_2 = 'your-recaptcha-secret-key'
```
Get Apikey Recaptcha From https://www.google.com/recaptcha/admin/create

6. Create the web service.
7. After successful deployment, add your website's domain to the settings file and update the reCAPTCHA keys in the environment variables.

## ⚙️ Configuration

Edit the file `settings.js` for the following configurations:

[`Change the Creator's name.`](https://github.com/MrT0mX/Better-Api/blob/master/settings.js#:~:text=creator%20%3D%20%27-,%E4%B9%82%F0%9D%98%BC%F0%9D%99%A1%F0%9D%99%9E%F0%9D%99%A5%E4%B9%82,-%27%20//%20Nama)<br>
[`Change the port.`](https://github.com/MrT0mX/Better-Api/blob/master/settings.js#:~:text=port%20%3D-,8080,-//port%20host)<br>
[`Adjust the API key limit.`](https://github.com/MrT0mX/Better-Api/blob/master/settings.js#:~:text=LimitApikey%20%3D-,200,-//%20Limit%20Apikey%20default)<br>

## 🚀 লোকাল সেটআপ ও চালু করা

ধাপে ধাপে সম্পূর্ণ guide—MongoDB Atlas/local setup, Gemini API key, SMTP, admin, website থেকে encrypted runtime credentials, সব effect API, deployment ও troubleshooting: [বাংলা A-to-Z Setup Guide](./SETUP_GUIDE_BN.md)।

Node.js `22.22.1` ব্যবহার করুন এবং MongoDB চালু রাখুন। প্রজেক্ট ফোল্ডারে একবার dependency ইনস্টল করুন:

Dependency ইনস্টল:

```bash
npm ci --legacy-peer-deps
```

`.env.example` কপি করে `.env` বানান এবং নিজের পরিবেশের মান বসান। MongoDB ও ইমেইল যাচাইয়ের জন্য `.env` কনফিগার করুন। Production-এ `SESSION_SECRET`-এ কমপক্ষে 32 অক্ষরের গোপন মান দিন। গোপন তথ্য Git-এ যোগ করবেন না।

```env
mongodb="mongodb+srv://your_user:your_password@cluster.mongodb.net/?retryWrites=true&w=majority"
sendemail="your_smtp_email@example.com"
fromsendemail="your_smtp_email@example.com"
sendpwmail="your_smtp_password"
recaptcha_key_1="your_recaptcha_site_key"
recaptcha_key_2="your_recaptcha_secret_key"
CUTTLY_API_KEYS=""
BITLY_API_KEYS=""
OPENAI_API_KEY=""
GEMINI_API_KEY=""
ANTHROPIC_API_KEY=""
OPENROUTER_API_KEY=""
OPENROUTER_SITE_URL=""
DEEPSEEK_API_KEY=""
GROQ_API_KEY=""
MISTRAL_API_KEY=""
LLM_API_KEY=""
LLM_BASE_URL=""
LLM_MODEL=""
SESSION_SECRET=""
PORT=8080
LIMIT_APIKEY=200
CREATOR="MrTom乂x乂"
USE_TEMP_EMAIL=true
servicesmtp="Zoho"
domain="localhost:8080"
ADMIN_USERNAME=""
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
```

5. ডেভেলপমেন্ট সার্ভার চালু করুন:

```bash
npm run dev
```

পরীক্ষা চালাতে:

```bash
npm test
```

Production-এ `npm start` ব্যবহার করুন। Dashboard `/docs`-এ—আগে লগইন করতে হবে। `GET /test` API key ছাড়াই পরীক্ষা করা যায়। `/effects`-এ account ছাড়া ৩১টি original SVG text style preview ও download করা যায়; Creative API-তে logo ও animated SVG-ও তৈরি হয়। Guest render route IP-প্রতি মিনিটে ৩০টি request-এ সীমিত।

### First-run admin setup

Optional secure admin bootstrap-এর জন্য `.env`/hosting secret store-এ `ADMIN_USERNAME=mrtomxx`, `ADMIN_EMAIL` এবং একটি নতুন, unique `ADMIN_PASSWORD` দিন (কমপক্ষে ১২ অক্ষর; uppercase, lowercase ও digit থাকবে)। MongoDB-তে account না থাকলে server password-টি bcrypt hash করে verified admin account তৈরি করবে। matching account আগে থেকেই থাকলে সেটিকে verified admin role দেয়; existing password বদলায় না। এরপর `/login`-এ username অথবা email ও সেই admin account-এর password দিয়ে স্বাভাবিকভাবে login করুন—automatic login/backdoor নেই। Admin API key quota-তে সীমাবদ্ধ নয়; AI usage provider-এর billing-এ পড়তে পারে। Bootstrap-এর পর admin password deployment secrets-এ সংরক্ষণ করুন; `.env` বা code-এ commit করবেন না। এখানে আগে শেয়ার করা password-টি exposed ধরে নতুন password ব্যবহার করুন।

Login করার পর profile menu থেকে `/admin/settings` খুলে Gemini/OpenAI/অন্য AI keys, SMTP, Cuttly/Bitly ও reCAPTCHA credentials একবার save করতে পারবেন। Database-এ AES-256-GCM encrypted থাকে এবং page/API-তে plaintext ফেরত আসে না; existing blank field ফাঁকা রাখলে saved value অক্ষত থাকে। আগে `.env`/hosting secrets-এ stable `ADMIN_SETTINGS_ENCRYPTION_KEY` (কমপক্ষে ৩২ অক্ষরের random value) দিন। MongoDB URI, `SESSION_SECRET`, admin bootstrap password ও encryption master key ইচ্ছাকৃতভাবেই শুধু host secret store-এ থাকবে—web form-এ নয়। Supported provider test pass করলে green, fail করলে red; SMTP test email পাঠায় না।

### ২৪ ঘণ্টা চালু রাখা ও free hosting

Local setup-এর দ্রুত ধাপ:

```bash
nvm use
npm ci --legacy-peer-deps
cp .env.example .env
# .env-এ MongoDB URI, 32+ অক্ষরের SESSION_SECRET, ও চাইলে SMTP/AI/admin secrets দিন
npm start
```

Browser-এ `http://localhost:8080` খুলুন; `http://localhost:8080/healthz` দিয়ে service status দেখুন। MongoDB database লাগবে; MongoDB Atlas-এর free shared cluster একটি বিকল্প। Account verification/password reset-এর email চালাতে SMTP credentials লাগবে; SMTP না থাকলে সেই email features কাজ করবে না। AI provider secret ছাড়া AI routes `503` দেবে।

Render-এ free web service deploy করতে repository connect করুন, build command `npm ci --legacy-peer-deps`, start command `npm start` দিন; Render environment settings-এ `.env`-এর প্রয়োজনীয় values secrets হিসেবে যোগ করুন। Free web services idle হলে sleep/spin down হতে পারে, তাই **free hosting-এ নিশ্চিত uninterrupted 24/7 availability নেই**। ঘুম এড়াতে fake uptime pinger ব্যবহার করবেন না—provider-এর limits মানুন। সত্যিকারের সবসময়-চালু instance দরকার হলে কোনো free Always-Free VM allocation (যেমন Oracle Cloud Always Free, যদি account/region-এ পাওয়া যায়) ব্যবহার করে Node 22, MongoDB connectivity ও process manager/systemd configure করুন; capacity/availability guaranteed নয়। Production uptime guarantee সাধারণত paid hosting চায়।

### AI chat ও teaching agent

AI provider চালু করতে `.env`-এ provider key সেট করুন। Supported providers: OpenAI, Gemini, Anthropic/Claude, OpenRouter, DeepSeek, Groq, Mistral এবং OpenAI-compatible custom LLM (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`)। Custom LLM-এর `LLM_BASE_URL`-এ সম্পূর্ণ chat-completions endpoint URL দিন। Key browser-এ প্রকাশ করা হয় না। `GET /api/ai/providers` provider configuration status ও default model দেখায়। AI chat/agent-এর জন্য verified login session অথবা verified account-এর API key লাগে; account quota ব্যবহার হয়, provider key না থাকলে endpoint `503` দেয়।

```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ACCOUNT_API_KEY" \
  -d '{"provider":"gemini","messages":[{"role":"user","content":"Explain REST APIs simply"}]}'
```

Teaching mode-এর route হলো `POST /api/agent/chat`; request-এ `"mode":"teach"` দিন। এটি configured provider-কে teaching style-এ উত্তর দিতে নির্দেশ দেয়, কিন্তু conversation সংরক্ষণ বা model-কে স্বয়ংক্রিয়ভাবে train করে না। Guest session-এ AI locked; verified login account-এ dashboard থেকে AI ব্যবহার করা যায়। AI requests account API quota ব্যবহার করে এবং provider billing-এর আওতায় আসতে পারে।

Guest text-effect endpoints:

```text
GET /api/text-effects/styles
GET /api/text-effects/render?text=Hello&effect=neon
```

Text-effect render সীমা: প্রতি IP-তে মিনিটে ৩০ request, মূল লেখা সর্বোচ্চ ২৮ অক্ষর এবং optional দ্বিতীয় লাইন ২০ অক্ষর। Styles-গুলো এই project-এর original SVG compositions; কোনো third-party website-এর proprietary artwork বা assets copy করা হয়নি।

## ✨ Features

### Script Features

- Login
- Sign Up
- No Temporary Email
- Anti-Spam Email
- Email Verification
- Change Password
- Database
- API Key Limit with Auto Reset
- Anti-Error

### API Features

- Downloader
- Text Pro
- Photooxy
- Sound Of Text
- Search
- Random Images
- Games
- Maker
- Link Shortener
- Information
- Tools
- Islamic

## 🌍 Deployment

- [api.rivqi.my.id](https://api.rivqi.my.id)
- [alpis.eu.org](https://alpis.eu.org)

## 👏 Support Deploy Free

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![Run on Repl.it](https://repl.it/badge/github/MrT0mX/Better-Api)](https://replit.com)

## 💳 Credits

- [AlipBot](https://github.com/AlipBot)
- [MrT0mX](https://github.com/MrT0mX)
