import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-forge-graphite/50 bg-forge-black/80 backdrop-blur-sm">
      <div className="shell py-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          {/* Project Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="font-display text-lg text-white">FORGED</span>
              <span className="rounded-full bg-gold-core/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-core">
                Prototype
              </span>
            </div>
            <p className="text-sm text-smoke">
              A Gemini-powered exploration of athletic archetypes
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/paralympic"
              className="text-ash transition hover:text-gold-core"
            >
              Paralympic Explorer
            </Link>
            <Link
              to="/era"
              className="text-ash transition hover:text-gold-core"
            >
              Era Timeline
            </Link>
            <Link
              to="/about"
              className="text-ash transition hover:text-gold-core"
            >
              About & Methodology
            </Link>
          </nav>

          {/* Partner Logos / Credits */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex items-center gap-4 text-xs text-ash">
              <span>Built for</span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-smoke">Team USA</span>
                <span className="text-forge-graphite">&times;</span>
                <span className="font-medium text-smoke">Google Cloud</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-ash">
              <span>Powered by</span>
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-forge-steel/50 px-2 py-0.5 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <svg className="h-3 w-3 text-para-blue" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Gemini
              </motion.span>
              <span className="text-forge-graphite">&</span>
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-forge-steel/50 px-2 py-0.5 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Imagen
              </motion.span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 border-t border-forge-graphite/30 pt-4">
          <p className="text-center text-[10px] leading-relaxed text-ash">
            This is a fan experience prototype. Results are based on historical biometric patterns
            and should not be interpreted as athletic predictions or recommendations.
            No personal data is stored. Paralympic and Olympic sports receive equal analytical depth.
          </p>
        </div>
      </div>
    </footer>
  );
}
