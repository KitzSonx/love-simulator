'use client';
import React, { useState } from 'react';
import './Retro8Bit.css';

import BootScreen from './components/BootScreen';
import CodeScreen from './components/CodeScreen';
import FlowerScreen from './components/FlowerScreen';
import MenuScreen from './components/MenuScreen';
import DaysScreen from './components/DaysScreen';
import LetterScreen from './components/LetterScreen';
import QuizScreen from './components/QuizScreen';
import MemoryScreen from './components/MemoryScreen';
import GachaScreen from './components/GachaScreen';
import { Sfx } from './components/SfxEngine';
import { burst } from './components/Effects';
export default function Retro8Bit({ orderData }) {
  console.log('Retro8Bit orderData', orderData);
  const [screen, setScreen] = useState('boot');
  const [quests, setQuests] = useState({ days: false, letter: false, quiz: false, memory: false });
  const [winModalShow, setWinModalShow] = useState(false);
  const [menuAnimateToken, setMenuAnimateToken] = useState(0);

  // default data matching structure
  const data = orderData?.custom_texts || {
    recipientName: "คนน่ารักที่สุดในโลก",
    senderName: "คนที่คลั่งรักเธอ",
    startDate: "2024-02-14T18:00:00",
    password: "คลั่งรัก101",
    flowerImage: "/assets/flower1.png",
    avatarImage: "/assets/boy1.png",
    signature: "— จากคนที่รักเธอที่สุด ♡",
    letter: "ถึงคนน่ารักของเรา...\n\nขอบคุณที่อยู่ด้วยกันมาจนถึงวันนี้นะ\nทุกวันที่มีเธอ มันสนุกกว่าเกมทุกเกมที่เคยเล่นเลย\nต่อจากนี้ก็ฝากด้วยนะ ผู้เล่น 2 ของเรา 🎮\n\nรักที่สุดเลย ♡",
    quiz: [
      { q: "เดทแรกของเรา ไปที่ไหนกันนะ?", c: ["ดูหนัง 🎬", "คาเฟ่ ☕", "สวนสาธารณะ 🌳", "ทะเล 🌊"], answer: 1 },
      { q: "เครื่องดื่มที่เราชอบสั่งบ่อยสุดคือ?", c: ["ชาเขียว 🍵", "โกโก้ 🍫", "อเมริกาโน่ ☕", "ชานมไข่มุก 🧋"], answer: 3 },
      { q: "สีที่เธอชอบที่สุดคือสีอะไร?", c: ["ชมพู 🌸", "ฟ้า 💙", "เขียว 💚", "ม่วง 💜"], answer: 0 },
      { q: "เพลงที่เราฟังด้วยกันบ่อยที่สุด?", c: ["เพลง A", "เพลง B", "เพลง C", "เพลง D"], answer: 0 },
      { q: "ทริปต่อไป อยากไปเที่ยวไหนด้วยกัน?", c: ["ญี่ปุ่น 🗾", "เกาหลี 🇰🇷", "เชียงใหม่ ⛰️", "ทะเลใต้ 🏝️"], answer: 0 },
    ],
    couplePhoto: { imageKey: "couple_photo.jpg", cap: "รูปคู่ของเรา 💑", note: "รูปคู่ที่ทำให้คิดถึงกันทุกวัน" },
    memories: [
      { imageKey: "first_date.jpg", cap: "เดทแรกของเรา 💘", note: "ยังจำได้เลยว่าเขินแค่ไหน" },
      { imageKey: "first_trip.jpg", cap: "ทริปแรกของเรา ✈️", note: "เหนื่อยแต่สนุกมากกก" },
      { imageKey: "our_memories.jpg", cap: "วันครบรอบปีที่แล้ว 🎂", note: "ปีนี้ก็ขอให้น่ารักแบบนี้ตลอดไปนะ" },
    ],
    prizes: [
      { icon: "✈️", name: "คูปองพาไปเที่ยว 1 ทริป", desc: "เลือกที่ได้เลย เดี๋ยวจัดให้!" },
      { icon: "💆", name: "คูปองนวดให้ 30 นาที", desc: "นวดไหล่ นวดหัว จัดเต็ม" },
    ]
  };

  const handleQuestComplete = (q) => {
    setQuests(prev => {
      const next = { ...prev, [q]: true };
      const doneCount = Object.values(next).filter(Boolean).length;
      if (doneCount === 4 && !prev[q]) { // just completed all 4
        setTimeout(() => {
          Sfx.win();
          burst(14, ["👑", "💖", "🎉", "✨"]);
          setWinModalShow(true);
        }, 600);
      }
      // mark menu to animate next time it's shown
      setMenuAnimateToken(t => t + 1);
      return next;
    });
  };

  return (
    <div className="retro-8bit">
      <div className="desk">
        <div className="holes"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        
        {screen === 'boot' && <BootScreen data={data} onStart={() => setScreen('code')} />}
        {screen === 'code' && <CodeScreen data={data} onComplete={() => setScreen('flower')} />}
        {screen === 'flower' && <FlowerScreen data={data} onContinue={() => setScreen('menu')} />}
        
        {screen === 'menu' && (
          <MenuScreen 
            data={data}
            quests={quests} 
            onOpenMenu={(s) => setScreen(s)} 
            onOpenGacha={() => setScreen('gacha')} 
            animateToken={menuAnimateToken}
            onAnimated={() => setMenuAnimateToken(0)}
          />
        )}

        {screen === 'days' && <DaysScreen data={data} startDate={data.startDate} onBack={() => setScreen('menu')} onComplete={() => handleQuestComplete('days')} />}
        {screen === 'letter' && <LetterScreen data={data} onBack={() => setScreen('menu')} onComplete={() => handleQuestComplete('letter')} />}
        {screen === 'quiz' && <QuizScreen data={data} onBack={() => setScreen('menu')} onComplete={() => handleQuestComplete('quiz')} />}
        {screen === 'memory' && <MemoryScreen data={data} onBack={() => setScreen('menu')} onComplete={() => handleQuestComplete('memory')} />}
        
        {screen === 'gacha' && <GachaScreen data={data} onBack={() => setScreen('menu')} />}

        {/* Win Modal */}
        {winModalShow && (
          <div className="modal show">
            <div className="paper-card" style={{ maxWidth: '320px', textAlign: 'center' }}>
              <div className="tape tl"></div>
              <div className="tape tr mint"></div>
              <p style={{ fontSize: '2.6rem' }}>👑💖</p>
              <h2 className="hand" style={{ fontSize: '1.25rem', margin: '8px 0' }}>ยินดีด้วย!</h2>
              <p className="hand" style={{ fontSize: '1rem', lineHeight: '1.6' }}>คุณคือผู้เล่นระดับ<br /><b style={{ color: 'var(--blush-deep)', fontSize: '1.2rem' }}>"คลั่งรักขั้นสุด"</b> แล้ว!</p>
              <p className="hand" style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginTop: '8px' }}>ตู้สุ่มรางวัลปลดล็อกแล้ว 🎉</p>
              <button className="btn" style={{ marginTop: '14px' }} onClick={() => {
                Sfx.click();
                setWinModalShow(false);
                setScreen('gacha');
              }}>รับรางวัลเลย! 🎰</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
