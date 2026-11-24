# snake-game-js

เกมส์งูกินหาง (Classic Snake Game) พัฒนาด้วย Vanilla JavaScript HTML5 Canvas

## คุณสมบัติ (Features)
- พัฒนาด้วย **Vanilla JavaScript (ES6+)** และ **HTML5 Canvas** โดยไม่ต้องติดตั้ง Library เพิ่มเติม
- ระบบ **Input Queue** ป้องกันการกดกลับทิศชนตัวเองเมื่อกดปุ่มเปลี่ยนทิศเร็วๆ
- รองรับ **2 โหมดกำแพง**: ชนกำแพง (Classic) และ ทะลุกำแพง (Wrap-around)
- ปรับความเร็วได้ 3 ระดับ (ปกติ / เร็ว / เทอร์โบ)
- บันทึกคะแนนสูงสุดอัตโนมัติใน `localStorage`
- เสียงเอฟเฟกต์แบบ Retro Web Audio API (เปิด/ปิดได้)
- รองรับการควบคุมด้วยคีย์บอร์ด (`WASD` / `Arrow Keys` / `Space`), Touch Swipe และปุ่ม D-Pad บนมือถือ
- พร้อมไฟล์ GitHub Actions สำหรับ Deploy ขึ้น **GitHub Pages** อัตโนมัติ
- ทดลองสร้างโดย นาย ศิลา โดยพัฒนาต่อยอดจาก Google AI Studio โดยจะเขียนโค้ดต่อยอด หรือ ใช้ Prompt เอง

## วิธีรันเกมบนเครื่อง (Local Setup)
1. Clone repository นี้:
   ```bash
   git clone https://github.com/<your-username>/snake-game-js.git
   cd snake-game-js
   ```
2. เปิดไฟล์ `index.html` บนเบราว์เซอร์ได้ทันที หรือใช้ Live Server:
   ```bash
   npx serve .
   ```

## การควบคุม (Controls)
| ปุ่ม | คำสั่ง |
| --- | --- |
| `↑` `↓` `←` `→` หรือ `W` `A` `S` `D` | บังคับทิศทางงู |
| `Space` | เริ่มเกม / พักเกม |
| Swipe / D-Pad | บังคับบนหน้าจอมือถือ |
