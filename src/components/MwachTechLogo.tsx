import React from "react";

interface MwachTechLogoProps {
  className?: string;
  variant?: "full" | "compact" | "horizontal" | "badge";
  lightMode?: boolean;
}

export const MwachTechLogo: React.FC<MwachTechLogoProps> = ({
  className = "",
  variant = "full",
  lightMode = false
}) => {
  const textColor = lightMode ? "text-slate-900" : "text-white";
  const subTextColor = lightMode ? "text-slate-600" : "text-slate-300";

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Top Graphic + Brand Text Container */}
      <div className="flex items-center gap-3">
        {/* Stylized MwachTech Circuit 'M' Icon */}
        <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="mTechGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="mTechDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Floating Pixel Data Blocks (Top Left) */}
            <rect x="22" y="10" width="8" height="8" rx="1.5" fill="#38BDF8" className="animate-pulse" />
            <rect x="33" y="10" width="8" height="8" rx="1.5" fill="#60A5FA" />
            <rect x="33" y="21" width="8" height="8" rx="1.5" fill="#2563EB" />
            <rect x="44" y="10" width="8" height="8" rx="1.5" fill="#FFFFFF" />

            {/* Left Circuit Leg with Node */}
            <path
              d="M 18 85 L 18 35 L 42 70"
              stroke="url(#mTechGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Circuit Leg with Node */}
            <path
              d="M 82 85 L 82 35 L 58 70"
              stroke="url(#mTechGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Connecting V-Bridge */}
            <path
              d="M 42 70 L 50 82 L 58 70"
              stroke="#60A5FA"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circuit Nodes (Bottom Circles) */}
            <circle cx="18" cy="85" r="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <circle cx="82" cy="85" r="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />

            {/* Node Center Pulses */}
            <circle cx="18" cy="85" r="2" fill="#38BDF8" />
            <circle cx="82" cy="85" r="2" fill="#38BDF8" />
          </svg>
        </div>

        {/* Brand Name Typography */}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline tracking-tight font-extrabold text-2xl sm:text-3xl leading-none">
            <span className={textColor}>Mwach</span>
            <span className="text-blue-500 font-extrabold ml-0.5">Tech</span>
          </div>

          {/* Sub-line: SOLUTIONS */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-[1px] w-3 bg-blue-500/60" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-blue-400 uppercase leading-none">
              SOLUTIONS
            </span>
            <div className="h-[1px] w-3 bg-blue-500/60" />
          </div>
        </div>
      </div>

      {/* Tagline below */}
      {variant === "full" && (
        <div className="mt-2 text-center">
          <p className={`text-[11px] sm:text-xs italic font-medium tracking-wide ${subTextColor}`}>
            Digitalizing your world as we bring the{" "}
            <span className="text-blue-400 font-semibold underline decoration-blue-500 decoration-2 underline-offset-2">
              future
            </span>{" "}
            into present
          </p>
        </div>
      )}
    </div>
  );
};
