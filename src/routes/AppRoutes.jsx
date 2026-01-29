import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import Stats from "../pages/Stats";
import MyLoans from "../pages/MyLoans";
import BookDetails from "../pages/BookDetails";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/books/:id" element={<BookDetails />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<Admin />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/my-loans" element={<MyLoans />} />

      <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
    </Routes>
  );
}
