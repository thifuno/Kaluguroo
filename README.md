# Kaluguroo — AI Calorie & Health Tracker

แอปมือถือสำหรับนับแคลอรี่ สแกนอาหารด้วย AI และติดตามสุขภาพ
สร้างด้วย **React Native + Expo + TypeScript + Expo Router**
ดีไซน์โทนส้มอบอุ่น ภาษาไทยเป็นค่าเริ่มต้น และสลับเป็นอังกฤษได้

> **สถานะโปรเจกต์:** Phase 1 (UI, navigation, onboarding) เสร็จสมบูรณ์และรันได้จริง
> ระบบที่ยังไม่เชื่อมต่อ (Supabase, AI, Google Sign-In) จะแสดงสถานะตามจริง ไม่จำลองผลลัพธ์

**เดโมเว็บ:** https://thifuno.github.io/Kaluguroo/
**โค้ด:** https://github.com/thifuno/Kaluguroo

---

## 1. ฟีเจอร์ที่ใช้งานได้ในเวอร์ชันนี้

| ฟีเจอร์ | สถานะ |
| --- | --- |
| Splash screen พร้อมโลโก้และแอนิเมชัน | ✅ |
| Welcome / สมัครสมาชิก / เข้าสู่ระบบ / ลืมรหัสผ่าน | ✅ (mock auth ภายในเครื่อง) |
| Health onboarding 4 ขั้น + คำนวณ BMI, BMR, TDEE, แคลอรี่เป้าหมาย | ✅ |
| Bottom tab 5 ช่อง พร้อมปุ่มสแกนตรงกลาง | ✅ |
| Dashboard: เป้าหมาย, ที่ได้รับ, คงเหลือ, macro, มื้ออาหาร, กิจกรรม | ✅ |
| Food database ค้นหา/หมวดหมู่/รายการโปรด/เพิ่มอาหารเอง | ✅ (ฐานข้อมูลตัวอย่างในเครื่อง) |
| เพิ่มอาหารลงไดอารี่พร้อมเลือกมื้อและจำนวนหน่วย | ✅ |
| ไดอารี่วันนี้: แก้ไขจำนวน/มื้อ และลบรายการอาหาร | ✅ |
| Health tracking: บันทึกน้ำหนัก, กราฟ, ประวัติ, แคลอรี่ 7 วัน, กิจกรรม | ✅ |
| Profile: แก้ไขข้อมูล, เป้าหมาย, ภาษา, การแจ้งเตือน, ความเป็นส่วนตัว | ✅ |
| ปรับขนาดตัวอักษร 3 ระดับ + ปุ่มช่วยเหลือ/ทัวร์ใช้งานครั้งแรก | ✅ |
| Responsive: มือถือ / แท็บเล็ต / เดสก์ท็อป (390–1280px) | ✅ |
| เว็บแอป (PWA): ใช้ได้บนเบราว์เซอร์ + ติดตั้งเป็นแอป + build เป็น static | ✅ |
| AI food scanner (กล้อง + แกลเลอรี) | ⚠️ UI พร้อม แต่ต้องตั้งค่า endpoint |
| Supabase Auth + Cloud sync | ⏳ Phase 2 (มี schema + client พร้อม) |
| Google Sign-In | ⏳ แสดงข้อความ "ยังไม่เชื่อมต่อ" อย่างชัดเจน |
| บันทึกกิจกรรม/น้ำหนักย้อนหลังแบบเต็มรูปแบบ | ⏳ Phase 4 |
| Android APK | ⏳ Phase 5 (คำสั่ง EAS ด้านล่าง) |

---

## 2. วิธีรันบนเครื่อง

### สิ่งที่ต้องมี

- Node.js 20+ (แนะนำ 22)
- แอป **Expo Go** บนมือถือ หรือ Android Emulator / iOS Simulator
- (ไม่บังคับ) บัญชี Supabase และ backend สำหรับ AI

### ขั้นตอน

