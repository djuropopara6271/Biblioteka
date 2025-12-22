import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
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
    setEditingId(null);
  };

  const addOrUpdateBook = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        // UPDATE
        await axios.put(`http://localhost:3001/books/${editingId}`, {
          title,
          author,
          available: true,
        });
      } else {
        // CREATE
        await axios.post("http://localhost:3001/books", {
          title,
          author,
          available: true,
        });
      }

      resetForm();
      fetchBooks();
    } catch {
      setError("Greška pri snimanju knjige");
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete knjigu?"))
      return;

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

      {/* Forma za dodavanje / izmenu */}
      <form onSubmit={addOrUpdateBook} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Naslov knjige"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Autor"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          style={{ marginLeft: 10 }}
        />

        <button type="submit" style={{ marginLeft: 10 }}>
          {editingId ? "Sačuvaj izmene" : "Dodaj knjigu"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: 10 }}>
            Otkaži
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Lista knjiga */}
      <ul>
        {books.length === 0 && <li>Nema knjiga u sistemu</li>}

        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> – {book.author}
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
