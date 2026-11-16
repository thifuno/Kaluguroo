# Supabase setup

โฟลเดอร์นี้เก็บ schema และฟังก์ชันฝั่งเซิร์ฟเวอร์ของ Kaluguroo

## 1. สร้างโปรเจกต์

1. สร้างโปรเจกต์ที่ https://supabase.com
2. ไปที่ **SQL Editor** แล้วรันไฟล์ตามลำดับ
   - `migrations/0001_init.sql` — ตาราง, index, trigger, RLS
   - `migrations/0002_seed_foods.sql` — อาหารตัวอย่างส่วนกลาง (ไม่บังคับ)
3. คัดลอก **Project URL** และ **anon public key** ไปใส่ `.env`

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> ใช้เฉพาะ anon key ในแอป ห้ามใช้ service_role key ในฝั่ง client

## 2. ตารางที่สร้าง

| ตาราง | หน้าที่ |
| --- | --- |
| `profiles` | ข้อมูลผู้ใช้ (ชื่อ, ภาษา) เชื่อมกับ `auth.users` |
| `health_goals` | ประวัติเป้าหมายสุขภาพ + ค่าที่คำนวณได้ (BMI, BMR, TDEE) |
| `food_items` | ฐานข้อมูลอาหาร (global หรือของผู้ใช้) |
| `meals` | มื้ออาหารต่อวัน ( breakfast / lunch / dinner / snack ) |
| `food_logs` | รายการอาหารที่บันทึก พร้อม snapshot ของโภชนาการ |
| `weight_logs` | น้ำหนักรายวัน (1 แถวต่อวัน) |
| `activity_logs` | กิจกรรมและแคลอรี่ที่เผาผลาญ |

ทุกตารางที่ผูกกับผู้ใช้เปิด **Row Level Security** และอนุญาตเฉพาะ `auth.uid() = user_id`
(ยกเว้น `profiles` ที่ใช้ `id` และ `food_items` ที่อ่านรายการ global ได้)

## 3. AI endpoint ที่ปลอดภัย

`functions/analyze-food/index.ts` เป็นตัวอย่าง Edge Function ที่
- ตรวจ JWT ของผู้ใช้ก่อนทำงาน
- เก็บ provider key ไว้ใน Supabase secrets (ไม่ลงในแอป)
- รับ multipart field ชื่อ `image` และคืน JSON โภชนาการ

```bash
supabase functions deploy analyze-food
supabase secrets set OPENAI_API_KEY=sk-... AI_MODEL=gpt-4o-mini
```

จากนั้นตั้ง `EXPO_PUBLIC_AI_API_URL` เป็น URL ของฟังก์ชัน
ถ้าไม่ตั้งค่า แอปจะแสดงสถานะ "AI ยังไม่เชื่อมต่อ" และไม่แต่งผลลัพธ์ขึ้นเอง

## 4. สถานะปัจจุบัน

- Phase 1 ใช้ local storage (`AsyncStorage`) และ mock auth เพื่อให้ทดลอง flow ได้ทันที
- Client สร้าง Supabase instance เฉพาะเมื่อมี env ครบ (`src/services/supabase/client.ts`)
- การย้าย auth/CRUD จริงไป Supabase เป็นงานของ Phase 2 ตาม roadmap ใน README หลัก