```bash
cd Kaluguroo
npm install
```

สร้างไฟล์ env (ไม่บังคับ — ถ้าไม่ใส่ แอปจะใช้ข้อมูลในเครื่องและปิด AI):

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

รัน dev server:

```bash
npx expo start
```

แล้วเลือก

- สแกน QR ด้วย **Expo Go** (Android/iOS)
- กด `a` เปิด Android emulator
- กด `i` เปิด iOS Simulator (ต้องใช้ macOS)
- กด `w` เปิดเว็บ

> Windows PowerShell อาจบล็อก `npx.ps1` ให้ใช้ `npx.cmd expo start`
> หรือรัน `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### เว็บแอป (PWA)

แอปนี้รันบนเบราว์เซอร์ได้ด้วย `react-native-web` และ build เป็นไฟล์ static สำหรับ deploy จริงได้

```bash
npm run web          # dev server บนเบราว์เซอร์
npm run build:web    # สร้างเว็บ static ที่โฟลเดอร์ dist/
npx serve dist       # ทดสอบไฟล์ที่ build แล้ว
```

- `app.json` ตั้ง `expo.web.output: "static"` → ทุก route ถูก render เป็น HTML ล่วงหน้า
  จึง host ได้กับ Netlify / Vercel / GitHub Pages / Cloudflare Pages โดยไม่ต้องมี Node server
- ตั้งค่า hosting: **build command** `npm run build:web`, **publish directory** `dist`
- `public/manifest.json` + ไอคอน `logo192.png`, `logo512.png`, `apple-touch-icon.png`
  ทำให้ติดตั้งเป็นแอป (PWA) บน Chrome/Edge/Android ได้ และมีไอคอนสำหรับ iOS
- บนเดสก์ท็อป (≥1120px) แอปใช้พื้นที่เต็มหน้าต่างจริง: แถบนำทางด้านซ้าย (sidebar) + เนื้อหาหลายคอลัมน์
  ไม่มีกรอบมือถือกลางจอ ความกว้างเนื้อหาสูงสุด 1200px เพื่อให้อ่านสบาย — ปรับได้ที่ `layout.wideMaxWidth`
  ใน `src/constants/theme.ts`; ชีต/ฟอร์มยังจำกัดความกว้างไว้ที่ ~560–640px
- กล้องบนเว็บต้องใช้ **HTTPS** หรือ `localhost` ถ้าเบราว์เซอร์ไม่อนุญาต
  ให้ใช้ปุ่มเลือกจากแกลเลอรี หรือบันทึกมื้ออาหารเอง
- ข้อมูลถูกเก็บใน `localStorage` ของเบราว์เซอร์ (mock auth) ยังไม่ sync ข้ามเครื่อง/เบราว์เซอร์

### อัปโหลดโค้ดขึ้น GitHub

ไฟล์ที่แชร์ไว้ไม่มี `node_modules/`, `dist/` และ `.expo/` (สร้างใหม่ได้ทั้งหมด) แล้วอัปโหลดได้เลย:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

ถ้าใช้ **GitHub Pages แบบ project site** (`https://<username>.github.io/<repo>/`) ต้องตั้ง
`expo.experiments.baseUrl` เป็น `"/<repo>"` ใน `app.json` ก่อน build ไม่งั้นไฟล์ JS/CSS จะ 404
(ถ้าใช้ repo ชื่อ `<username>.github.io` หรือ custom domain ที่ root ไม่ต้องตั้ง)
หรือ deploy ผ่าน Netlify/Vercel ที่ publish โฟลเดอร์ `dist` ได้ทันที

### ลองใช้งานเร็ว ๆ

1. เปิดแอป → หน้า Welcome
2. กด **“ทดลองด้วยบัญชีตัวอย่าง”** → เข้า Dashboard พร้อมข้อมูลตัวอย่าง (มีป้าย “ข้อมูลตัวอย่าง”)
3. หรือกด **เริ่มต้นใช้งาน** → สมัครด้วยอีเมล → ทำ onboarding 4 ขั้นด้วยตัวเอง

