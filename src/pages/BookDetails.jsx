import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    setError("");
    try {
      const res = await axios.get(`http://localhost:3001/books/${id}`);
      setBook(res.data);
    } catch {
      setError("Knjiga nije pronađena.");
    }
  };

  const borrowBook = async () => {
    setError("");
    if (!user) {
      navigate("/login");
      return;
    }
    if (!book?.available) {
      setError("Knjiga nije dostupna.");
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

      fetchBook();
    } catch {
      setError("Greška pri pozajmljivanju knjige.");
    }
  };

  const returnBook = async () => {
    setError("");
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // nađi aktivnu pozajmicu za ovu knjigu (po useru)
      const res = await axios.get(
        `http://localhost:3001/loans?userId=${user.id}&bookId=${book.id}&status=borrowed`
      );

      if (res.data.length === 0) {
        setError("Nemaš aktivnu pozajmicu za ovu knjigu.");
        return;
      }

      const loan = res.data[0];

      await axios.patch(`http://localhost:3001/loans/${loan.id}`, {
        status: "returned",
        returnDate: new Date().toISOString().slice(0, 10),
      });

      await axios.patch(`http://localhost:3001/books/${book.id}`, {
        available: true,
      });

      fetchBook();
    } catch {
      setError("Greška pri vraćanju knjige.");
    }
  };

  if (error && !book) {
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/")}>Nazad</button>
      </div>
    );
  }

  if (!book) return <p>Učitavanje...</p>;

  return (
    <div>
      <button onClick={() => navigate("/")}>← Nazad</button>

      <h1 style={{ marginTop: 12 }}>{book.title}</h1>
      <p>
        <strong>Autor:</strong> {book.author}
      </p>

      <p>
        <strong>Status:</strong> {book.available ? "Dostupna" : "Nije dostupna"}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={borrowBook} disabled={!book.available}>
          Pozajmi
        </button>

        <button onClick={returnBook}>Vrati</button>
      </div>

      {!user && (
        <p style={{ marginTop: 12 }}>
          Uloguj se da bi pozajmio ili vratio knjigu.
        </p>
      )}
    </div>
  );
}
