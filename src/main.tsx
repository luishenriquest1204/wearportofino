import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/poppins/200.css";
import "@fontsource/poppins/200-italic.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/300-italic.css";
import "@fontsource/poppins/400.css";
import "@fontsource/ponomar/400.css";
import "@fontsource/luxurious-script/400.css";
import "@fontsource-variable/bodoni-moda/index.css";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
