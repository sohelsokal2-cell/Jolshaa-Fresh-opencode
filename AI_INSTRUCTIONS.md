# AI_INSTRUCTIONS.md — Jolshaa Project

> এই ফাইলটা প্রজেক্টের রুট ফোল্ডারে রাখুন। প্রতিটা নতুন AI কোডিং সেশন শুরু করার সময়
> AI-কে বলুন: "প্রথমে AI_INSTRUCTIONS.md ফাইলটা পড়ো, তারপর কাজ শুরু করো।"

---

## প্রজেক্ট পরিচিতি

**নাম:** Jolshaa
**ধরন:** বাংলাদেশ-কেন্দ্রিক সোশ্যাল মিডিয়া ওয়েব অ্যাপ (Facebook-style)
**লক্ষ্য ইউজার:** বাংলাদেশি ইউজার, বাংলা + ইংরেজি মিশ্রিত UI

---

## চূড়ান্ত Tech Stack (এটাই একমাত্র সঠিক স্ট্যাক — অন্য কিছু সাজেস্ট করবে না)

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Frontend hosting | Vercel |
| Backend | Node.js + Express.js |
| Backend hosting | Render |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| File/Media Storage | Supabase Storage |
| Real-time (chat, notifications) | Supabase Realtime |
| 1-on-1 Audio/Video Call | Raw WebRTC + STUN + TURN (Metered.ca free tier) + Supabase Realtime for signaling |
| Group Video Call | LiveKit Cloud (free tier) |
| Styling | Tailwind CSS |

**⚠️ গুরুত্বপূর্ণ:** এই স্ট্যাক চূড়ান্ত। MongoDB, Firebase, Socket.io, Cloudinary, বা অন্য কোনো বিকল্প সাজেস্ট করবে না — এমনকি "ভালো হবে" মনে হলেও না। যদি কোনো কারণে স্ট্যাক পরিবর্তনের দরকার মনে হয়, প্রথমে আমাকে জিজ্ঞেস করবে, নিজে থেকে বদলাবে না।

---

## ডেটাবেস সংক্রান্ত নিয়ম

- Supabase = PostgreSQL, তাই **SQL/relational schema** ব্যবহার করবে (Mongoose/MongoDB স্টাইল না)
- Table তৈরি করার সময় Supabase-এর SQL editor-এ ব্যবহারযোগ্য migration script দেবে
- Foreign key relationships সঠিকভাবে define করবে (JOIN প্রয়োজন হলে সেটাই স্বাভাবিক, NoSQL-এর মতো নেস্টেড ডকুমেন্ট চিন্তা করবে না)
- Row Level Security (RLS) policies যোগ করার কথা মনে করিয়ে দেবে যেখানে প্রযোজ্য (Supabase-এর নিরাপত্তার একটা গুরুত্বপূর্ণ অংশ)
- Backend-এ Supabase-এর সাথে কানেক্ট করতে `@supabase/supabase-js` লাইব্রেরি ব্যবহার করবে

---

## কাজের নিয়ম (Workflow Rules) — এগুলো কঠোরভাবে মানতে হবে

### ১. এক প্রম্পটে একটা ছোট কাজ
আমি যা চাইব শুধু ঠিক ততটুকুই করবে। অতিরিক্ত ফিচার, "ভালো হবে মনে করে" এক্সট্রা কিছু যোগ করবে না। অপ্রাসঙ্গিক কোনো ফাইল স্পর্শ করবে না।

### ২. প্রতিটা কাজ শেষে জানাবে
- ঠিক কোন কোন ফাইল তৈরি/পরিবর্তিত হয়েছে
- নতুন কোনো npm package লাগলে সেটা install command সহ বলবে
- একটা ছোট টেস্টিং চেকলিস্ট দেবে যাতে আমি ম্যানুয়ালি যাচাই করতে পারি

### ৩. Git commit-এর কথা মনে করিয়ে দেবে
প্রতিটা কাজ সফলভাবে টেস্ট হওয়ার পর বলবে: "এখন এই কাজটা git commit করে নিন, তারপর পরের ধাপে যাই।"

### ৪. Local-first development
- এখন আমরা Render/Vercel-এ deploy করছি না, শুধু **local-এ** develop এবং টেস্ট করছি
- Backend `.env`-এ Supabase URL/keys ব্যবহার করবে (Supabase নিজেই cloud-hosted, তাই local backend থেকেও কানেক্ট করা যায় — এটা normal)
- Deploy-সংক্রান্ত কোনো কনফিগারেশন (render.yaml, vercel.json ইত্যাদি) যতক্ষণ না আমি বলছি ততক্ষণ যোগ করবে না

### ৫. Breaking changes নিয়ে সতর্কতা
কোনো পরিবর্তন যদি আগে থেকে কাজ করা কোনো ফিচার ভাঙতে পারে (existing table/column বদলানো, existing API route-এর behavior বদলানো), তাহলে কাজ শুরুর আগে আমাকে সেটা স্পষ্টভাবে জানাবে এবং আমার নিশ্চিতকরণ চাইবে।

### ৬. প্রশ্ন থাকলে জিজ্ঞেস করবে, অনুমান করবে না
কোনো নির্দেশনা অস্পষ্ট মনে হলে কাজ শুরুর আগে একটা স্পষ্ট প্রশ্ন করবে, নিজে থেকে ধরে নিয়ে এগোবে না।

