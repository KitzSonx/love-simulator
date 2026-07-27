/**
 * Template Catalog — ข้อมูลเทมเพลตทั้งหมดสำหรับแสดงบน Landing Page
 *
 * price tiers:
 *   0  = ฟรี
 *   49 = 49 บาท
 *   99 = 99 บาท
 */

export const TEMPLATE_CATALOG = [
  {
    id: 'retro-8bit',
    name: 'Retro Arcade',
    fullName: 'Retro 8-Bit Arcade',
    tagline: 'ตลับเกมแห่งความรัก',
    description:
      'สไตล์เกม 8-bit ย้อนยุคสุดน่ารัก พร้อมมินิเกมเก็บหัวใจแทนความรู้สึก',
    price: 99,
    badge: '🔥 ขายดี',
    badgeColor: 'rose',
    available: true,
    features: [
      'ระบบรหัสลับเปิดเกม',
      'ด่านควิซ 5+ ข้อ',
      'จดหมายรักแบบ Pixel Art',
      'อัลบั้มรูปความทรงจำ',
      'กาชาปองคูปองรัก',
      'นับวันรักอัตโนมัติ',
    ],
    previewImage: '/assets/firsttemplate.png',
    tier: 'premium',
  },
  {
    id: 'recipe-of-love',
    name: 'Interactive Recipe',
    fullName: 'Recipe of Our Love',
    tagline: 'สูตรรักฉบับเราสองคน',
    description:
      'สูตรลับความรักที่ต้องปลดล็อกด้วยความทรงจำแสนหวานของคุณทั้งคู่',
    price: 49,
    badge: '🔒 เร็วๆ นี้',
    badgeColor: 'amber',
    available: false,
    features: [
      'มินิเกมทำอาหารโต้ตอบได้',
      'ระบบเสียงประกอบน่ารักๆ',
      'ซ่อนข้อความเซอร์ไพรส์',
      'การ์ดสูตรอาหารบันทึกภาพได้',
    ],
    previewImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    tier: 'standard',
  },
  {
    id: 'minimal-romantic',
    name: 'Minimal Romantic',
    fullName: 'Minimal Romantic',
    tagline: 'ความรักในแบบมินิมอล',
    description:
      'เรียบหรู ดูแพง เน้นรูปคู่และข้อความซึ้งๆ ให้ความทรงจำได้ทำหน้าที่ของมัน',
    price: 0,
    badge: '🔒 เร็วๆ นี้',
    badgeColor: 'violet',
    available: false,
    features: [
      'เอฟเฟกต์กลีบดอกไม้ร่วง',
      'จดหมายรักแบบ Handwriting',
      'Countdown วันครบรอบ',
      'รูปคู่แบบ Gallery',
    ],
    previewImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    tier: 'standard',
  },
  {
    id: 'love-letter-free',
    name: 'Digital Love Letter',
    fullName: 'Love Letter',
    tagline: 'จดหมายรักง่ายๆ แต่ซึ้ง',
    description:
      'จดหมายรักออนไลน์ที่เปิดอ่านได้ตลอดไป เก็บความรู้สึกไว้ในโลกดิจิทัล',
    price: 0,
    badge: '🔒 เร็วๆ นี้',
    badgeColor: 'emerald',
    available: false,
    features: [
      'จดหมายรักดิจิทัล',
      'แนบรูปคู่ 1 รูป',
      'เอฟเฟกต์หัวใจ',
    ],
    previewImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    tier: 'free',
  },
];

/**
 * Helper: get a template by id
 */
export function getTemplateById(id) {
  return TEMPLATE_CATALOG.find((t) => t.id === id) || null;
}

/**
 * Helper: get price label
 */
export function getPriceLabel(price) {
  if (price === 0) return 'ฟรี';
  return `฿${price}`;
}
