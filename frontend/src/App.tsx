import { Routes, Route, useLocation } from "react-router-dom";
import Landing from "./components/Landing";
import Results from "./components/Results";
import Processing from "./components/Processing";
import Footer from "./components/Footer";

export default function App() {
  const location = useLocation();
  const showFooter = location.pathname === "/" || location.pathname.startsWith("/results");

  return (
    <div className="noise-overlay forge-grid flex min-h-screen flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/results/:sessionId" element={<Results />} />
        </Routes>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}