---

## কোড স্টাইল নিয়ম

- সব comment এবং variable/function নাম **ইংরেজিতে**
- ইউজার-facing UI টেক্সট প্রসঙ্গ অনুযায়ী বাংলা বা ইংরেজি হবে (আমি প্রতিটা ফিচারে নির্দিষ্ট করে বলে দেব কোনটা)
- Async/await ব্যবহার করবে, পুরনো `.then()` callback চেইন না
- Error handling সবসময় try/catch দিয়ে, silent fail করবে না
- Environment variables `.env` ফাইলে রাখবে, কখনো hardcode করবে না — এবং প্রতিটা নতুন env variable যোগ হলে `.env.example`-এও আপডেট করে দেখাবে

---

## ⚠️ UI নিয়ে গুরুত্বপূর্ণ আপডেট — Tailwind না, Custom CSS

প্রতিটা page-এর জন্য ইতিমধ্যে সম্পূর্ণ, পালিশড, standalone HTML/CSS/JS ফাইল বানানো আছে 
(Claude Sonnet 4.6 দিয়ে বানানো, Stitch ডিজাইনের ভিত্তিতে)। এই HTML ফাইলগুলো:
- **Plain custom CSS** ব্যবহার করে (CSS variables/custom properties দিয়ে — `:root { --teal: #1B6B5A; }` স্টাইলে), **Tailwind CSS না**
- প্রতিটা page নিজস্ব `<style>` ব্লকে সম্পূর্ণ CSS ধারণ করে
- Vanilla JS দিয়ে interactivity আছে (demo/static purpose-এ), যেটা React-এ convert করার সময় state/hooks-এ বদলাতে হবে
- Navigation বর্তমানে `window.location='page.html'` — React Router-এ `navigate('/page')`-এ বদলাতে হবে

**নিয়ম — React-এ কনভার্ট করার সময়:**
1. **CSS নতুন করে Tailwind-এ লিখবে না** — বিদ্যমান `<style>` ব্লকের CSS হুবহু একটা আলাদা `.css` ফাইলে (page-অনুযায়ী, যেমন `Messenger.css`) কপি করে সেই component-এ import করবে
2. HTML structure JSX-এ রূপান্তর করবে (class→className, self-closing tags ঠিক করা, inline event handler React-style-এ বদলানো) — কিন্তু ভিজুয়াল ডিজাইন হুবহু অক্ষত রাখবে, নতুন করে ডিজাইন করবে না
3. CSS variable-ভিত্তিক color system (--teal, --coral ইত্যাদি) অক্ষত রাখবে — এটাই এখন প্রজেক্টের প্রকৃত design system, আগে থেকে যে Tailwind theme.js বানানো হয়েছিল সেটা এখন আর ব্যবহার হবে না
4. Static/demo ডেটা (hardcoded conversation list, post list ইত্যাদি) চিহ্নিত করে বলবে কোনগুলো backend/Supabase থেকে dynamic ডেটা দিয়ে replace করতে হবে
5. Vanilla JS interactivity (toggleAttach, setTab ইত্যাদি ফাংশন) React useState/useEffect দিয়ে পুনর্লিখবে, একই আচরণ বজায় রেখে

**যখন কোনো HTML ফাইল দেওয়া হবে convert করার জন্য, প্রথমে পুরো ফাইলটা মনোযোগ দিয়ে পড়বে — CSS variables, animation, structure বুঝে নিয়ে তারপর কাজ শুরু করবে, আন্দাজে কিছু বাদ দেবে না।**

---

## Real-time ফিচার নিয়ম

- Chat, notification, online status — সব **Supabase Realtime channels** দিয়ে হবে, Socket.io দিয়ে না
- 1-on-1 call signaling-ও Supabase Realtime broadcast দিয়ে হবে
- Group call সম্পূর্ণভাবে LiveKit SDK দিয়ে হবে, LiveKit-এর জন্য আলাদা signaling কোড লেখার দরকার নেই

---

## ফাইল/ফোল্ডার স্ট্রাকচার (প্রত্যাশিত)

```
/jolshaa
  /backend
    /controllers
    /routes
    /middleware
    /config       ← supabase client setup এখানে থাকবে
    server.js
    .env
    .env.example
  /frontend
    /src
      /pages
      /components
      /hooks
      /styles     ← theme/design system এখানে থাকবে
    .env
    .env.example
  AI_INSTRUCTIONS.md   ← এই ফাইল
```

---

## যখন নিশ্চিত না হও

যদি কোনো টেকনিক্যাল সিদ্ধান্তে নিশ্চিত না হও (যেমন কোনো লাইব্রেরি বেছে নেওয়া, কোনো approach), তাহলে:
1. ২-৩টা সম্ভাব্য অপশন সংক্ষেপে বলবে, প্রতিটার ভালো/খারাপ দিক সহ
2. আমাকে বেছে নিতে দেবে
3. নিজে থেকে "best practice" ধরে নিয়ে না জিজ্ঞেস করে এগোবে না

---

*এই ফাইল প্রজেক্টের development চলাকালীন আপডেট হতে পারে। নতুন কোনো বড় সিদ্ধান্ত হলে এই ফাইলেই যোগ করা হবে যাতে ধারাবাহিকতা বজায় থাকে।*