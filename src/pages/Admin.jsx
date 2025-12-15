import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:3001/books");
      setBooks(res.data);
    } catch (err) {
      setError("Greška pri učitavanju knjiga");
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:3001/books", {
        title,
        author,
        available: true,
      });

      setTitle("");
      setAuthor("");
      fetchBooks();
    } catch (err) {
      setError("Greška pri dodavanju knjige");
    }
  };

  return (
    <div>
      <h1>Admin panel – knjige</h1>

      {/* Forma za dodavanje knjige */}
      <form onSubmit={addBook} style={{ marginBottom: 20 }}>
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
          Dodaj knjigu
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Lista knjiga */}
      <ul>
        {books.length === 0 && <li>Nema knjiga u sistemu</li>}

        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> – {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
