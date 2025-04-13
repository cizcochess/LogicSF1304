import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

createRoot(document.getElementById("root")!).render(<App />);
