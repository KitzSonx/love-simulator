import React, { useState } from 'react';
import { Sfx } from './SfxEngine';
import { burst } from './Effects';

export default function CodeScreen({ data, onComplete }) {
  const [codeIdx, setCodeIdx] = useState(0);
  const password = data?.password || 'คลั่งรัก101';
  const CODE_CHUNKS = Array.from(password);

  const handlePress = () => {
    if (codeIdx >= CODE_CHUNKS.length) {
      Sfx.type();
      return;
    }
    Sfx.type();
    setCodeIdx(prev => prev + 1);

    if (codeIdx + 1 >= CODE_CHUNKS.length) {
      Sfx.beep(880, .15, "triangle", .15);
    }
  };

  const handleConfirm = () => {
    Sfx.fanfare();
    burst(10);
    setTimeout(() => onComplete(), 900);
  };

  const codeString = CODE_CHUNKS.slice(0, codeIdx).join("");
  const isComplete = codeIdx >= CODE_CHUNKS.length;

  return (
    <section className="screen active" id="s-code">
      <div className="stain" style={{ bottom: '6%', left: '-34px' }}></div>
      <p className="eyebrow">▶ STAGE 1 : PASSWORD</p>
      <h1 className="hand">🔐 กรุณาพิมพ์รหัสลับ</h1>

      <div className="console">
        <div className="tape tl mint"></div>
        <div className="lcd">
          <span className="prompt">ENTER SECRET CODE...</span>
          <div className="code-out">
            {codeString}
            <span className="caret"></span>
          </div>
        </div>
        <div className="pad-row">
          <div className="dpad">
            <button className="dbtn up" onClick={handlePress}>{"▲\uFE0E"}</button>
            <button className="dbtn left" onClick={handlePress}>{"◀\uFE0E"}</button>
            <div className="mid"></div>
            <button className="dbtn right" onClick={handlePress}>{"▶\uFE0E"}</button>
            <button className="dbtn down" onClick={handlePress}>{"▼\uFE0E"}</button>
          </div>
          <div className="ab">
            <button className="abtn a" onClick={handlePress}>A</button>
            <button className="abtn b" onClick={handlePress}>B</button>
          </div>
        </div>
      </div>

      <p className="hint-note">
        {isComplete ? `รหัสคือ "${password}" นี่เอง! กดยืนยันเลย 💗` : `รหัสของคุณคือ '${password}' กดปุ่มจนขึ้นครบแล้วยืนยันได้เลย`}
      </p>
      <button className="btn mint" disabled={!isComplete} onClick={handleConfirm}>ยืนยันรหัส ✔</button>
    </section>
  );
}
