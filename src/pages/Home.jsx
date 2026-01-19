import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("TITLE_ASC"); // TITLE_ASC | TITLE_DESC | AVAILABLE_FIRST

  const fetchBooks = async () => {
    setError("");
    try {
      const res = await axios.get("http://localhost:3001/books");
      setBooks(res.data);
    } catch {
      setError("Greška pri učitavanju knjiga.");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const borrowBook = async (book) => {
    setError("");

    if (!user) {
      setError("Morate biti ulogovani da biste pozajmili knjigu.");
      return;
    }

    if (!book.available) {
      setError("Ova knjiga nije dostupna.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/loans", {
        userId: user.id,
        bookId: book.id,
        date: new Date().toISOString().slice(0, 10),
        status: "borrowed",
      });

      await axios.patch(`http://localhost:3001/books/${book.id}`, {
        available: false,
      });

      fetchBooks();
    } catch {
      setError("Greška pri pozajmljivanju knjige.");
    }
  };

  // Kategorije
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(books.map((b) => b.category).filter(Boolean))
    );
    unique.sort((a, b) => a.localeCompare(b));
    return ["ALL", ...unique];
  }, [books]);

  // Filter + Search + Sort
  const visibleBooks = useMemo(() => {
    let list = [...books];

    if (selectedCategory !== "ALL") {
      list = list.filter((b) => b.category === selectedCategory);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const t = (b.title || "").toLowerCase();
        const a = (b.author || "").toLowerCase();
        return t.includes(q) || a.includes(q);
      });
    }

    if (sortMode === "TITLE_ASC") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortMode === "TITLE_DESC") {
      list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sortMode === "AVAILABLE_FIRST") {
      list.sort((a, b) => {
        if (a.available === b.available) {
          return (a.title || "").localeCompare(b.title || "");
        }
        return a.available ? -1 : 1;
      });
    }

    return list;
  }, [books, selectedCategory, query, sortMode]);

  return (
    <div className="container">
      <h1 className="page-title">Online biblioteka</h1>
      <p className="page-sub">
        {user ? (
          <>
            Ulogovan: <strong>{user.name}</strong> ({user.role})
          </>
        ) : (
          <>Uloguj se da bi mogao da pozajmljuješ knjige.</>
        )}
      </p>

      {error && <div className="alert alert--error">{error}</div>}

      {/* Controls */}
      <div className="controls">
        <label>
          Kategorija:&nbsp;
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label>
          Pretraga:&nbsp;
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Naslov ili autor..."
          />
        </label>

        <label>
          Sort:&nbsp;
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
          >
            <option value="TITLE_ASC">Naslov A–Z</option>
            <option value="TITLE_DESC">Naslov Z–A</option>
            <option value="AVAILABLE_FIRST">Dostupne prvo</option>
          </select>
        </label>

        <span className="pill">
          Prikaz: <strong>{visibleBooks.length}</strong> / {books.length}
        </span>
      </div>

      {books.length === 0 && (
        <div className="alert">Nema knjiga u sistemu.</div>
      )}

      {books.length > 0 && visibleBooks.length === 0 && (
        <div className="alert">Nema rezultata za zadate filtere.</div>
      )}

      <div className="grid grid--books">
        {visibleBooks.map((book) => (
          <div key={book.id} className="card book">
            {book.imageUrl ? (
              <img className="cover" src={book.imageUrl} alt={book.title} />
            ) : (
              <div className="cover" />
            )}

            <div>
              <h3 className="book__title">{book.title}</h3>
              <div className="book__meta">{book.author}</div>

              <div className="book__meta" style={{ marginTop: 6 }}>
                Kategorija: <strong>{book.category || "N/A"}</strong>
              </div>

              <div
                className={`badge ${
                  book.available ? "badge--ok" : "badge--no"
                }`}
              >
                {book.available ? "Dostupna" : "Nije dostupna"}
              </div>

              <div className="row">
                <button
                  className="btn btn--primary"
                  onClick={() => borrowBook(book)}
                  disabled={!book.available}
                >
                  Pozajmi
                </button>

                <Link className="nav__link" to={`/books/${book.id}`}>
                  Detalji
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
