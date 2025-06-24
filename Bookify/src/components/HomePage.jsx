import { React, useState, useEffect } from 'react'
import BookDetails from './BookDetails';
import Preuzmi from '../assets/preuzmi.jpg'
import ZenaCita from '../assets/chatCitanje.png'
import { toast } from 'react-toastify';

function HomePage({ onLogout, onShowProfile, refreshFlag }) {
  const [allBooks, setAllBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);


  const refreshBooks = () => {
    fetch('http://localhost:3000/api/getbooks')
      .then((res) => res.json())
      .then((data) => {
        setAllBooks(data.books);
      })
      .catch((err) => console.error('Greška pri dohvaćanju knjiga:', err));
  };

  useEffect(() => {
    // Dohvati sve knjige sa servera
    fetch('http://localhost:3000/api/getbooks')
      .then((res) => res.json())
      .then((data) => {
        // Pretpostavljamo da API vraća objekat sa ključem "books"
        setAllBooks(data.books);
      })
      .catch((err) => console.error('Greška pri dohvaćanju knjiga:', err));
  }, []);

  // Ako nema unesenog teksta, filteredBooks postavlja se na prazan niz
  const filteredBooks = searchQuery.trim()
    ? allBooks.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user')
    onLogout();
  };


  const displayedBooks = searchQuery.trim()
    ? allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
        book.availableCopies > 0
    )
    : [...allBooks]
      .filter((book) => book.availableCopies > 0)
      .sort((a, b) => a.availableCopies - b.availableCopies)
      .slice(0, 4);

      const handleRentNow = async (bookId) => {
        console.log("Book ID being sent to rent:", bookId);
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          toast.error("Molimo logirajte se ponovo.");
          return;
        }
        const user = JSON.parse(storedUser);
        const userId = user._id;
        console.log("Book ID being sent:", bookId);
        try {
          const response = await fetch('http://localhost:3000/api/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, bookId: bookId }),
          });
      
          const text = await response.text();
          console.log("Sirovi odgovor:", text);
          const data = JSON.parse(text);
          
          if (response.ok) {
            toast.success("Knjiga uspješno posuđena!");
            refreshBooks();
          } else {
            toast.error("Greška pri posudbi: " + data.error);
          }
        } catch (err) {
          console.error("Greška prilikom posudbe:", err);
          toast.error("Došlo je do greške na serveru.");
        }
      };
  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="justify-between items-center h-16 flex flex-col sm:flex-row py-2 sm:py-0">
            <div className="items-center flex mb-2 sm:mb-0">
              <a href="#" className="text-indigo-600 font-bold text-xl">Bookify</a>
            </div>
            <div className="items-center flex space-x-4">
              <div
                onClick={() => onShowProfile(refreshFlag)}
                className="justify-center rounded-md py-2 px-4 bg-green-600 text-sm font-medium text-white shadow-sm
                inline-flex border border-green-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:ring-offset-2 cursor-pointer"
              >
                <span>My Profile</span>
              </div>
              <div
                onClick={handleLogout}
                className="cursor-pointer justify-center rounded-md py-2 px-4 bg-indigo-600 text-sm font-medium text-white shadow-sm inline-flex border border-green-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span>Log out</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className="bg-indigo-50 relative">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 md:py-24 py-16 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
              <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight text-center">
                Read More, Own Less
              </p>
              <p className="mt-5 text-lg sm:text-xl text-gray-500 text-center">
                Discover thousands of books...
              </p>
              <div className="mt-8 max-w-xl w-full flex justify-center">
                <div className="mb-4 w-full">
                  <input
                    type="text"
                    placeholder="Pretraži po naslovu..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDetails(false);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="justify-center flex mt-8 md:mt-0">
              <img
                alt="Woman reading a book in a comfortable chair"
                src={ZenaCita}
                className="rounded-lg shadow-xl w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="lg:text-center">
            <p className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Featured Books</p>
            <p className="mt-2 text-2xl sm:text-3xl md:text-4xl leading-8 font-extrabold tracking-tight text-gray-900">Hurry before they rent out!</p>
            <p className="mt-4 text-lg sm:text-xl text-gray-500 lg:mx-auto max-w-2xl">Explore our most popular rentals chosen by thousands of readers.</p>
          </div>
          
          {displayedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-8">
              {displayedBooks.map((book, index) => (
                <div
                  key={book._id ? `${book._id}-${index}` : index}
                  className="bg-white rounded-lg shadow-md group relative overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  <div className="h-48 sm:h-56 w-full">
                    <img
                      alt={book.title}
                      src={book.imageUrl ? book.imageUrl : Preuzmi}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg sm:text-xl font-semibold line-clamp-2">{book.title}</h2>
                    <p className="text-gray-600 text-sm sm:text-base">By {book.author}</p>
                    <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <p className="text-base sm:text-lg font-bold text-indigo-600">
                        Available: {book.availableCopies}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRentNow(book._id)}
                        className="w-full sm:w-auto inline-flex justify-center border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md py-2 px-3 bg-indigo-600 text-sm font-medium text-white shadow-sm"
                      >
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-8">
              {searchQuery.trim() ? "Nema pronađenih knjiga." : "Nema knjiga za prikaz."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage
