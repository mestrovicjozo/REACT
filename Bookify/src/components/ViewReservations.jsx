import React, { useState, useEffect } from 'react';

function ViewReservations() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Odabrani elementi
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Dohvati knjige, korisnike i rezervacije kad se komponenta učita
  useEffect(() => {
    // Dohvati knjige
    const fetchBooks = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/getbooks');
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || data);
        } else {
          console.error("Greška pri dohvaćanju knjiga:", res.status);
        }
      } catch (error) {
        console.error("Greška kod dohvaćanja knjiga:", error);
      }
    };

    // Dohvati korisnike
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || data);
        } else {
          console.error("Greška pri dohvaćanju korisnika:", res.status);
        }
      } catch (error) {
        console.error("Greška kod dohvaćanja korisnika:", error);
      }
    };

    // Dohvati rezervacije
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/reservations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setReservations(data.reservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchBooks();
    fetchUsers();
    fetchReservations();
  }, []);

  // Filtriraj rezervacije za odabranu knjigu
// Filtriraj rezervacije za odabranu knjigu, koristeći opcionalni chaining
const reservationsForBook = selectedBook 
  ? reservations.filter(r => r.book?. _id === selectedBook._id) 
  : [];

// Filtriraj rezervacije za odabranog korisnika, koristeći opcionalni chaining
const reservationsForUser = selectedUser 
  ? reservations.filter(r => r.user?. _id === selectedUser._id)
  : [];
  const reservationsForUserWithBook = reservationsForUser.filter(r => r.book);

  {reservationsForUserWithBook.map(r => (
    <li key={r.book._id || r._id} className="p-2">
      {r.book.title} – {r.book.author}
    </li>
  ))}
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Popis knjiga */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Popis knjiga</h2>
        <ul className="space-y-2 border border-gray-300 rounded-md p-4 h-[250px] overflow-y-auto">
          {books.length > 0 ? (
            books.map(book => (
              <li
                key={book._id || book.title}
                onClick={() => {
                  setSelectedBook(book);
                  setSelectedUser(null); // reset odabira korisnika ako se bira knjiga
                }}
                className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
                  selectedBook && selectedBook._id === book._id ? "bg-gray-300" : ""
                }`}
              >
                {book.title} – {book.author}
              </li>
            ))
          ) : (
            <p>Nema dostupnih knjiga.</p>
          )}
        </ul>
      </div>

      {/* Ako je odabrana knjiga, ispiši listu korisnika koji su ju rezervirali */}
      {selectedBook && (
        <div>
          <h3 className="text-xl font-semibold mt-4 mb-2">
            Korisnici koji su rezervirali: <span className="font-bold">{selectedBook.title}</span>
          </h3>
          {reservationsForBook.length > 0 ? (
            <ul className="space-y-2 border border-gray-300 rounded-md p-4">
              {reservationsForBook.map(r => (
                <li
                  key={r.user?._id || r._id}
                  onClick={() => setSelectedUser(r.user)}
                  className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
                    selectedUser && selectedUser._id === r.user?._id ? "bg-gray-300" : ""
                  }`}
                >
                  {r.user?.username || "Nepoznat korisnik"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="border border-gray-300 rounded-md p-4">Nema rezervacija za ovu knjigu.</p>
          )}
        </div>
      )}

      {/* Popis korisnika */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Popis korisnika</h2>
        <ul className="space-y-2 border border-gray-300 rounded-md p-4 h-[250px] overflow-y-auto">
          {users.length > 0 ? (
            users.map(user => (
              <li
                key={user._id || user.username}
                onClick={() => {
                  setSelectedUser(user);
                  setSelectedBook(null); // reset odabira knjige ako se bira korisnik
                }}
                className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
                  selectedUser && selectedUser._id === user._id ? "bg-gray-300" : ""
                }`}
              >
                {user.username}
              </li>
            ))
          ) : (
            <p>Nema dostupnih korisnika.</p>
          )}
        </ul>
      </div>

      {/* Ako je odabran korisnik, ispiši listu knjiga koje je rezervirao */}
      {selectedUser && (
        <div>
          <h3 className="text-xl font-semibold mt-4 mb-2">
            Knjige koje je rezervirao: <span className="font-bold">{selectedUser.username}</span>
          </h3>
          {reservationsForUserWithBook.length > 0 ? (
            <ul className="space-y-2 border border-gray-300 rounded-md p-4">
              {reservationsForUserWithBook.map(r => (
                <li key={r.book?._id || r._id} className="p-2">
                  {r.book?.title || "Nepoznata knjiga"} – {r.book?.author || "Nepoznat autor"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="border border-gray-300 rounded-md p-4">Ovaj korisnik nema rezervirane knjige.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewReservations;
