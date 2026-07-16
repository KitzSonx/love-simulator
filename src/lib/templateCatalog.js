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
    name: 'Retro 8-Bit Arcade',
    tagline: 'ตลับเกมแห่งความรัก',
    description:
      'เกมอาร์เคดสไตล์ 8-Bit สุดคลาสสิก ให้แฟนเล่นผ่านด่านควิซ ดูอัลบั้มรูป อ่านจดหมายรัก และสุ่มกาชาปองคูปองรัก!',
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
    previewImage: '/assets/templates/retro-8bit-preview.png',
    tier: 'premium',
  },
  {
    id: 'minimal-romantic',
    name: 'Minimal Romantic',
    tagline: 'ความรักในแบบมินิมอล',
    description:
      'เว็บเซอร์ไพรส์โทนขาว-ชมพูสุดโรแมนติก มีเอฟเฟกต์กลีบดอกไม้ร่วง จดหมายรัก และ Countdown ถึงวันครบรอบ',
    price: 49,
    badge: '✨ ยอดนิยม',
    badgeColor: 'violet',
    available: false,
    features: [
      'เอฟเฟกต์กลีบดอกไม้ร่วง',
      'จดหมายรักแบบ Handwriting',
      'Countdown วันครบรอบ',
      'รูปคู่แบบ Gallery',
    ],
    previewImage: '/assets/templates/minimal-romantic-preview.png',
    tier: 'standard',
  },
  {
    id: 'recipe-of-love',
    name: 'Recipe of Our Love',
    tagline: 'สูตรรักฉบับเราสองคน',
    description:
      'เกมทำอาหารแบบโต้ตอบได้ ให้แฟนค่อยๆ หั่นและคนส่วนผสมแห่งความรักจนออกมาเป็นเซอร์ไพรส์สุดพิเศษ',
    price: 49,
    badge: '🍳 มาใหม่',
    badgeColor: 'amber',
    available: true,
    features: [
      'มินิเกมทำอาหารโต้ตอบได้',
      'ระบบเสียงประกอบน่ารักๆ',
      'ซ่อนข้อความเซอร์ไพรส์',
      'การ์ดสูตรอาหารบันทึกภาพได้',
    ],
    previewImage: '/assets/templates/recipe-preview.png',
    tier: 'standard',
  },
  {
    id: 'love-letter-free',
    name: 'Love Letter',
    tagline: 'จดหมายรักง่ายๆ แต่ซึ้ง',
    description:
      'จดหมายรักดิจิทัลฟรี! เขียนข้อความ แนบรูปคู่ ส่งลิงก์ให้แฟนอ่านแบบง่ายๆ ไม่ซับซ้อน',
    price: 0,
    badge: '🎁 ฟรี!',
    badgeColor: 'emerald',
    available: false,
    features: [
      'จดหมายรักดิจิทัล',
      'แนบรูปคู่ 1 รูป',
      'เอฟเฟกต์หัวใจ',
    ],
    previewImage: '/assets/templates/love-letter-preview.png',
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
  return `${price} บาท`;
}
