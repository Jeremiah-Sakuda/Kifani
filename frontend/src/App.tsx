import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Results from "./components/Results";
import Processing from "./components/Processing";

export default function App() {
  return (
    <div className="noise-overlay forge-grid min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/results/:sessionId" element={<Results />} />
      </Routes>
    </div>
  );
}