บัญชี mock ถูกเก็บในเครื่องนี้เท่านั้น (AsyncStorage) และ **ไม่ปลอดภัยพอสำหรับ production**
ใช้เพื่อทดสอบ UI จนกว่าจะเชื่อม Supabase Auth ใน Phase 2

> ข้อมูลสุขภาพในเครื่องผูกกับบัญชีที่ล็อกอินล่าสุด (`ownerUserId`) การสมัครบัญชีใหม่จะเริ่มจากศูนย์
> และเมื่อล็อกอินด้วยบัญชีอื่น ข้อมูลของบัญชีเดิมจะถูกแทนที่ — ข้อจำกัดของ mock auth ที่จะหายไปเมื่อใช้ Supabase

### ตรวจคุณภาพโค้ด

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

---

## 3. โครงสร้างโปรเจกต์

```text
Kaluguroo/
├─ src/
│  ├─ app/                        # Expo Router: ทุกไฟล์ในนี้คือ route
│  │  ├─ _layout.tsx              # providers + protected routes
│  │  ├─ index.tsx                # splash → redirect ตามสถานะ
│  │  ├─ (auth)/                  # welcome, login, signup, forgot-password
│  │  ├─ (tabs)/                  # home, food, health, profile
│  │  ├─ onboarding.tsx           # 4-step health onboarding
│  │  ├─ scan.tsx                 # modal กล้อง + AI result
│  │  ├─ diary.tsx                # modal ไดอารี่วันนี้ (แก้ไข/ลบรายการ)
│  │  └─ edit-profile.tsx         # modal แก้ไขโปรไฟล์/เป้าหมาย
│  ├─ components/
│  │  ├─ ui/                      # design system ที่ใช้ซ้ำ
│  │  ├─ app-tab-bar.tsx          # bottom tab + ปุ่มสแกนกลาง
│  │  ├─ calorie-bars.tsx
│  │  ├─ splash-view.tsx
│  │  └─ weight-chart.tsx
│  ├─ features/                   # logic เฉพาะโดเมน
│  │  ├─ auth/
│  │  └─ food/
│  ├─ lib/                        # nutrition, date, i18n, storage, demo data
│  ├─ services/
│  │  ├─ ai/                      # เรียก backend AI (ไม่แต่งผลลัพธ์)
│  │  ├─ auth/                    # mock auth สำหรับ Phase 1
│  │  └─ supabase/                # client ที่เปิดเฉพาะเมื่อมี env
│  ├─ store/app-provider.tsx      # state กลาง + persistence
│  ├─ constants/                  # design tokens + ฐานข้อมูลอาหารตัวอย่าง
│  └─ types/models.ts
├─ supabase/
│  ├─ migrations/                 # schema + RLS + seed
│  ├─ functions/analyze-food/     # ตัวอย่าง secure AI endpoint
│  └─ README.md
├─ assets/
├─ app.json
└─ .env.example
```

### หลักการออกแบบ

- **Route = ไฟล์** ตาม Expo Router, ใช้ `Stack.Protected` กันการเข้าถึงตามสถานะ session/onboarding
- **UI แยกจาก logic**: `components/ui` ไม่รู้จักข้อมูลผู้ใช้, หน้าจอเรียกผ่าน `useApp()`
- **Service boundary ชัดเจน**: mock (`services/auth/mock-auth.ts`) และของจริง (`services/ai`, `services/supabase`) แยกไฟล์กัน
- **ไม่โกหกผู้ใช้**: ถ้า AI ไม่ได้ตั้งค่า จะไม่มีผลลัพธ์ปลอม และมีข้อความอธิบายชัดเจน

---

## 4. Design system

