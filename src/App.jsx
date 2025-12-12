import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}
