import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Ime mora imati bar 2 karaktera.")
    .required("Ime je obavezno."),
  email: yup
    .string()
    .trim()
    .email("Email nije validan.")
    .required("Email je obavezan."),
  password: yup
    .string()
    .min(6, "Lozinka mora imati bar 6 karaktera.")
    .required("Lozinka je obavezna."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Lozinke se ne poklapaju.")
    .required("Potvrda lozinke je obavezna."),
});

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    try {
      const cleaned = await schema.validate(form, { abortEarly: false });

      // Provera da li email već postoji
      const check = await axios.get(
        `http://localhost:3001/users?email=${encodeURIComponent(
          cleaned.email.trim()
        )}`
      );

      if (check.data.length > 0) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Email je već registrovan.",
        }));
        return;
      }

      await axios.post("http://localhost:3001/users", {
        name: cleaned.name.trim(),
        email: cleaned.email.trim(),
        password: cleaned.password,
        role: "user",
      });

      setSuccess("Registracija uspešna. Preusmeravam na login...");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });

      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      // Yup validation errors
      if (err?.name === "ValidationError") {
        const next = {};
        for (const e of err.inner) {
          if (!next[e.path]) next[e.path] = e.message;
        }
        setFieldErrors(next);
        return;
      }

      setError("Greška pri registraciji (proveri da li server radi).");
    }
  };

  return (
    <div>
      <h1>Registracija</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 10, maxWidth: 360 }}
      >
        <div>
          <input
            type="text"
            placeholder="Ime"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          {fieldErrors.name && (
            <div style={{ color: "red", fontSize: 12 }}>{fieldErrors.name}</div>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          {fieldErrors.email && (
            <div style={{ color: "red", fontSize: 12 }}>
              {fieldErrors.email}
            </div>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Lozinka (min 6)"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
          />
          {fieldErrors.password && (
            <div style={{ color: "red", fontSize: 12 }}>
              {fieldErrors.password}
            </div>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Potvrdi lozinku"
            value={form.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
          />
          {fieldErrors.confirmPassword && (
            <div style={{ color: "red", fontSize: 12 }}>
              {fieldErrors.confirmPassword}
            </div>
          )}
        </div>

        <button type="submit">Kreiraj nalog</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
