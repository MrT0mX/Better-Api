require("dotenv").config();

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  return value && String(value).trim() ? String(value).trim() : fallback;
};
const getEnvList = (key) => getEnv(key).split(",").map((value) => value.trim()).filter(Boolean);

//_______________________ ┏  Info  ┓ _______________________\\
//
//   Edited BY: MrTomXxX
//   
//   -----------Note ------------
//
//   Api Owner: Bot
//   Don't sell this API,
//   Don't Change this text,
//   Who wants to upload don't forget to credit :),
//   Who does not place credit will take action
//   
//_______________________ ┏ Modified By MrTomXxX ┓ _______________________\\


//_______________________ ┏  Main Setting  ┓ _______________________\\

creator = getEnv("CREATOR", "MrTom乂x乂"); // Name
port = Number(getEnv("PORT", "8080")); // port host
LimitApikey = Number(getEnv("LIMIT_APIKEY", "200")); // Limit Apikey default

//___________ ┏  Database Mongodb Setting  ┓ ___________\\

keymongodb = getEnv("mongodb", "mongodb://127.0.0.1:27017/better-api"); // example "mongodb+srv://user:password@name_database.mongodb.net/?retryWrites=true&w=majority"

//___________ ┏  SMTP Setting  ┓ ___________\\

//Note service SMTP Gmail cannot send in email if you want to apply an email in another service
usetempemail = getEnv("USE_TEMP_EMAIL", "true").toLowerCase() !== "false"; // If true, you can sing up using email temp if you use gmail service using false je
servicesmtp = getEnv("servicesmtp", "Zoho"); //There is a gmail there is Sendinblue following each Gmail 500 limit limit 300 free limit. List service smtp : https://nodemailer.com/smtp/well-known/
sendemail = getEnv("sendemail", ""); // Email SMTP
fromsendemail = getEnv("fromsendemail", ""); // From Email SMTP *if takde custom email hit with email with SMTP email
sendpwmail = getEnv("sendpwmail", ""); // Password Email SMTP
domain = getEnv("domain", "localhost:8080"); // Website domain without http or https

//_______________________ ┏  Apikey  ┓ _______________________\\

// NOTE!!!!
// If the apikey is done for yourself

// Configure comma-separated Cuttly API keys in CUTTLY_API_KEYS.
apicuttly = getEnvList("CUTTLY_API_KEYS");

// Configure comma-separated Bitly API keys in BITLY_API_KEYS.
apibitly = getEnvList("BITLY_API_KEYS");

//APIKEY RECAPTCHA From https://www.google.com/recaptcha/about/ or https://www.google.com/recaptcha/admin  \\
recaptcha_key_1 = getEnv("recaptcha_key_1", "");
recaptcha_key_2 = getEnv("recaptcha_key_2", "");

//_______________________ ┏  Loghandler  ┓ _______________________\\

loghandler = {
  error: {
    status: false,
    code: 503,
    message: "সার্ভারে সাময়িক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
    maintanied_by: `${creator}`,
  },
  noturl: {
    status: false,
    code: 403,
    message: "সঠিক URL দিন।",
    maintanied_by: `${creator}`,
  },
  notfound: {
    status: false,
    code: 404,
    message: "কোনো ফলাফল পাওয়া যায়নি।",
    maintanied_by: `${creator}`,
  },
  notid: {
    status: false,
    code: 404,
    message: "সঠিক আইডি অথবা অঞ্চল দিন।",
    maintanied_by: `${creator}`,
  },
  redy: {
    status: false,
    code: 403,
    message: "এই alias আগে থেকেই ব্যবহৃত হচ্ছে।",
    maintanied_by: `${creator}`,
  },
  emoji: {
    status: false,
    code: 403,
    message: "ইমোজি পাওয়া যায়নি।",
    maintanied_by: `${creator}`,
  },
  instgram: {
    status: false,
    code: 403,
    message: "ব্যবহারকারী পাওয়া যায়নি অথবা তার প্রোফাইল ব্যক্তিগত।",
    maintanied_by: `${creator}`,
  },
  register: {
    status: false,
    code: 403,
    message: "আগে একটি অ্যাকাউন্ট তৈরি করুন।",
  },
  verify: {
    status: false,
    code: 403,
    message: "API ব্যবহারের আগে ইমেইল যাচাই করুন। ইনবক্স বা স্প্যাম ফোল্ডার দেখুন।",
  },
};
