export default function LipBalmIcon({ size = 120, className = '', color = 'brand' }) {
  const lipColor = color === 'white' ? '#FFFFFF' : '#D4556A';
  const lipDark = color === 'white' ? '#E0E0E0' : '#B83A4E';
  const lipMid = color === 'white' ? '#F0F0F0' : '#E8788A';
  const lipHighlight = color === 'white' ? '#FFFFFF' : '#FFB4C4';
  const tubeBody = color === 'white' ? '#FFFFFF' : '#F5F5F5';
  const tubeCap = color === 'white' ? '#E8E8E8' : '#E0E0E0';
  const tubeStroke = color === 'white' ? '#CCC' : '#BBB';
  const cyanAccent = '#00BCD4';
  const balmTip = color === 'white' ? '#FFE8D8' : '#F8D8C0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Lower lip (back) */}
      <ellipse cx="46" cy="66" rx="30" ry="18" fill={lipColor} />
      <ellipse cx="46" cy="68" rx="26" ry="14" fill={lipDark} />

      {/* Mouth opening */}
      <path
        d="M20 60 Q33 52 46 55 Q59 52 72 60"
        fill={lipDark}
        opacity="0.85"
      />
      <ellipse cx="46" cy="60" rx="24" ry="5" fill="#1a0508" opacity="0.65" />

      {/* Upper lip */}
      <path
        d="M18 60 Q28 44 46 48 Q64 44 74 60 Q64 54 46 56 Q28 54 18 60Z"
        fill={lipMid}
      />

      {/* Upper lip cupid's bow highlight */}
      <path
        d="M32 50 Q39 46 46 48 Q53 46 60 50"
        stroke={lipHighlight}
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* Lower lip gloss highlights */}
      <ellipse cx="42" cy="70" rx="10" ry="4" fill="white" opacity="0.2" />
      <circle cx="36" cy="68" r="2.5" fill="white" opacity="0.45" />
      <circle cx="50" cy="67" r="1.8" fill="white" opacity="0.35" />
      <circle cx="43" cy="72" r="1.2" fill="white" opacity="0.3" />

      {/* Chapstick tube */}
      <g transform="translate(62, 34) rotate(40)">
        {/* Tube body */}
        <rect
          x="0" y="0"
          width="14" height="42"
          rx="2.5"
          fill={tubeBody}
          stroke={tubeStroke}
          strokeWidth="0.8"
        />

        {/* Tube label area */}
        <rect x="0" y="14" width="14" height="16" rx="0" fill="white" opacity="0.5" />

        {/* Brand stripes on tube */}
        <rect x="3" y="16" width="8" height="2.5" rx="1" fill={lipColor} />
        <rect x="4" y="20" width="6" height="1.8" rx="0.9" fill={cyanAccent} />
        <rect x="3.5" y="24" width="7" height="1" rx="0.5" fill={lipColor} opacity="0.4" />

        {/* Tube cap / base */}
        <rect
          x="-1" y="34"
          width="16" height="10"
          rx="2"
          fill={tubeCap}
          stroke={tubeStroke}
          strokeWidth="0.8"
        />
        {/* Cap grip lines */}
        <line x1="3" y1="37" x2="11" y2="37" stroke={tubeStroke} strokeWidth="0.5" />
        <line x1="3" y1="39" x2="11" y2="39" stroke={tubeStroke} strokeWidth="0.5" />
        <line x1="3" y1="41" x2="11" y2="41" stroke={tubeStroke} strokeWidth="0.5" />

        {/* Balm tip */}
        <ellipse cx="7" cy="2" rx="5.5" ry="3.5" fill={balmTip} />
        <ellipse cx="7" cy="0.5" rx="3.5" ry="1.8" fill="white" opacity="0.35" />
        <path
          d="M2 2 Q7 -2 12 2"
          stroke={lipColor}
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />
      </g>

      {/* Balm drip / application mark */}
      <path
        d="M68 60 Q71 66 68 71 Q66 74 67 77"
        stroke={lipColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="67" cy="78.5" r="2" fill={lipColor} opacity="0.4" />
    </svg>
  );
}
