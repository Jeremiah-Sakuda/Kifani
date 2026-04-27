import { motion } from "framer-motion";
import type { ReactNode } from "react";

type InputMode = "photo" | "voice" | "form";

interface Props {
  activeMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

const MODES: { id: InputMode; label: string; icon: ReactNode; description: string }[] = [
  {
    id: "photo",
    label: "Photo",
    description: "Upload or capture",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
  {
    id: "voice",
    label: "Voice",
    description: "Describe yourself",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    id: "form",
    label: "Form",
    description: "Enter details",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
];

export default function InputModeSelector({ activeMode, onModeChange }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-forge-charcoal/80 p-1.5 backdrop-blur-sm">
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`relative flex items-center gap-2.5 rounded-xl px-5 py-3 transition-all duration-300 ${
              isActive ? "text-forge-black" : "text-smoke hover:text-white"
            }`}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-deep via-gold-core to-gold-bright"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            {/* Content */}
            <span className="relative z-10">{mode.icon}</span>
            <div className="relative z-10 text-left">
              <span className="block text-sm font-semibold">{mode.label}</span>
              <span className={`block text-[10px] ${isActive ? "text-forge-charcoal" : "text-ash"}`}>
                {mode.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
