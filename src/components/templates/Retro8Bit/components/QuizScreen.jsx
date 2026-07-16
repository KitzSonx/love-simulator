import React, { useState } from 'react';
import { Sfx } from './SfxEngine';
import { burst } from './Effects';

export default function QuizScreen({ onBack, data, onComplete }) {
  const [quizIdx, setQuizIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);

  const quizData = data.quiz || [];
  const isFinished = quizIdx >= quizData.length;

  const handleAnswer = (idx) => {
    if (selectedAns !== null) return;
    
    setSelectedAns(idx);
    const q = quizData[quizIdx];
    const isCorrect = idx === q.answer;

    if (isCorrect) {
      setScore(s => s + 1);
      Sfx.beep(880, .12, "triangle", .15);
      burst(6, ["✅", "🎉", "💖"]);
    } else {
      Sfx.beep(220, .18, "sawtooth", .1);
    }

    setTimeout(() => {
      setSelectedAns(null);
      setQuizIdx(i => i + 1);
    }, 950);
  };

  const handleFinish = () => {
    Sfx.click();
    onComplete();
    onBack();
  };

  if (isFinished) {
    const total = quizData.length;
    let msg = score === total ? "โอ้โห รู้ใจกันสุดๆ ไปเลย! 💯" :
              score >= 3 ? "เก่งมากก รู้ใจกันเกินครึ่ง! 💗" :
              "ไม่เป็นไร~ เดี๋ยวเรามาทำความรู้จักกันใหม่อีกรอบนะ 😙";
    
    return (
      <section className="screen active" id="s-quiz">
        <div className="quest-top">
          <button className="back-btn" onClick={handleFinish}>◀ กลับ</button>
          <span className="quest-title">🎮 เรารู้ใจกันมากแค่ไหน</span>
        </div>
        <div className="paper-card q-card">
          <div className="tape tc mint"></div>
          <div className="quiz-result">
            <p className="big">{score === total ? "🏆" : score >= 3 ? "💖" : "🫶"}</p>
            <h3 className="hand" style={{ fontSize: '1.15rem', margin: '6px 0' }}>เธอตอบถูก {score} / {total} ข้อ!</h3>
            <p className="hand" style={{ fontSize: '.95rem', color: 'var(--ink-soft)' }}>{msg}</p>
            <button className="btn mint" style={{ marginTop: '14px' }} onClick={handleFinish}>กลับเมนู ✔</button>
          </div>
        </div>
      </section>
    );
  }

  const q = quizData[quizIdx];
  const abc = ["A", "B", "C", "D"];

  return (
    <section className="screen active" id="s-quiz">
      <div className="quest-top">
        <button className="back-btn" onClick={() => { Sfx.click(); onBack(); }}>◀ กลับ</button>
        <span className="quest-title">🎮 เรารู้ใจกันมากแค่ไหน</span>
      </div>
      <div className="paper-card q-card">
        <div className="tape tc mint"></div>
        <div className="q-num">QUEST {quizIdx + 1} / {quizData.length}</div>
        <div className="q-text">{q.q}</div>
        <div className="choices">
          {q.c.map((c, i) => {
            let className = "choice";
            if (selectedAns !== null) {
              if (i === q.answer) className += " good";
              else if (i === selectedAns) className += " bad";
            }
            return (
              <button 
                key={i} 
                className={className} 
                onClick={() => handleAnswer(i)}
                disabled={selectedAns !== null}
              >
                <span className="abc">{abc[i]}</span>{c}
              </button>
            );
          })}
        </div>
      </div>
      <div className="q-progress">
        {quizData.map((_, i) => (
          <i key={i} className={i < quizIdx ? "on" : ""}></i>
        ))}
      </div>
    </section>
  );
}
