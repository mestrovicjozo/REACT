import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

function BookUpdate() {
  // State za sve knjige
  const [allBooks, setAllBooks] = useState([]);
  // State za odabranu knjigu kojom se uređuje
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State za polja update forme
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [availableCopies, setAvailableCopies] = useState('');
  const [totalCopies, setTotalCopies] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Dohvati sve knjige prilikom učitavanja komponente
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/getbooks');
        if (res.ok) {
          const data = await res.json();
          const books = data.books || data;
          // Sortiraj abecedno prema naslovu
          const sortedBooks = books.sort((a, b) => a.title.localeCompare(b.title));
          setAllBooks(sortedBooks);
        } else {
          console.error("Neuspješno dohvaćanje knjiga:", res.status);
        }
      } catch (err) {
        console.error('Greška pri dohvaćanju svih knjiga:', err);
      }
    };

    fetchAllBooks();
  }, []);

  // Postavi knjigu u formu za uređivanje kada se klikne "Edit"
  const handleEdit = (book) => {
    setSelectedBook(book);
    setIsEditing(true);
    setTitle(book.title || '');
    setAuthor(book.author || '');
    setGenre(book.genre || '');
    setPublishedYear(book.publishedYear || '');
    setAvailableCopies(book.availableCopies || '');
    setTotalCopies(book.totalCopies || '');
    setImagePreview(book.imageUrl || null);
  };

  // Update knjige (PUT zahtjev)
  const handleUpdate = async (e) => {
    e.preventDefault();

    const bookDetails = {
      title,
      author,
      genre,
      publishedYear,
      availableCopies,
      totalCopies,
      // Ako postoji logika za upload slike, ovdje ju dodaj
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/title/${encodeURIComponent(selectedBook.title)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookDetails),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = { error: 'Nepoznata greška' };
        }
        toast.error("Greška pri ažuriranju knjige: " + (errorData.error || ''));
        return;
      }
      toast.success("Knjiga uspješno ažurirana!");
      window.location.reload();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Došlo je do greške kod ažuriranja.');
    }
  };

  // Funkcija za delete – šalje DELETE zahtjev za brisanje knjige
  const handleDelete = async () => {
    if (!selectedBook) return;

    if (!window.confirm(`Jesi li siguran/a da želiš obrisati knjigu "${selectedBook.title}"?`))
      return;

    try {
      const response = await fetch(`http://localhost:3000/api/delete/${encodeURIComponent(selectedBook.title)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = { error: 'Nepoznata greška' };
        }
        toast.error("Greška pri brisanju knjige: " + (errorData.error || ''));
        return;
      }
      toast.success("Knjiga uspješno obrisana!");
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Došlo je do greške kod brisanja.');
    }
  };

  // Funkcija za upload slike (postavlja preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Resetiraj formu i poništi odabir knjige
  const clearFields = () => {
    setSelectedBook(null);
    setIsEditing(false);
    setTitle('');
    setAuthor('');
    setGenre('');
    setPublishedYear('');
    setAvailableCopies('');
    setTotalCopies('');
    setImagePreview(null);
    setSelectedImage(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Popis svih knjiga u scrollable prozoru */}
      <div>
        <h2 className="text-xl font-bold mb-2">Sve knjige</h2>
        <div className="h-[320px] overflow-y-auto border border-gray-300 rounded-md p-4">
          {allBooks.length > 0 ? (
            <ul className="space-y-2">
              {allBooks.map((book) => (
                <li
                  key={book._id || book.title}
                  className="p-2 border-b border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{book.title}</span> – {book.author}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        handleDelete();
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nema knjiga za prikaz.</p>
          )}
        </div>
      </div>

      {/* Update forma za uređivanje odabrane knjige */}
      {isEditing && selectedBook && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Uredi detalje knjige</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="mb-4">
              <label htmlFor="title" className="text-gray-700 font-medium mb-2 block">
                Title
              </label>
              <input
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-gray-300 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="title"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="author" className="text-gray-700 font-medium mb-2 block">
                Author
              </label>
              <input
                name="author"
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border border-gray-300 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="author"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="genre" className="text-gray-700 font-medium mb-2 block">
                Genre
              </label>
              <input
                name="genre"
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="border border-gray-300 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="genre"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="publishedYear" className="text-gray-700 font-medium mb-2 block">
                Published Year
              </label>
              <input
                name="publishedYear"
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className="border border-gray-300 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="publishedYear"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="availableCopies" className="text-gray-700 font-medium mb-2 block">
                Available Copies
              </label>
              <input
                name="availableCopies"
                type="number"
                required
                value={availableCopies}
                onChange={(e) => setAvailableCopies(e.target.value)}
                className="border border-gray-300 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="availableCopies"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="totalCopies" className="text-gray-700 font-medium mb-2 block">
                Total Copies
              </label>
              <input
                name="totalCopies"
                type="number"
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
                className="border border-gray-300 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="totalCopies"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="imageUrl" className="text-gray-700 font-medium mb-2 block">
                Upload Image
              </label>
              <input
                name="imageUrl"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="imageUrl"
                className="border border-gray-300 w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {imagePreview && (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
            <div className="mt-6">
              <button
                type="submit"
                className="hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md"
              >
                Update
              </button>
            </div>
          </form>
          <button
            type="button"
            onClick={clearFields}
            className="flex items-center justify-center mt-4 text-blue-600 hover:text-blue-800"
          >
            <FiRefreshCw size={24} className="mr-2" />
            <span>Clear Fields</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default BookUpdate;
