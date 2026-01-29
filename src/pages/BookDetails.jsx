import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBook = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/books/${id}`);
        setBook(res.data);
      } catch {
        setError("Knjiga nije pronađena.");
      }
    };

    loadBook();
  }, [id]);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!book) {
    return <p>Učitavanje...</p>;
  }

  return (
    <div>
      <h1>{book.title}</h1>
      <p>
        <strong>Autor:</strong> {book.author}
      </p>
      <p>
        <strong>Status:</strong> {book.available ? "Dostupna" : "Nije dostupna"}
      </p>

      {book.category && (
        <p>
          <strong>Kategorija:</strong> {book.category}
        </p>
      )}

      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={book.title}
          style={{ width: 200, marginTop: 10 }}
        />
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/">← Nazad na listu</Link>
      </div>
    </div>
  );
}
