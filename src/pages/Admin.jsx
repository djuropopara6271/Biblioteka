import { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .min(2, "Naslov je prekratak.")
    .required("Naslov je obavezan."),
  author: yup
    .string()
    .trim()
    .min(2, "Autor je prekratak.")
    .required("Autor je obavezan."),
  category: yup.string().trim().required("Kategorija je obavezna."),
  imageUrl: yup
    .string()
    .trim()
    .matches(
      /^\/covers\/.+\.(png|jpg|jpeg|webp)$/i,
      "Unesi putanju npr. /covers/ime.png"
    )
    .required("imageUrl je obavezan (npr. /covers/clean-code.png)"),
});

export default function Admin() {
  const [books, setBooks] = useState([]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setError("");
    try {
      const res = await axios.get("http://localhost:3001/books");
      setBooks(res.data);
    } catch {
      setError("Greška pri učitavanju knjiga");
    }
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setCategory("");
    setImageUrl("");
    setEditingId(null);
    setFieldErrors({});
  };

  const addOrUpdateBook = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    try {
      const cleaned = await schema.validate(
        { title, author, category, imageUrl },
        { abortEarly: false }
      );

      const payload = {
        title: cleaned.title.trim(),
        author: cleaned.author.trim(),
        category: cleaned.category.trim(),
        imageUrl: cleaned.imageUrl.trim(),
        // NOTE: kad menjaš knjigu, ne diramo dostupnost ako već postoji
      };

      if (editingId) {
        const existing = books.find((b) => b.id === editingId);
        await axios.put(`http://localhost:3001/books/${editingId}`, {
          ...payload,
          available: existing?.available ?? true,
        });
      } else {
        await axios.post("http://localhost:3001/books", {
          ...payload,
          available: true,
        });
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      if (err?.name === "ValidationError") {
        const next = {};
        for (const e of err.inner) {
          if (!next[e.path]) next[e.path] = e.message;
        }
        setFieldErrors(next);
        return;
      }

      setError("Greška pri snimanju knjige");
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setTitle(book.title || "");
    setAuthor(book.author || "");
    setCategory(book.category || "");
    setImageUrl(book.imageUrl || "");
    setFieldErrors({});
    setError("");
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete knjigu?"))
      return;

    setError("");
    try {
      await axios.delete(`http://localhost:3001/books/${id}`);
      fetchBooks();
    } catch {
      setError("Greška pri brisanju knjige");
    }
  };

  return (
    <div>
      <h1>Admin panel – knjige</h1>

      <form
        onSubmit={addOrUpdateBook}
        style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 520 }}
      >
        <div>
          <input
            type="text"
            placeholder="Naslov knjige"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {fieldErrors.title && (
            <div style={{ color: "red", fontSize: 12 }}>
              {fieldErrors.title}
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Autor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          {fieldErrors.author && (
            <div style={{ color: "red", fontSize: 12 }}>
              {fieldErrors.author}
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Kategorija (npr. Programming, AI...)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          {fieldErrors.category && (
            <div style={{ color: "red", fontSize: 12 }}>
              {fieldErrors.category}
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="imageUrl (npr. /covers/clean-code.png)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {fieldErrors.imageUrl && (
            <div style={{ color: "red", fontSize: 12 }}>
              {fieldErrors.imageUrl}
            </div>
          )}
        </div>

        <div>
          <button type="submit">
            {editingId ? "Sačuvaj izmene" : "Dodaj knjigu"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{ marginLeft: 10 }}
            >
              Otkaži
            </button>
          )}
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {books.length === 0 && <li>Nema knjiga u sistemu</li>}

        {books.map((book) => (
          <li key={book.id} style={{ marginBottom: 8 }}>
            <strong>{book.title}</strong> – {book.author}
            {book.category ? ` • ${book.category}` : ""}
            <button onClick={() => editBook(book)} style={{ marginLeft: 10 }}>
              Izmeni
            </button>
            <button
              onClick={() => deleteBook(book.id)}
              style={{ marginLeft: 5 }}
            >
              Obriši
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