| Token | ค่า |
| --- | --- |
| Primary (ตกแต่ง) | `#FF7043` |
| Primary action (พื้นปุ่ม/ลิงก์) | `#C9490F` — ขาวบนพื้นนี้ 4.73:1 |
| Primary action pressed | `#A93C08` |
| Primary text-safe | `#C2410C` — บนขาว 5.18:1, บน primary soft 4.56:1 |
| Primary soft | `#FFEDE5` |
| Background | `#FAF7F3` (warm light gray) |
| Surface | `#FFFFFF` |
| Text | `#2B2622` |
| Muted text | `#7C736C` |
| Border | `#EDE4DC` |
| Radius | 8 / 12 / 18 / 26 / pill |
| Spacing | 4 / 8 / 12 / 16 / 20 / 28 / 36 |
| Font | system font (รองรับไทยอัตโนมัติ) + ขนาดตัวอักษร 3 ระดับ |
| Breakpoints | 720 (tablet) / 1120 (desktop) |
| Touch target ขั้นต่ำ | 44–48px (ปุ่มหลัก 52–60px) |

ดูค่าทั้งหมดได้ที่ `src/constants/theme.ts`
Component หลัก: `Button`, `Card`, `TextField`, `Chip`, `Segmented`, `ProgressRing`, `MacroBar`,
`ModalSheet`, `EmptyState`, `ErrorState`, `LoadingState`, `Toast`, `AppTabBar`, `ScreenHeader`, `HelpSheet`

### Responsive และการเข้าถึง (ใช้งานง่ายทุกวัย)

- **เดสก์ท็อปเต็มรูปแบบ** หน้าจอ ≥1120px เปลี่ยนแถบแท็บล่างเป็น **sidebar ด้านซ้าย** พร้อมปุ่มสแกนขนาดใหญ่
  และหน้าหลัก/ไดอารี่/สุขภาพ/โปรไฟล์ใช้เลย์เอาต์สองคอลัมน์ (ไม่ใช่กรอบมือถือกลางจอ)
  ความกว้างเนื้อหาสูงสุด 1200px, ฟอร์ม/ชีตจำกัด 560–640px เพื่อไม่ให้บรรทัดยาวเกินไป
- **ขนาดตัวอักษร 3 ระดับ** (ปกติ / ใหญ่ / ใหญ่พิเศษ = 1 / 1.15 / 1.3) ตั้งได้ที่โปรไฟล์
  เก็บใน `preferences.textSize` ผ่าน `TextScaleProvider` และมีผลทุกหน้าจอ
- **เป้าหมายการแตะ** ขั้นต่ำ 44px (ปุ่มหลัก 52–60px, ช่องกรอก 56px, แถวรายการ 60–68px, แถบแท็บ 76px)
  อ้างอิง WCAG 2.2 SC 2.5.8 (ขั้นต่ำ 24px) แต่เลือกขนาดที่สบายกว่าสำหรับเด็กและผู้สูงอายุ
- **คอนทราสต์** ข้อความปกติ ≥4.5:1 และไอคอน/เส้นขอบ ≥3:1 (WCAG 1.4.3 / 1.4.11)
  จึงแยกส้มแบรนด์เป็น 2 เฉด: `primary` สำหรับตกแต่ง และ `primaryAction` สำหรับพื้นปุ่มที่มีตัวอักษรขาว
- **ไม่ใช้สีอย่างเดียว** สถานะที่เลือกใช้เครื่องหมายถูก + ตัวหนา + พื้นหลัง และปุ่มสลับมี `aria-checked`
  พร้อมให้โปรแกรมอ่านหน้าจออ่านสถานะ (แท็บใช้ `role="tab"` + `aria-selected`)
- **ทุกไอคอนมีข้อความกำกับ** หรือ `accessibilityLabel` ที่แปลแล้วทั้งไทย/อังกฤษ
- **ปุ่ม “ช่วย” ทุกหน้า** เปิด `HelpSheet` อธิบายหน้าปัจจุบันด้วยภาษาง่าย ๆ
  และมีทัวร์ 3 ขั้นตอนตอนเปิดแอปครั้งแรก (ปิดแล้วจำใน `preferences.tourCompleted`)
