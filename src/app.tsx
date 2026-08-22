import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Background } from "./components/archive/Background";
import IndexRoute from "./routes/index";
import EngineRoute from "./routes/engine";
import AxiomsRoute from "./routes/axioms";
import LimitsRoute from "./routes/limits";
import "./styles.css";

const metadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Lex Forensica — Living Archive",
    description: "A dignity-first forensic narrative system for reading institutional records with the subject's account intact.",
  },
  "/engine": {
    title: "Narrative Engine — Lex Forensica",
    description: "A guided, evidence-bound conversation through the AI-Forensica pipeline.",
  },
  "/axioms": {
    title: "Axioms & Metaconduct — Lex Forensica",
    description: "A1–A6, TRIPARTITE, RULE_001, and operating constraints.",
  },
  "/limits": {
    title: "Limits & Data Handling — Lex Forensica",
    description: "Research and advocacy support, not legal advice; how session text is handled.",
  },
};

function Meta() {
  const { pathname } = useLocation();
  const item = metadata[pathname] || metadata["/"];
  document.title = item.title;
  return <meta name="description" content={item.description} />;
}

function Shell() {
  return (
    <>
      <Background />
      <Meta />
      <header className="app-header">
        <Link to="/">LEX FORENSICA</Link>
        <nav aria-label="Primary navigation">
          <Link to="/engine">ENGINE / CHAT</Link>
          <Link to="/axioms">AXIOMS</Link>
          <Link to="/limits">LIMITS</Link>
        </nav>
        <span>TRACEABILITY / ACTIVE</span>
      </header>

      <Routes>
        <Route path="/" element={<IndexRoute />} />
        <Route path="/engine" element={<EngineRoute />} />
        <Route path="/axioms" element={<AxiomsRoute />} />
        <Route path="/limits" element={<LimitsRoute />} />
      </Routes>

      <footer>
        LEX FORENSICA · <a href="https://github.com/SteelsSystem/lexforensica">GitHub project</a> · <Link to="/">Living Archive</Link> · <Link to="/engine">Control Room</Link>
      </footer>
    </>
  );
}

export default function App() {
  return <Shell />;
}
