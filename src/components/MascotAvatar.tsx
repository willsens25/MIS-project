import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MascotMood, MASCOT_MOOD_CONFIGS } from '../services/mascotMoodTracker';
import { useMascotMood } from '../hooks/useMascotMood';

interface MascotAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'yellow' | 'badge' | 'transparent';
  className?: string;
  showBorder?: boolean;
  interactive?: boolean;
  enableIdleAnimation?: boolean;
  mood?: MascotMood;
  showMoodBadge?: boolean;
  useRasterImage?: boolean;
  onClick?: () => void;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  size = 'md',
  variant = 'yellow',
  className = '',
  showBorder = false,
  interactive = true,
  enableIdleAnimation = false,
  mood: explicitMood,
  showMoodBadge = false,
  useRasterImage = false,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const { mood: trackedMood, moodConfig: trackedConfig } = useMascotMood();

  const effectiveMood: MascotMood = explicitMood || trackedMood || 'chill';
  const moodConfig = MASCOT_MOOD_CONFIGS[effectiveMood];

  const sizeDimensions = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 72
  };

  const px = sizeDimensions[size];

  // Motion variants for interactive state and floating idle bob
  const motionProps = interactive
    ? {
        whileHover: { scale: 1.08, rotate: 3 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
      }
    : {};

  // Idle floating bob animation properties
  const idleBobProps = enableIdleAnimation
    ? {
        animate: {
          y: [0, -4, 0, 3, 0],
          rotate: [0, -1.2, 0, 1.2, 0],
        },
        transition: {
          duration: 4.2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }
      }
    : {};

  // Optional raster fallback if requested explicitly
  if (useRasterImage && !imageError && variant === 'badge') {
    return (
      <motion.div
        {...motionProps}
        {...idleBobProps}
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-sm ${className}`}
        style={{ width: px, height: px }}
        title={`AI MIS Mascot — Mood: ${moodConfig.label}`}
      >
        <img
          src="/img/ai-mis-mascot.jpg"
          alt="AI MIS Mascot"
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
        {/* Dynamic blink overlay */}
        {enableIdleAnimation && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-900/20 to-transparent mix-blend-multiply rounded-full"
            animate={{
              opacity: [0, 0, 0, 0, 0.7, 0, 0, 0],
              scaleY: [1, 1, 1, 1, 0.2, 1, 1, 1],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              times: [0, 0.65, 0.88, 0.9, 0.92, 0.94, 0.96, 1],
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
    );
  }

  // Vector SVG illustration with dynamic facial expressions based on mood
  return (
    <motion.div
      {...motionProps}
      {...idleBobProps}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${
        showBorder ? 'ring-2 ring-emerald-500/40' : ''
      } ${className}`}
      style={{ width: px, height: px }}
      title={`AI MIS Mascot (${moodConfig.label})`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`mascot-circle-clip-${px}`}>
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
        <g clipPath={`url(#mascot-circle-clip-${px})`}>
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

          {/* Dynamic Rosy Blush Marks reflecting mood intensity */}
          <ellipse
            cx="44"
            cy="65"
            rx={effectiveMood === 'cheerful' ? 6 : effectiveMood === 'zen' ? 3.8 : 5}
            ry={effectiveMood === 'cheerful' ? 3.4 : effectiveMood === 'zen' ? 2.4 : 2.8}
            fill={effectiveMood === 'cheerful' ? '#ff4f75' : effectiveMood === 'focused' ? '#ff6685' : '#ff7690'}
            opacity={effectiveMood === 'zen' ? 0.75 : 0.9}
          />
          <ellipse
            cx="76"
            cy="59"
            rx={effectiveMood === 'cheerful' ? 5.5 : effectiveMood === 'zen' ? 3.4 : 4.5}
            ry={effectiveMood === 'cheerful' ? 3.2 : effectiveMood === 'zen' ? 2.2 : 2.6}
            fill={effectiveMood === 'cheerful' ? '#ff4f75' : effectiveMood === 'focused' ? '#ff6685' : '#ff7690'}
            opacity={effectiveMood === 'zen' ? 0.75 : 0.9}
          />

          {/* ==================================================================== */}
          {/* Dynamic Mood-Aware Mouth Expressions */}
          {/* ==================================================================== */}
          {effectiveMood === 'focused' ? (
            /* Focused: Confident Grinning Smirk with Corner Sparkle */
            <g id="mouth-focused">
              <path
                d="M 50 67 C 55 64 66 64 71 65 C 73 69 68 74 61 75 C 55 75 50 71 50 67 Z"
                fill="#ffffff"
                stroke="#1b120c"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 51 69.5 C 57 68.5 65 68.5 70 69"
                stroke="#1b120c"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Confident Star Gleam at teeth edge */}
              <path
                d="M 72 63.5 L 72.8 65 L 74.2 65.5 L 72.8 66 L 72 67.5 L 71.2 66 L 69.8 65.5 L 71.2 65 Z"
                fill="#ffffff"
              />
            </g>
          ) : effectiveMood === 'cheerful' ? (
            /* Cheerful: Joyful Open Smile with Pink Tongue & Teeth */
            <g id="mouth-cheerful">
              <path
                d="M 49 66 C 54 64 67 64 72 66 C 73 74 66 78 60 78 C 53 78 48 74 49 66 Z"
                fill="#8b1e3f"
                stroke="#1b120c"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Upper teeth */}
              <path
                d="M 50.5 66.5 C 55 65 66 65 70.5 66.5 C 70 69.5 65 70.5 60 70.5 C 55 70.5 51 69.5 50.5 66.5 Z"
                fill="#ffffff"
              />
              {/* Joyful Tongue */}
              <ellipse cx="60.5" cy="74.5" rx="5" ry="3" fill="#ff7690" />
            </g>
          ) : effectiveMood === 'curious' ? (
            /* Curious: Cute Inquisitive Parted Mouth */
            <g id="mouth-curious">
              <ellipse
                cx="61"
                cy="69"
                rx="4.2"
                ry="5"
                fill="#8b1e3f"
                stroke="#1b120c"
                strokeWidth="2.2"
              />
              <ellipse cx="61" cy="71" rx="2.8" ry="2" fill="#ff7690" />
            </g>
          ) : effectiveMood === 'zen' ? (
            /* Zen: Gentle Peaceful Little Smile */
            <g id="mouth-zen">
              <path
                d="M 53 69 Q 61 74 68 69"
                fill="none"
                stroke="#1b120c"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ) : (
            /* Chill / Baseline: Friendly Gentle Curved Line Smile */
            <g id="mouth-chill">
              <path
                d="M 51 67 Q 61 74 70 67"
                fill="none"
                stroke="#1b120c"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* ==================================================================== */}
          {/* Dynamic Mood-Aware Eyebrows */}
          {/* ==================================================================== */}
          {/* Left Eyebrow */}
          <motion.path
            d={
              effectiveMood === 'focused'
                ? 'M 45 52 C 49 52 53 55 57 59'
                : effectiveMood === 'cheerful'
                ? 'M 45 51 C 49 49 53 52 56 56'
                : effectiveMood === 'curious'
                ? 'M 45 54 C 49 54 53 56 56 58'
                : 'M 46 54 C 50 53 54 54 57 56'
            }
            stroke="#1b120c"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
            animate={
              enableIdleAnimation
                ? {
                    y: [0, -1, 0, 0.5, 0],
                  }
                : {}
            }
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Right Eyebrow */}
          <motion.path
            d={
              effectiveMood === 'curious'
                ? 'M 69 48 C 68 44 66 42 62 41' // One eyebrow raised curiously!
                : effectiveMood === 'focused'
                ? 'M 69 52 C 68 49 67 46 64 43' // Sharp determined slant
                : effectiveMood === 'cheerful'
                ? 'M 69 50 C 67 47 65 46 62 46' // Joyful high arch
                : 'M 68 53 C 66 51 63 50 60 51' // Relaxed natural
            }
            stroke="#1b120c"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
            animate={
              enableIdleAnimation
                ? {
                    y: [0, -1.2, 0, 0.5, 0],
                  }
                : {}
            }
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.15,
            }}
          />

          {/* ==================================================================== */}
          {/* Dynamic Mood-Aware Eyes with Natural Blinking */}
          {/* ==================================================================== */}
          {effectiveMood === 'zen' ? (
            /* Zen: Peaceful Closed Crescent Eyes (^_^) */
            <g id="eyes-zen">
              <path
                d="M 47 60 Q 51 55 55 60"
                fill="none"
                stroke="#1b120c"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M 64 57 Q 68 52 72 57"
                fill="none"
                stroke="#1b120c"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </g>
          ) : (
            <>
              {/* Left Eye Group */}
              <motion.g
                animate={
                  enableIdleAnimation
                    ? {
                        scaleY: [1, 1, 1, 1, 0.08, 1, 1, 1],
                      }
                    : {}
                }
                style={{ transformOrigin: '51px 60px' }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  times: [0, 0.65, 0.88, 0.9, 0.92, 0.94, 0.96, 1],
                  ease: 'easeInOut',
                }}
              >
                <ellipse cx="51" cy="60" rx="3.1" ry="3.6" fill="#1b120c" />
                <circle cx="52" cy="59" r="1.1" fill="#ffffff" />
                {effectiveMood === 'cheerful' && (
                  <circle cx="50" cy="61.5" r="0.6" fill="#ffffff" />
                )}
              </motion.g>

              {/* Right Eye Group */}
              <motion.g
                animate={
                  enableIdleAnimation
                    ? {
                        scaleY: [1, 1, 1, 1, 0.08, 1, 1, 1],
                      }
                    : {}
                }
                style={{ transformOrigin: '68px 56px' }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  times: [0, 0.65, 0.88, 0.9, 0.92, 0.94, 0.96, 1],
                  ease: 'easeInOut',
                }}
              >
                <ellipse cx="68" cy="56" rx="3.3" ry="3.8" fill="#1b120c" />
                <circle cx="69" cy="55" r="1.2" fill="#ffffff" />
                {effectiveMood === 'cheerful' && (
                  <circle cx="67" cy="57.5" r="0.7" fill="#ffffff" />
                )}

                {/* Star / Sparkle glint for Focused Power Users */}
                {effectiveMood === 'focused' && (
                  <path
                    d="M 69.5 54 L 70.2 55.2 L 71.5 55.5 L 70.2 55.8 L 69.5 57 L 68.8 55.8 L 67.5 55.5 L 68.8 55.2 Z"
                    fill="#ffffff"
                  />
                )}
              </motion.g>
            </>
          )}

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

      {/* Optional Subtle Mood Badge */}
      {showMoodBadge && (
        <span
          className="absolute -bottom-0.5 -right-0.5 text-[10px] p-0.5 rounded-full bg-slate-900 border border-slate-700 shadow-xs pointer-events-none"
          title={`Mood: ${moodConfig.label}`}
        >
          {moodConfig.badgeEmoji}
        </span>
      )}
    </motion.div>
  );
};
