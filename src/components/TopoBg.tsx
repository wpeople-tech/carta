export default function TopoBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
        fill="none"
      >
        {/* ── Graticule grid (geographic grid lines) ── */}
        <g stroke="#0F0F0D" strokeWidth="0.35" opacity="0.055">
          <line x1="360" y1="0" x2="360" y2="900" strokeDasharray="2,6" />
          <line x1="720" y1="0" x2="720" y2="900" strokeDasharray="2,6" />
          <line x1="1080" y1="0" x2="1080" y2="900" strokeDasharray="2,6" />
          <line x1="0" y1="225" x2="1440" y2="225" strokeDasharray="2,6" />
          <line x1="0" y1="450" x2="1440" y2="450" strokeDasharray="2,6" />
          <line x1="0" y1="675" x2="1440" y2="675" strokeDasharray="2,6" />
          {/* Secondary grid */}
          <line x1="180" y1="0" x2="180" y2="900" opacity="0.4" />
          <line x1="540" y1="0" x2="540" y2="900" opacity="0.4" />
          <line x1="900" y1="0" x2="900" y2="900" opacity="0.4" />
          <line x1="1260" y1="0" x2="1260" y2="900" opacity="0.4" />
          <line x1="0" y1="112" x2="1440" y2="112" opacity="0.4" />
          <line x1="0" y1="337" x2="1440" y2="337" opacity="0.4" />
          <line x1="0" y1="562" x2="1440" y2="562" opacity="0.4" />
          <line x1="0" y1="787" x2="1440" y2="787" opacity="0.4" />
        </g>

        {/* ── Contour lines ── */}
        <g stroke="#0F0F0D" strokeWidth="0.7" opacity="0.04">
          <path d="M-100,180 C120,140 280,200 460,170 C640,140 780,90 960,120 C1140,150 1280,100 1540,130" />
          <path d="M-100,220 C100,185 260,245 440,215 C620,185 770,128 950,162 C1130,196 1270,142 1540,175" />
          <path d="M-100,260 C80,228 240,292 420,260 C600,228 755,168 935,204 C1115,240 1255,184 1540,220" />
          <path d="M-100,300 C60,272 218,338 398,305 C578,272 738,208 918,246 C1098,284 1238,226 1540,265" />
          <path d="M-100,340 C50,316 198,384 378,350 C558,316 720,248 900,288 C1080,328 1218,268 1540,310" />
          <path d="M-100,420 C150,380 340,460 520,425 C700,390 860,310 1040,355 C1220,400 1360,335 1540,375" />
          <path d="M-100,465 C130,428 320,508 500,472 C680,436 845,353 1025,400 C1205,447 1345,380 1540,422" />
          <path d="M-100,510 C110,476 296,556 476,519 C656,482 825,396 1005,445 C1185,494 1325,425 1540,469" />
          <path d="M-100,555 C90,524 272,604 452,566 C632,528 805,439 985,490 C1165,541 1305,470 1540,516" />
          <path d="M-100,640 C200,595 420,680 600,640 C780,600 940,510 1120,560 C1300,610 1420,545 1540,580" />
          <path d="M-100,685 C180,642 398,728 578,687 C758,646 920,553 1100,605 C1280,657 1400,590 1540,627" />
          <path d="M-100,60 C200,30 380,90 560,55 C740,20 900,-30 1080,20 C1260,70 1380,10 1540,40" />
          <path d="M-100,100 C180,72 358,134 538,98 C718,62 880,5 1060,57 C1240,109 1358,47 1540,80" />
        </g>

        {/* ── Index contours (every 5th, slightly bolder) ── */}
        <g stroke="#0F0F0D" strokeWidth="1.1" opacity="0.035">
          <path d="M-100,220 C100,185 260,245 440,215 C620,185 770,128 950,162 C1130,196 1270,142 1540,175" />
          <path d="M-100,420 C150,380 340,460 520,425 C700,390 860,310 1040,355 C1220,400 1360,335 1540,375" />
          <path d="M-100,640 C200,595 420,680 600,640 C780,600 940,510 1120,560 C1300,610 1420,545 1540,580" />
        </g>

        {/* ── Elevation spot markers ── */}
        <g fill="#0F0F0D" opacity="0.05">
          <circle cx="240" cy="355" r="2" />
          <circle cx="780" cy="225" r="2" />
          <circle cx="1280" cy="470" r="2" />
          <circle cx="400" cy="670" r="2" />
        </g>

        {/* ── Closed contour hill formations ── */}
        <g stroke="#0F0F0D" fill="none" opacity="0.032">
          {/* Hill 1 — left */}
          <ellipse cx="240" cy="380" rx="180" ry="90" strokeWidth="0.7" />
          <ellipse cx="240" cy="380" rx="130" ry="62" strokeWidth="0.7" />
          <ellipse cx="240" cy="380" rx="80" ry="36" strokeWidth="0.8" />
          <ellipse cx="240" cy="380" rx="40" ry="18" strokeWidth="1" />
          {/* Hill 2 — center-upper */}
          <ellipse cx="780" cy="250" rx="200" ry="100" strokeWidth="0.7" />
          <ellipse cx="780" cy="250" rx="140" ry="68" strokeWidth="0.7" />
          <ellipse cx="780" cy="250" rx="85" ry="40" strokeWidth="0.8" />
          <ellipse cx="780" cy="250" rx="42" ry="20" strokeWidth="1" />
          {/* Hill 3 — right */}
          <ellipse cx="1280" cy="500" rx="160" ry="80" strokeWidth="0.7" />
          <ellipse cx="1280" cy="500" rx="110" ry="54" strokeWidth="0.7" />
          <ellipse cx="1280" cy="500" rx="65" ry="32" strokeWidth="0.8" />
          {/* Hill 4 — lower-left */}
          <ellipse cx="400" cy="700" rx="150" ry="75" strokeWidth="0.7" />
          <ellipse cx="400" cy="700" rx="100" ry="50" strokeWidth="0.7" />
          <ellipse cx="400" cy="700" rx="55" ry="28" strokeWidth="0.8" />
        </g>

        {/* ── Elevation labels on index contours ── */}
        <g
          fontFamily="'JetBrains Mono', monospace"
          fontSize="7"
          fill="#0F0F0D"
          opacity="0.07"
          letterSpacing="0.04em"
        >
          <text x="1380" y="173" transform="rotate(-2,1380,173)">── 1200m</text>
          <text x="1380" y="373" transform="rotate(-3,1380,373)">── 800m</text>
          <text x="1380" y="578" transform="rotate(-2,1380,578)">── 400m</text>
          <text x="242" y="376">▲ 1840m</text>
          <text x="782" y="246">▲ 2100m</text>
          <text x="1282" y="496">▲ 1650m</text>
          <text x="402" y="696">▲ 980m</text>
        </g>

        {/* ── Graticule coordinate tick labels ── */}
        <g
          fontFamily="'JetBrains Mono', monospace"
          fontSize="6"
          fill="#0F0F0D"
          opacity="0.06"
          letterSpacing="0.06em"
        >
          <text x="356" y="8">106°E</text>
          <text x="716" y="8">107°E</text>
          <text x="1076" y="8">108°E</text>
          <text x="2" y="229">13°S</text>
          <text x="2" y="454">14°S</text>
          <text x="2" y="679">15°S</text>
        </g>
      </svg>
    </div>
  );
}