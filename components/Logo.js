export default function Logo({ size = 36 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/* Blob */}
      <path
        fill="#2563EB"
        d="M100 16C122 4 158 10 174 38C188 63 188 98 174 124C160 150 132 168 106 170C80 172 50 160 32 140C14 120 12 88 22 62C32 36 78 28 100 16Z"
      />

      {/* Decorative rings */}
      <circle cx="46" cy="44" r="6"  fill="none" stroke="#93C5FD" strokeWidth="3"/>
      <circle cx="160" cy="88" r="5" fill="none" stroke="#93C5FD" strokeWidth="2.5"/>
      <circle cx="128" cy="162" r="4" fill="none" stroke="#93C5FD" strokeWidth="2.5"/>

      {/* Clock outer ring */}
      <circle cx="90" cy="88" r="55" fill="#1E3A8A"/>

      {/* Clock face */}
      <circle cx="90" cy="88" r="45" fill="#F8FAFF"/>

      {/* Minute hand (12 o'clock) */}
      <line x1="90" y1="88" x2="90" y2="55" stroke="#EC4899" strokeWidth="5" strokeLinecap="round"/>

      {/* Hour hand (~9 o'clock) */}
      <line x1="90" y1="88" x2="63" y2="100" stroke="#EC4899" strokeWidth="5" strokeLinecap="round"/>

      {/* Center dot */}
      <circle cx="90" cy="88" r="4.5" fill="#EC4899"/>

      {/* Pill — cream left half + pink right half, rotated −45° */}
      <g transform="translate(138,132) rotate(-45)">
        <path d="M0,-13 L-17,-13 Q-30,-13 -30,0 Q-30,13 -17,13 L0,13 Z" fill="#EDE0D0"/>
        <path d="M0,-13 L17,-13  Q30,-13  30,0  Q30,13  17,13  L0,13 Z"  fill="#EC4899"/>
        <line x1="0" y1="-13" x2="0" y2="13" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
      </g>
    </svg>
  );
}
