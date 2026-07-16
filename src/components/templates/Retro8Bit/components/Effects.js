export function burst(n = 8, chars = ["💖", "💗", "✨", "🌸"]) {
  if (typeof window === 'undefined') return;
  const desk = document.querySelector(".desk");
  if (!desk) return;
  
  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    el.className = "float-bit";
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.left = (15 + Math.random() * 70) + "%";
    el.style.bottom = (20 + Math.random() * 30) + "%";
    el.style.animationDelay = (Math.random() * 0.5) + "s";
    desk.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
}
