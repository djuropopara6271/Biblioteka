import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import MyLoans from "../pages/MyLoans";
import Stats from "../pages/Stats";
import BookDetails from "../pages/BookDetails";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/books/:id" element={<BookDetails />} />

      <Route
        path="/my-loans"
        element={
          <ProtectedRoute>
            <MyLoans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route
        path="/stats"
        element={
          <AdminRoute>
            <Stats />
          </AdminRoute>
        }
      />

      <Route
        path="*"
        element={<div style={{ padding: 16 }}>404 - Not found</div>}
      />
    </Routes>
  );
}
