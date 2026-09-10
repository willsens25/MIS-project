import React, { useState } from 'react';
import { motion } from 'motion/react';

interface MascotAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'yellow' | 'badge' | 'transparent';
  className?: string;
  showBorder?: boolean;
  interactive?: boolean;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  size = 'md',
  variant = 'yellow',
  className = '',
  showBorder = false,
  interactive = true
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeDimensions = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 72
  };

  const px = sizeDimensions[size];

  const motionProps = interactive
    ? {
        whileHover: { scale: 1.08, rotate: [0, -3, 3, 0] },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
      }
    : {};

  // Try displaying the high-res generated asset first if available
  if (!imageError && variant === 'badge') {
    return (
      <motion.div
        {...motionProps}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-sm ${className}`}
        style={{ width: px, height: px }}
      >
        <img
          src="/img/ai-mis-mascot.jpg"
          alt="AI MIS Mascot"
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      </motion.div>
    );
  }

  // Vector SVG illustration matching both Image 1 (Yellow circle) and Image 2 (Green ring + Pink background badge)
  return (
    <motion.div
      {...motionProps}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${
        showBorder ? 'ring-2 ring-emerald-500/40' : ''
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="mascot-circle-clip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>

        {/* Background Variations */}
        {variant === 'badge' ? (
          <>
            {/* Outer Dark Green Ring from Image 2 */}
            <circle cx="50" cy="50" r="49" fill="#1b4d2e" stroke="#164227" strokeWidth="2" />
            {/* Inner Pink Circle from Image 2 */}
            <circle cx="50" cy="50" r="39" fill="#f49cb8" />
          </>
        ) : variant === 'yellow' ? (
          <>
            {/* Yellow Circle from Image 1 */}
            <circle cx="50" cy="50" r="49" fill="#ffcb05" />
          </>
        ) : (
          <circle cx="50" cy="50" r="49" fill="transparent" />
        )}

        {/* Character Illustration */}
        <g clipPath="url(#mascot-circle-clip)">
          {/* Man-bun / Hair Knot at Top-Left */}
          <g id="bun">
            <path
              d="M 23 45 C 16 42 14 36 17 31 C 21 26 27 27 31 34 C 30 38 27 42 23 45 Z"
              fill="#743f1d"
              stroke="#1b120c"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 24 33 C 20 36 21 40 24 43"
              stroke="#1b120c"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Hair tie */}
            <ellipse cx="29" cy="40" rx="3.5" ry="5.5" fill="#1b120c" transform="rotate(-20 29 40)" />
          </g>

          {/* Undercut Dark Section & Temple */}
          <path
            d="M 32 46 C 28 50 28 57 32 63 C 35 67 40 68 43 65 C 42 58 39 52 35 48 Z"
            fill="#231b15"
          />
          {/* Undercut Texture Lines */}
          <line x1="32" y1="52" x2="35" y2="55" stroke="#4a3b32" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="33" y1="58" x2="37" y2="61" stroke="#4a3b32" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="36" y1="63" x2="40" y2="65" stroke="#4a3b32" strokeWidth="1.5" strokeLinecap="round" />

          {/* Ear with Piercing Studs */}
          <g id="ear">
            <path
              d="M 33 54 C 30 55 29 60 32 64 C 34 67 38 67 40 64 C 37 63 36 57 33 54 Z"
              fill="#fee2cc"
              stroke="#1b120c"
              strokeWidth="2"
            />
            {/* Piercing studs */}
            <circle cx="32" cy="59" r="1.2" fill="#1b120c" />
            <circle cx="34" cy="63" r="1.2" fill="#1b120c" />
          </g>

          {/* Chubby Chibi Face Base */}
          <path
            d="M 35 48 C 42 43 57 41 68 44 C 77 47 80 54 80 62 C 79 72 71 80 58 80 C 47 80 38 73 35 64 C 33 58 33 52 35 48 Z"
            fill="#fee2cc"
            stroke="#1b120c"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Cute Rosy Blush Marks */}
          <ellipse cx="44" cy="65" rx="5" ry="2.8" fill="#ff7690" />
          <ellipse cx="76" cy="59" rx="4.5" ry="2.6" fill="#ff7690" />

          {/* Grinning Clenched Teeth Mouth */}
          <g id="mouth">
            <path
              d="M 50 67 C 54 65 65 64 70 66 C 72 71 67 75 60 76 C 54 76 50 72 50 67 Z"
              fill="#ffffff"
              stroke="#1b120c"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Tooth Divider Line */}
            <path
              d="M 51 70.5 C 57 69.5 64 69.5 69 70"
              stroke="#1b120c"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>

          {/* Determined Bold Eyebrows */}
          {/* Left Eyebrow */}
          <path
            d="M 45 53 C 49 53 53 56 56 59"
            stroke="#1b120c"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right Eyebrow */}
          <path
            d="M 68 53 C 67 50 66 47 64 45"
            stroke="#1b120c"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Big Determined Cartoon Eyes */}
          {/* Left Eye */}
          <ellipse cx="51" cy="60" rx="3" ry="3.5" fill="#1b120c" />
          <circle cx="52" cy="59" r="1.1" fill="#ffffff" />

          {/* Right Eye */}
          <ellipse cx="68" cy="56" rx="3.2" ry="3.8" fill="#1b120c" />
          <circle cx="69" cy="55" r="1.2" fill="#ffffff" />

          {/* Brown Messy Hair Spikes on Top & Front */}
          <g id="hair-spikes">
            {/* Main Hair Volume */}
            <path
              d="M 28 42 C 34 33 46 27 60 28 C 72 29 80 36 82 45 C 80 43 75 42 70 43 C 65 41 57 41 50 43 C 44 44 38 48 34 52 C 32 48 30 45 28 42 Z"
              fill="#743f1d"
              stroke="#1b120c"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Spiky Strand 1 (Middle Up) */}
            <path
              d="M 46 32 C 48 24 55 23 58 25 C 57 29 55 33 53 35 Z"
              fill="#743f1d"
              stroke="#1b120c"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Spiky Strand 2 (Right Wing) */}
            <path
              d="M 60 30 C 66 23 75 24 81 29 C 78 33 73 34 68 35 Z"
              fill="#743f1d"
              stroke="#1b120c"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Spiky Strand 3 (Side Fringe) */}
            <path
              d="M 69 35 C 76 33 82 36 85 41 C 82 42 78 41 74 41 Z"
              fill="#743f1d"
              stroke="#1b120c"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Hair highlight curves */}
            <path
              d="M 42 35 C 48 31 56 31 64 33"
              stroke="#995a2d"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </motion.div>
  );
};
