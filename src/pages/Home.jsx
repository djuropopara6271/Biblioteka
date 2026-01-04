import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

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
      // 1) Kreiraj loan zapis
      await axios.post("http://localhost:3001/loans", {
        userId: user.id,
        bookId: book.id,
        date: new Date().toISOString().slice(0, 10),
        status: "borrowed",
      });

      // 2) Obeleži knjigu kao nedostupnu
      await axios.patch(`http://localhost:3001/books/${book.id}`, {
        available: false,
      });

      fetchBooks();
    } catch {
      setError("Greška pri pozajmljivanju knjige.");
    }
  };

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

      <ul style={{ listStyle: "none", padding: 0 }}>
        {books.length === 0 && <li>Nema knjiga u sistemu.</li>}

        {books.map((book) => (
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
