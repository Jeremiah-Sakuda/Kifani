import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Results from "./components/Results";

export default function App() {
  return (
    <div className="noise-overlay min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/results/:sessionId" element={<Results />} />
      </Routes>
    </div>
  );
}
