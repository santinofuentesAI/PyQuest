export const OFFICE_SVG = `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="of-gradiente-ira" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ff4d4d" />
                <stop offset="100%" stop-color="#800000" />
            </radialGradient>
            <pattern id="of-lineas-velocidad" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M100,0 L100,200 M0,100 L200,100 M29,29 L171,171 M171,29 L29,171" stroke="#ffffff" stroke-width="2" opacity="0.1"/>
            </pattern>
        </defs>
        <g class="escena-1">
            <rect width="1600" height="900" fill="#ecf0f1" />
            <rect x="700" y="150" width="500" height="350" fill="#d6eaf8" rx="15"/>
            <line x1="700" y1="325" x2="1200" y2="325" stroke="#3498db" stroke-width="10"/>
            <line x1="950" y1="150" x2="950" y2="500" stroke="#3498db" stroke-width="10"/>
            <rect y="650" width="1600" height="250" fill="#bdc3c7" />
            <line x1="0" y1="650" x2="1600" y2="650" stroke="#95a5a6" stroke-width="8"/>
            <g class="jefe-cuerpo-grupo">
                <g class="piernas-jefe">
                    <rect x="215" y="580" width="28" height="200" fill="#1f2a38" rx="10"/>
                    <rect x="260" y="580" width="28" height="200" fill="#1f2a38" rx="10"/>
                    <rect x="205" y="760" width="40" height="20" fill="#000" rx="5"/>
                    <rect x="250" y="760" width="40" height="20" fill="#000" rx="5"/>
                </g>
                <line x1="220" y1="472" x2="210" y2="560" stroke="#243342" stroke-width="25" stroke-linecap="round"/>
                <rect x="200" y="450" width="100" height="150" rx="20" fill="#2c3e50" />
                <polygon points="240,450 260,450 255,520 250,530 245,520" fill="#e74c3c"/>
                <circle cx="250" cy="400" r="45" class="jefe-piel" />
                <circle cx="270" cy="400" r="15" fill="#f5cba7" class="jefe-piel" opacity="0.5"/>
                <circle cx="255" cy="395" r="14" fill="none" stroke="#333" stroke-width="4"/>
                <circle cx="285" cy="395" r="14" fill="none" stroke="#333" stroke-width="4"/>
                <line x1="269" y1="395" x2="271" y2="395" stroke="#333" stroke-width="4"/>
                <line x1="241" y1="395" x2="215" y2="395" stroke="#333" stroke-width="4"/>
                <g class="brazo-jefe-apuntando">
                    <line x1="282" y1="472" x2="282" y2="565" stroke="#2c3e50" stroke-width="25" stroke-linecap="round"/>
                    <line x1="282" y1="565" x2="282" y2="590" stroke="#f5cba7" stroke-width="8" stroke-linecap="round" class="jefe-piel-stroke"/>
                    <circle cx="282" cy="565" r="12" fill="#f5cba7" class="jefe-piel"/>
                </g>
            </g>
            <rect x="150" y="550" width="300" height="120" fill="#8e44ad" />
            <rect x="120" y="530" width="360" height="20" fill="#9b59b6" />
            <rect x="350" y="430" width="80" height="100" fill="#34495e" rx="5"/>
            <rect x="375" y="530" width="30" height="20" fill="#7f8c8d"/>
            <g class="empleado">
                <g class="brazo-2">
                    <line x1="0" y1="420" x2="0" y2="520" stroke="#2471a3" stroke-width="20" stroke-linecap="round"/>
                </g>
                <g class="pierna-2">
                    <line x1="0" y1="520" x2="0" y2="690" stroke="#2c3e50" stroke-width="24" stroke-linecap="round"/>
                    <path d="M 15 670 L 15 690 L -25 690 Q -35 690 -35 680 Q -35 670 -25 670 Z" fill="#000"/>
                </g>
                <rect x="-35" y="380" width="70" height="150" rx="20" fill="#2980b9" />
                <rect x="-10" y="360" width="20" height="30" fill="#f5cba7" />
                <polygon points="-15,380 15,380 0,420" fill="#ecf0f1"/>
                <g transform="translate(0, 310)">
                    <ellipse cx="-5" cy="15" rx="35" ry="40" fill="#f5cba7" />
                    <path d="M -35 15 L -45 20 L -35 30 Z" fill="#f5cba7" />
                    <circle cx="15" cy="15" r="8" fill="#f5cba7" stroke="#e6b0aa" stroke-width="2"/>
                    <path d="M -40 0 Q -25 -40 10 -35 Q 40 -20 30 10 C 35 25 25 35 15 30 Q 15 -10 -40 0 Z" fill="#5d4037"/>
                    <path d="M 10 10 L 10 25 L 18 20 Z" fill="#5d4037"/>
                    <ellipse cx="-25" cy="10" rx="4" ry="7" fill="#fff"/>
                    <circle cx="-27" cy="10" r="3" fill="#000"/>
                    <path d="M -30 0 Q -20 -5 -15 2" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round"/>
                </g>
                <g class="pierna-1">
                    <line x1="0" y1="520" x2="0" y2="690" stroke="#34495e" stroke-width="24" stroke-linecap="round"/>
                    <path d="M 15 670 L 15 690 L -25 690 Q -35 690 -35 680 Q -35 670 -25 670 Z" fill="#111"/>
                </g>
                <g class="brazo-1">
                    <line x1="0" y1="420" x2="0" y2="520" stroke="#3498db" stroke-width="20" stroke-linecap="round"/>
                    <rect x="-30" y="520" width="60" height="40" fill="#d35400" rx="5"/>
                    <path d="M -15 520 L -15 500 L 15 500 L 15 520" fill="none" stroke="#000" stroke-width="4"/>
                </g>
            </g>
            <path d="M 1400 650 Q 1350 500 1450 400 Q 1480 500 1400 650" fill="#2ecc71"/>
            <path d="M 1400 650 Q 1450 550 1550 450 Q 1500 600 1400 650" fill="#27ae60"/>
            <rect x="1370" y="650" width="60" height="80" fill="#e67e22"/>
        </g>
        <g class="escena-2">
            <rect width="1600" height="900" fill="url(#of-gradiente-ira)" />
            <rect width="3200" height="1800" x="-800" y="-450" fill="url(#of-lineas-velocidad)" class="fondo-anime"/>
            <circle cx="800" cy="500" r="400" fill="#e74c3c" />
            <g class="vena-palpitando">
                <path d="M 670 270 L 730 330 M 730 270 L 670 330" stroke="#7b241c" stroke-width="12" stroke-linecap="round"/>
                <path d="M 700 250 L 700 350 M 650 300 L 750 300" stroke="#7b241c" stroke-width="12" stroke-linecap="round"/>
            </g>
            <circle cx="550" cy="450" r="140" fill="#ffffff" fill-opacity="0.3" stroke="#222" stroke-width="25"/>
            <circle cx="1050" cy="450" r="140" fill="#ffffff" fill-opacity="0.3" stroke="#222" stroke-width="25"/>
            <line x1="690" y1="450" x2="910" y2="450" stroke="#222" stroke-width="25"/>
            <line x1="400" y1="350" x2="650" y2="480" stroke="#111" stroke-width="40" stroke-linecap="round"/>
            <line x1="1200" y1="350" x2="950" y2="480" stroke="#111" stroke-width="40" stroke-linecap="round"/>
            <ellipse class="boca-hablando" cx="800" cy="680" rx="160" ry="30" fill="#4a2311" />
            <path d="M 680 660 L 920 660 L 920 690 L 680 690 Z" fill="#fff" class="boca-hablando"/>
        </g>
        <g class="escena-3">
            <rect width="1600" height="900" fill="#154360" />
            <path d="M 100 0 L 150 900 M 300 0 L 280 900 M 1300 0 L 1350 900 M 1500 0 L 1450 900" stroke="#2980b9" stroke-width="40" opacity="0.4"/>
            <circle cx="800" cy="550" r="320" fill="#d4e6f1" />
            <g fill="#5d4037" transform="translate(0, -50)">
                <path d="M 480 500 L 400 200 L 580 300 L 680 50 L 800 250 L 920 50 L 1020 300 L 1200 200 L 1120 500 Z" />
                <path d="M 480 500 Q 800 150 1120 500 Z" />
                <polygon points="480,450 470,600 520,530" />
                <polygon points="1120,450 1130,600 1080,530" />
            </g>
            <circle cx="620" cy="480" r="130" fill="#ffffff" stroke="#111" stroke-width="15"/>
            <circle cx="980" cy="480" r="130" fill="#ffffff" stroke="#111" stroke-width="15"/>
            <circle cx="620" cy="480" r="15" fill="#000" class="pupila-temblorosa"/>
            <circle cx="980" cy="480" r="15" fill="#000" class="pupila-temblorosa"/>
            <path d="M 500 620 Q 620 680 740 620" fill="none" stroke="#5499c7" stroke-width="10" stroke-linecap="round"/>
            <path d="M 860 620 Q 980 680 1100 620" fill="none" stroke="#5499c7" stroke-width="10" stroke-linecap="round"/>
            <ellipse cx="800" cy="750" rx="70" ry="100" fill="#111" />
            <path d="M 1080 350 Q 1140 450 1080 480 Q 1020 450 1080 350" fill="#3498db" class="gota-sudor"/>
        </g>
    </svg>`;
