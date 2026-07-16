export const Sfx = {
  ctx: null,
  ensure() { 
    if (typeof window !== 'undefined' && !this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)(); 
    }
    return this.ctx;
  },
  beep(freq = 600, dur = .08, type = "square", vol = .12, when = 0) {
    try {
      const ctx = this.ensure();
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; 
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime + when);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + when + dur);
      o.connect(g); 
      g.connect(ctx.destination);
      o.start(ctx.currentTime + when); 
      o.stop(ctx.currentTime + when + dur + .02);
    } catch (e) { console.error(e) }
  },
  click() { this.beep(520, .05) },
  // key loop audio for Letter screen (single instance)
  _keyLoopAudio: null,
  _keyLoopFallback: null,
  ensureKeyLoopAudio() {
    if (typeof window === 'undefined') return null;
    if (!this._keyLoopAudio) {
      this._keyLoopAudio = new Audio('/assets/Writing on keyboard Sound Effect [Typing].mp3');
      this._keyLoopAudio.preload = 'auto';
      this._keyLoopAudio.loop = true;
      this._keyLoopAudio.volume = 0.45;
    }
    return this._keyLoopAudio;
  },
  startKeyLoop() {
    try {
      const audio = this.ensureKeyLoopAudio();
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // fallback to short repeated beeps when autoplay is blocked
          if (this._keyLoopFallback) return;
          this._keyLoopFallback = setInterval(() => this.beep(760, .04, 'square', .06), 120);
        });
        return;
      }
    } catch (e) { }
    if (this._keyLoopFallback) return;
    this._keyLoopFallback = setInterval(() => this.beep(760, .04, 'square', .06), 120);
  },
  stopKeyLoop() {
    try {
      if (this._keyLoopAudio) {
        this._keyLoopAudio.pause();
        this._keyLoopAudio.currentTime = 0;
      }
    } catch (e) { }
    if (this._keyLoopFallback) {
      clearInterval(this._keyLoopFallback);
      this._keyLoopFallback = null;
    }
  },
  type() { this.beep(760, .04, "square", .08) },
  fanfare() {
    const notes = [[660, .1, 0], [660, .1, .12], [880, .12, .24], [988, .14, .4], [1319, .28, .58]];
    notes.forEach(([f, d, w]) => this.beep(f, d, "square", .14, w));
  },
  win() {
    const notes = [[523, .12, 0], [659, .12, .13], [784, .12, .26], [1047, .3, .4]];
    notes.forEach(([f, d, w]) => this.beep(f, d, "triangle", .16, w));
  },
  gacha() {
    for (let i = 0; i < 6; i++) this.beep(300 + Math.random() * 500, .06, "square", .1, i * .09);
    this.beep(1047, .25, "triangle", .16, .6);
  },
};