- **รองรับ 200% resize / ซูมเบราว์เซอร์** เลย์เอาต์ใช้ flex + wrap ไม่มีตายตัวเป็นพิกเซล
  และมี focus ring ชัดเจนสำหรับการใช้งานด้วยคีย์บอร์ด (`src/global.css`)
- **เคารพ reduced motion** ปิดแอนิเมชันเมื่อระบบตั้งค่าไว้

### ตรวจ responsive บนเว็บ

หลัง `npm run build:web` (หรือ `npx expo export -p web`) ให้คัดลอกหน้า harness ไปไว้ใน `dist`:

```bash
# macOS / Linux
cp scripts/qa-frame.html dist/qa.html
# Windows PowerShell
Copy-Item scripts/qa-frame.html dist/qa.html
```

แล้วเปิด `http://localhost:4173/qa?w=390`, `?w=800`, `?w=1280` เพื่อดูแอปในกรอบความกว้างที่กำหนด
(ไฟล์ `dist/` ถูก ignore และจะหายทุกครั้งที่ export ใหม่ จึงต้องคัดลอกซ้ำ)

---

## 5. การคำนวณโภชนาการ

อยู่ใน `src/lib/nutrition.ts`

- **BMI** = น้ำหนัก (kg) / ส่วนสูง (m)²
- **BMR** ใช้สมการ Mifflin–St Jeor
- **TDEE** = BMR × activity multiplier (1.2 – 1.9)
- **เป้าหมายแคลอรี่**
  - ลดน้ำหนัก: TDEE − 500
  - รักษาน้ำหนัก: TDEE
  - เพิ่มน้ำหนัก: TDEE + 300
  - ปลอดภัยขั้นต่ำ 1,200 kcal/วัน
- **Macro** 30% โปรตีน / 40% คาร์บ / 30% ไขมัน

> ค่าทั้งหมดเป็นค่าประมาณเพื่อการดูแลตัวเองทั่วไป ไม่ใช่คำแนะนำทางการแพทย์

---

## 6. ข้อมูลและบริการ: อะไรจริง อะไร mock

| ส่วน | ตอนนี้ | เป้าหมาย |
| --- | --- | --- |
| บัญชีผู้ใช้ | mock auth + AsyncStorage | Supabase Auth (+ Google OAuth) |
| ฐานข้อมูลอาหาร | 30 รายการใน `constants/foods.ts` | ตาราง `food_items` + ค้นหาเต็มรูปแบบ |
| ไดอารี่/น้ำหนัก/กิจกรรม | state ในเครื่อง + persist | ตาราง `food_logs`, `weight_logs`, `activity_logs` |
| AI scan | เรียก `EXPO_PUBLIC_AI_API_URL` ถ้ามี | Edge Function + provider จริง |
| การแจ้งเตือน | เก็บ preference เท่านั้น | `expo-notifications` + push token |

### เปิดใช้งาน AI จริง

1. Deploy `supabase/functions/analyze-food` (ดู `supabase/README.md`)
2. ตั้งค่าใน `.env`

```bash
EXPO_PUBLIC_AI_API_URL=https://<project>.supabase.co/functions/v1/analyze-food
```

ถ้าไม่ตั้งค่า ปุ่มวิเคราะห์จะไม่ทำงาน และ UI จะแจ้งว่า **“AI service is not connected”**
พร้อมทางเลือก “บันทึกเอง” — ไม่มีการสร้างผลลัพธ์ขึ้นเอง

### เปิดใช้งาน Supabase

รัน migration ทั้งสองไฟล์ใน `supabase/migrations` แล้วใส่ URL/anon key ใน `.env`
client จะถูกสร้างให้อัตโนมัติ (`isSupabaseConfigured`) แต่การย้าย auth/CRUD จริงเป็นงาน Phase 2

