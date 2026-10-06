export const LAPTOP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" font-family="'Courier New', monospace">
  <defs>
    <linearGradient id="lp-wallpaper" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="50%" stop-color="#16213e"/>
      <stop offset="100%" stop-color="#0f3460"/>
    </linearGradient>
    <linearGradient id="lp-screenBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="100%" stop-color="#1a2332"/>
    </linearGradient>
    <linearGradient id="lp-laptopBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3a3a3a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="lp-laptopBase" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c0c0c0"/>
      <stop offset="100%" stop-color="#707070"/>
    </linearGradient>
    <filter id="lp-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="lp-strongGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="lp-screenClip">
      <rect x="195" y="107" width="410" height="248"/>
    </clipPath>
    <symbol id="lp-cursor" viewBox="0 0 24 24">
      <path d="M 2 2 L 2 18 L 7 14 L 10 21 L 13 20 L 10 13 L 16 13 Z"
            fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </symbol>
  </defs>
  <rect width="800" height="600" fill="url(#lp-wallpaper)"/>
  <g opacity="0.5">
    <circle cx="80" cy="50" r="1" fill="white"/>
    <circle cx="180" cy="30" r="1.5" fill="white"/>
    <circle cx="320" cy="40" r="1" fill="white"/>
    <circle cx="450" cy="25" r="1.2" fill="white"/>
    <circle cx="600" cy="50" r="1" fill="white"/>
    <circle cx="720" cy="30" r="1.5" fill="white"/>
    <circle cx="50" cy="450" r="1" fill="white"/>
    <circle cx="750" cy="480" r="1.2" fill="white"/>
    <circle cx="100" cy="520" r="1" fill="white"/>
    <circle cx="680" cy="540" r="1.5" fill="white"/>
  </g>
  <rect x="0" y="430" width="800" height="170" fill="#000000" opacity="0.3"/>
  <rect x="180" y="70" width="440" height="300" rx="12" fill="url(#lp-laptopBody)" stroke="#0a0a0a" stroke-width="2"/>
  <rect x="195" y="85" width="410" height="270" rx="4" fill="url(#lp-screenBg)"/>
  <rect x="195" y="85" width="410" height="22" fill="#000000" opacity="0.5"/>
  <circle cx="208" cy="96" r="4" fill="#ff5f56"/>
  <circle cx="222" cy="96" r="4" fill="#ffbd2e"/>
  <circle cx="236" cy="96" r="4" fill="#27c93f"/>
  <text x="400" y="100" text-anchor="middle" fill="#888" font-size="10">Desktop</text>
  <rect x="195" y="85" width="410" height="270" rx="4" fill="#00ff41" opacity="0">
    <animate attributeName="opacity" values="0;0;0.25;0;0" keyTimes="0;0.36;0.4;0.45;1" dur="7s" repeatCount="1" fill="freeze"/>
  </rect>
  <g>
    <g transform="translate(220, 130)">
      <rect width="36" height="36" rx="5" fill="#4a90e2"/>
      <path d="M 10 12 L 16 12 L 18 14 L 26 14 L 26 24 L 10 24 Z" fill="white" opacity="0.9"/>
      <text x="18" y="52" text-anchor="middle" fill="#cccccc" font-size="10">Files</text>
    </g>
    <g transform="translate(220, 200)">
      <circle cx="18" cy="18" r="16" fill="#e74c3c"/>
      <circle cx="18" cy="18" r="11" fill="white"/>
      <text x="18" y="23" text-anchor="middle" fill="#e74c3c" font-size="16" font-weight="bold">@</text>
      <text x="18" y="52" text-anchor="middle" fill="#cccccc" font-size="10">Web</text>
    </g>
    <g transform="translate(220, 270)">
      <rect x="-6" y="-6" width="48" height="48" rx="8" fill="#00ff41" opacity="0" filter="url(#lp-strongGlow)">
        <animate attributeName="opacity" values="0;0;0.75;0.4;0.2;0.2;0" keyTimes="0;0.34;0.37;0.42;0.5;0.9;1" dur="7s" repeatCount="1" fill="freeze"/>
      </rect>
      <rect width="36" height="36" rx="5" fill="#1a1a1a" stroke="#00ff41" stroke-width="2"/>
      <text x="18" y="25" text-anchor="middle" fill="#00ff41" font-size="18" font-weight="bold" filter="url(#lp-glow)">&lt;/&gt;</text>
      <text x="18" y="52" text-anchor="middle" fill="#00ff41" font-size="10" filter="url(#lp-glow)">Code</text>
    </g>
    <g transform="translate(290, 130)">
      <rect width="36" height="36" rx="5" fill="#9b59b6"/>
      <path d="M 18 8 L 22 16 L 30 17 L 24 23 L 26 31 L 18 27 L 10 31 L 12 23 L 6 17 L 14 16 Z" fill="white" opacity="0.9"/>
      <text x="18" y="52" text-anchor="middle" fill="#cccccc" font-size="10">Fav</text>
    </g>
    <g transform="translate(290, 200)">
      <rect width="36" height="36" rx="5" fill="#f39c12"/>
      <rect x="8" y="20" width="6" height="10" fill="white"/>
      <rect x="16" y="14" width="6" height="16" fill="white"/>
      <rect x="24" y="8" width="6" height="22" fill="white"/>
      <text x="18" y="52" text-anchor="middle" fill="#cccccc" font-size="10">Stats</text>
    </g>
    <g transform="translate(290, 270)">
      <rect width="36" height="36" rx="5" fill="#16a085"/>
      <circle cx="18" cy="18" r="10" fill="white" opacity="0.9"/>
      <text x="18" y="24" text-anchor="middle" fill="#16a085" font-size="14" font-weight="bold">⚙</text>
      <text x="18" y="52" text-anchor="middle" fill="#cccccc" font-size="10">Settings</text>
    </g>
  </g>
  <g clip-path="url(#lp-screenClip)" filter="url(#lp-glow)">
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,310; 0,310; 0,0" keyTimes="0; 0.42; 0.62; 0.63; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="240" y="80"><tspan>0</tspan><tspan x="240" dy="14">1</tspan><tspan x="240" dy="14">0</tspan><tspan x="240" dy="14">1</tspan><tspan x="240" dy="14">{</tspan><tspan x="240" dy="14">}</tspan></text>
    </g>
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,330; 0,330; 0,0" keyTimes="0; 0.45; 0.68; 0.69; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="285" y="80"><tspan>1</tspan><tspan x="285" dy="14">0</tspan><tspan x="285" dy="14">1</tspan><tspan x="285" dy="14">1</tspan><tspan x="285" dy="14">;</tspan><tspan x="285" dy="14">(</tspan></text>
    </g>
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,320; 0,320; 0,0" keyTimes="0; 0.48; 0.72; 0.73; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="330" y="80"><tspan>&lt;</tspan><tspan x="330" dy="14">/</tspan><tspan x="330" dy="14">&gt;</tspan><tspan x="330" dy="14">=</tspan><tspan x="330" dy="14">1</tspan><tspan x="330" dy="14">0</tspan></text>
    </g>
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,340; 0,340; 0,0" keyTimes="0; 0.51; 0.75; 0.76; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="375" y="80"><tspan>0</tspan><tspan x="375" dy="14">0</tspan><tspan x="375" dy="14">1</tspan><tspan x="375" dy="14">1</tspan><tspan x="375" dy="14">0</tspan><tspan x="375" dy="14">1</tspan></text>
    </g>
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,310; 0,310; 0,0" keyTimes="0; 0.54; 0.78; 0.79; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="420" y="80"><tspan>i</tspan><tspan x="420" dy="14">f</tspan><tspan x="420" dy="14">(</tspan><tspan x="420" dy="14">t</tspan><tspan x="420" dy="14">)</tspan><tspan x="420" dy="14">=</tspan></text>
    </g>
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,330; 0,330; 0,0" keyTimes="0; 0.57; 0.82; 0.83; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="465" y="80"><tspan>1</tspan><tspan x="465" dy="14">1</tspan><tspan x="465" dy="14">0</tspan><tspan x="465" dy="14">0</tspan><tspan x="465" dy="14">1</tspan><tspan x="465" dy="14">0</tspan></text>
    </g>
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,320; 0,320; 0,0" keyTimes="0; 0.6; 0.85; 0.86; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="510" y="80"><tspan>[</tspan><tspan x="510" dy="14">]</tspan><tspan x="510" dy="14">{</tspan><tspan x="510" dy="14">}</tspan><tspan x="510" dy="14">;</tspan><tspan x="510" dy="14">,</tspan></text>
    </g>
    <g fill="#00ff41" font-size="12">
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,0; 0,310; 0,310; 0,0" keyTimes="0; 0.63; 0.88; 0.89; 1" dur="7s" repeatCount="1" fill="freeze"/>
      <text x="555" y="80"><tspan>0</tspan><tspan x="555" dy="14">1</tspan><tspan x="555" dy="14">0</tspan><tspan x="555" dy="14">1</tspan><tspan x="555" dy="14">1</tspan><tspan x="555" dy="14">0</tspan></text>
    </g>
  </g>
  <path d="M 160 370 L 640 370 L 615 410 L 185 410 Z" fill="url(#lp-laptopBase)" stroke="#0a0a0a" stroke-width="2"/>
  <rect x="350" y="378" width="100" height="22" rx="3" fill="#505050" stroke="#3a3a3a" stroke-width="1"/>
  <rect x="200" y="378" width="140" height="22" rx="3" fill="#404040" opacity="0.5"/>
  <rect x="460" y="378" width="140" height="22" rx="3" fill="#404040" opacity="0.5"/>
  <circle cx="238" cy="288" r="0" fill="none" stroke="#00ff41" stroke-width="2.5" opacity="0">
    <animate attributeName="r" values="0;0;0;35;55;55" keyTimes="0;0.34;0.37;0.45;0.55;1" dur="7s" repeatCount="1" fill="freeze"/>
    <animate attributeName="opacity" values="0;0;0.9;0.5;0;0" keyTimes="0;0.34;0.37;0.45;0.55;1" dur="7s" repeatCount="1" fill="freeze"/>
  </circle>
  <g>
    <animateTransform attributeName="transform" type="translate" values="100,180; 100,180; 236,286; 236,286; 236,286; 100,180" keyTimes="0;0.05;0.36;0.4;0.93;1" dur="7s" repeatCount="1" fill="freeze"/>
    <g>
      <animateTransform attributeName="transform" type="scale" values="1;1;0.6;1.1;1;1" keyTimes="0;0.35;0.37;0.39;0.42;1" dur="7s" repeatCount="1" fill="freeze"/>
      <use href="#lp-cursor" width="22" height="22"/>
    </g>
  </g>
</svg>`;
