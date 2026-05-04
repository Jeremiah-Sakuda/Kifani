import { Routes, Route, useLocation } from "react-router-dom";
import Landing from "./components/Landing";
import Results from "./components/Results";
import Processing from "./components/Processing";
import ParalympicExplorer from "./components/ParalympicExplorer";
import EraTimeline from "./components/EraTimeline";
import About from "./components/About";
import Footer from "./components/Footer";

export default function App() {
  const location = useLocation();
  const showFooter = location.pathname === "/" || location.pathname.startsWith("/results") || location.pathname === "/paralympic" || location.pathname === "/era" || location.pathname === "/about";

  return (
    <div className="noise-overlay forge-grid flex min-h-screen flex-col">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gold-core focus:px-4 focus:py-2 focus:text-forge-black focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="flex-1" id="main-content" role="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/paralympic" element={<ParalympicExplorer />} />
          <Route path="/era" element={<EraTimeline />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}