---

## 7. ความปลอดภัย

- ไม่มี API key หรือ service-role key ในโค้ดแอป ใช้เฉพาะ `EXPO_PUBLIC_*` ที่ปลอดภัยต่อการเปิดเผย
- AI เรียกผ่าน backend ที่ตรวจ JWT และเก็บ provider key ฝั่งเซิร์ฟเวอร์
- ฐานข้อมูลเปิด RLS ทุกตารางที่มีข้อมูลผู้ใช้
- ตรวจสอบ input ทั้งฝั่งฟอร์ม (อีเมล, รหัสผ่าน, ช่วงน้ำหนัก/ส่วนสูง/อายุ/แคลอรี่)
- ข้อมูลสุขภาพถูกเก็บในเครื่องจนกว่าจะเชื่อมคลาวด์ และมีปุ่มลบบัญชี/ล้างข้อมูล
- Mock auth เป็นเพียงเครื่องมือพัฒนา **ห้ามใช้ใน production**

---

## 8. Roadmap

- [x] **Phase 1** — โครงสร้างโปรเจกต์, design system, navigation, splash, auth UI, onboarding, dashboard, food diary, health, profile
- [x] **Phase 1.5** — responsive 3 ขนาดจอ, ขนาดตัวอักษร 3 ระดับ, ปุ่มช่วยเหลือ/ทัวร์, ตรวจคอนทราสต์และ touch target ตาม WCAG 2.2
- [ ] **Phase 2** — Supabase Auth จริง (email + Google), ซิงก์ dashboard/ไดอารี่, RLS end-to-end
- [ ] **Phase 3** — AI endpoint จริง, ฐานข้อมูลอาหารจาก Supabase, ปรับผลลัพธ์ก่อนบันทึก
- [ ] **Phase 4** — analytics เชิงลึก, เป้าหมายรายสัปดาห์, แจ้งเตือน, ประวัติย้อนหลังเต็มรูปแบบ
- [ ] **Phase 5** — E2E test, real-device + screen-reader audit, build APK/IPA

### เตรียม Android APK (Phase 5)

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build -p android --profile preview
```

ต้องมีบัญชี Expo และอาจต้องตั้งค่า `eas.json` เพิ่มตามข้อกำหนดของทีม

---

## 9. ข้อจำกัดที่ทราบอยู่

- Google Sign-In ยังไม่ทำงาน (ต้องตั้งค่า OAuth provider ใน Supabase)
- การแจ้งเตือนเป็นการบันทึก preference ยังไม่มีการตั้งเวลา/ส่งจริง
- ไดอารี่ย้อนหลัง: แก้ไข/ลบได้เฉพาะรายการของวันนี้ ยังไม่มีตัวเลือกดูย้อนหลังตามวันที่ (schema รองรับแล้ว)
- ข้อมูลโภชนาการเป็นค่าประมาณจากตัวอย่าง ไม่ได้ตรวจสอบกับฐานข้อมูลทางการ
- เว็บรองรับการใช้งานพื้นฐาน แต่กล้องบนเว็บต้องใช้ HTTPS และสิทธิ์ของเบราว์เซอร์
- Responsive ตรวจด้วย harness ที่ 390 / 800 / 1280px แล้ว แต่ยังไม่ได้ทดสอบบนอุปกรณ์จริง
  และยังไม่ได้ทดสอบกับโปรแกรมอ่านหน้าจอจริง (VoiceOver / TalkBack / NVDA)
- บนเว็บ `Alert` ของ React Native ไม่ทำงาน จึงใช้ `window.confirm` สำหรับกล่องยืนยัน (ดู `src/lib/confirm.ts`)

---

## 10. เครดิต

Flow ของผลิตภัณฑ์อ้างอิงชุดเอกสาร `Kaluguroo_Flow` (user flow, AI scan, manual entry, health tracking, system flow)
ที่วางไว้ที่ `../Kaluguroo_Flow/`
