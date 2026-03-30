/**
 * AiSparkle — Tri-Twinkle pixel art AI icon
 *
 * Three sparkles (large, medium, small) that twinkle in sequence.
 * Matches Coco's 4-bit pixel art style and Conveyor Green palette.
 *
 * Props:
 *   size     — icon size in px (default 16)
 *   animate  — enable twinkle animation (default true)
 *   color    — "green" (default) | "muted" for inactive/gray state
 *
 * Usage:
 *   <AiSparkle />                          // 16px, animated, green
 *   <AiSparkle size={24} />                // 24px nav icon
 *   <AiSparkle size={12} />                // 12px inline
 *   <AiSparkle size={48} />                // 48px hero/feature
 *   <AiSparkle color="muted" />            // gray inactive state
 *   <AiSparkle animate={false} />          // static (no animation)
 */

const AiSparkle = ({ size = 16, animate = true, color = 'green' }) => {
  const palette = color === 'muted'
    ? { bright: '#9898A8', mid: '#5E5E72', dim: '#3A3A4F', flash: '#9898A8' }
    : { bright: '#7AE8CB', mid: '#33C69F', dim: '#2AA886', flash: '#FFFFFF' };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle' }}
      role="img"
      aria-label="AI sparkle icon"
    >
      {/* ── Large sparkle (top-left, 4-point) ── */}
      {/* Center */}
      <rect x="2" y="2" width="1" height="1" fill={palette.bright}>
        {animate && (
          <animate
            attributeName="fill"
            values={`${palette.bright};${palette.flash};${palette.bright};${palette.bright}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Top ray */}
      <rect x="2" y="1" width="1" height="1" fill={palette.mid}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.8;1;0.3;0.8"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Left ray */}
      <rect x="1" y="2" width="1" height="1" fill={palette.mid}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.8;1;0.3;0.8"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Right ray */}
      <rect x="3" y="2" width="1" height="1" fill={palette.mid}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.8;1;0.3;0.8"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Bottom ray */}
      <rect x="2" y="3" width="1" height="1" fill={palette.mid}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.8;1;0.3;0.8"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {/* ── Medium sparkle (right, 4-point) ── */}
      {/* Center */}
      <rect x="5" y="3" width="1" height="1" fill={color === 'muted' ? palette.mid : '#5DDBB8'}>
        {animate && (
          <animate
            attributeName="fill"
            values={`${color === 'muted' ? palette.mid : '#5DDBB8'};${color === 'muted' ? palette.mid : '#5DDBB8'};${palette.flash};${color === 'muted' ? palette.mid : '#5DDBB8'}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Top ray */}
      <rect x="5" y="2" width="1" height="1" fill={palette.dim}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.3;0.8;1;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Left ray */}
      <rect x="4" y="3" width="1" height="1" fill={palette.dim}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.3;0.8;1;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Right ray */}
      <rect x="6" y="3" width="1" height="1" fill={palette.dim}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.3;0.8;1;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Bottom ray */}
      <rect x="5" y="4" width="1" height="1" fill={palette.dim}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.3;0.8;1;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {/* ── Small sparkle (bottom, minimal) ── */}
      {/* Center */}
      <rect x="3" y="5" width="1" height="1" fill={palette.mid}>
        {animate && (
          <animate
            attributeName="fill"
            values={`${palette.mid};${palette.mid};${palette.mid};${palette.flash}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Top ray */}
      <rect x="3" y="4" width="1" height="1" fill={color === 'muted' ? palette.dim : '#1E7F65'}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.3;0.3;0.8;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Left ray */}
      <rect x="2" y="5" width="1" height="1" fill={color === 'muted' ? palette.dim : '#1E7F65'}>
        {animate && (
          <animate
            attributeName="opacity"
            values="0.3;0.3;0.8;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>
    </svg>
  );
};

export default AiSparkle;
