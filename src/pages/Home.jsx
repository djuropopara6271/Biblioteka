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

    // category
    if (selectedCategory !== "ALL") {
      list = list.filter((b) => b.category === selectedCategory);
    }

    // search (title or author)
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const t = (b.title || "").toLowerCase();
        const a = (b.author || "").toLowerCase();
        return t.includes(q) || a.includes(q);
      });
    }

    // sort
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
    <div>
      <h1>Online biblioteka</h1>

      {user ? (
        <p>
          Ulogovan: <strong>{user.name}</strong> ({user.role})
        </p>
      ) : (
        <p>Uloguj se da bi mogao da pozajmljuješ knjige.</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Knjige</h2>

      {/* Controls */}
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}
      >
        {/* Category */}
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

        {/* Search */}
        <label>
          Pretraga:&nbsp;
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Naslov ili autor..."
          />
        </label>

        {/* Sort */}
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

        <span style={{ opacity: 0.8 }}>
          Prikaz: <strong>{visibleBooks.length}</strong> / {books.length}
        </span>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {books.length === 0 && <li>Nema knjiga u sistemu.</li>}

        {books.length > 0 && visibleBooks.length === 0 && (
          <li>Nema rezultata za zadate filtere.</li>
        )}

        {visibleBooks.map((book) => (
          <li
            key={book.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
              borderBottom: "1px solid #ddd",
              paddingBottom: 10,
            }}
          >
            {book.imageUrl && (
              <img
                src={book.imageUrl}
                alt={book.title}
                width={70}
                height={100}
                style={{
                  objectFit: "cover",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            )}

            <div>
              <div>
                <strong>{book.title}</strong> – {book.author}{" "}
                {book.available ? "(dostupna)" : "(nije dostupna)"}
              </div>

              <div style={{ opacity: 0.85, marginTop: 2 }}>
                Kategorija: <strong>{book.category || "N/A"}</strong>
              </div>

              <div style={{ marginTop: 6 }}>
                <button
                  onClick={() => borrowBook(book)}
                  disabled={!book.available}
                  style={{ marginRight: 8 }}
                >
                  Pozajmi
                </button>

                <Link to={`/books/${book.id}`}>Detalji</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
