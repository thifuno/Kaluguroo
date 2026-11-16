-- Optional starter food database (global items shared by all users).
-- These are approximations for a typical Thai serving.

insert into public.food_items
  (name, name_en, category, serving_label, serving_grams, calories, protein, carbs, fat, is_verified)
values
  ('ข้าวมันไก่', 'Hainanese chicken rice', 'rice', '1 จาน', 250, 590, 28, 65, 23, true),
  ('ข้าวผัดกุ้ง', 'Shrimp fried rice', 'rice', '1 จาน', 250, 520, 20, 62, 20, true),
  ('ข้าวกะเพราไก่ไข่ดาว', 'Basil chicken with fried egg', 'rice', '1 จาน', 300, 640, 32, 58, 32, true),
  ('ข้าวกล้อง', 'Brown rice', 'rice', '1 ทัพพี', 150, 165, 3.5, 34, 1.3, true),
  ('ก๋วยเตี๋ยวเรือ', 'Boat noodles', 'noodles', '1 ชาม', 300, 320, 18, 42, 9, true),
  ('ผัดไทยกุ้ง', 'Shrimp pad Thai', 'noodles', '1 จาน', 250, 480, 18, 62, 17, true),
  ('ต้มยำกุ้ง', 'Tom yum goong', 'soup', '1 ถ้วย', 250, 130, 12, 8, 5, true),
  ('ส้มตำไทย', 'Thai papaya salad', 'vegetable', '1 ถ้วย', 150, 120, 3, 22, 3, true),
  ('อกไก่ย่าง', 'Grilled chicken breast', 'meat', '100 กรัม', 100, 165, 31, 0, 3.6, true),
  ('ไข่ต้ม', 'Boiled egg', 'meat', '1 ฟอง', 50, 78, 6.3, 0.6, 5.3, true),
  ('แซลมอนย่าง', 'Grilled salmon', 'seafood', '100 กรัม', 100, 208, 20, 0, 13, true),
  ('บรอกโคลีต้ม', 'Boiled broccoli', 'vegetable', '100 กรัม', 100, 35, 2.4, 7, 0.4, true),
  ('กล้วยน้ำว้า', 'Banana', 'fruit', '1 ลูก', 100, 89, 1.1, 23, 0.3, true),
  ('แอปเปิ้ล', 'Apple', 'fruit', '1 ผล', 150, 78, 0.4, 21, 0.2, true),
  ('ชาไทยเย็น', 'Thai iced tea', 'drink', '1 แก้ว', 300, 240, 3, 38, 8, true),
  ('อัลมอนด์', 'Almonds', 'snack', '30 กรัม', 30, 170, 6, 6, 15, true)
on conflict (lower(name)) where user_id is null do nothing;
