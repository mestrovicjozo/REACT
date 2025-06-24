import React, { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

function BookForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [availableCopies, setAvailableCopies] = useState('1');
  const [totalCopies, setTotalCopies] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    // Opcionalno: kreiranje previewa slike
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kreiraj FormData objekt i dodaj sve potrebne podatke
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('genre', genre);
    formData.append('publishedYear', publishedYear);
    formData.append('availableCopies', availableCopies);
    formData.append('totalCopies', totalCopies);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Knjiga dodana:', data);
    } catch (err) {
      console.error('Greška:', err);
    }
  };

  // Funkcija za resetiranje svih polja forme
  const handleRefresh = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
    setPublishedYear('');
    setAvailableCopies('1');
    setTotalCopies('');
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <div className="mx-auto bg-white rounded-lg shadow-lg max-w-3xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
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
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 rounded-md"
            id="title"
          />
        </div>
        {/* Author */}
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
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 rounded-md"
            id="author"
          />
        </div>
        {/* Genre */}
        <div className="mb-4">
          <label htmlFor="genre" className="text-gray-700 font-medium mb-2 block">
            Genre
          </label>
          <input
            name="genre"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 rounded-md"
            id="genre"
          />
        </div>
        {/* Published Year */}
        <div className="mb-4">
          <label htmlFor="publishedYear" className="text-gray-700 font-medium mb-2 block">
            Published Year
          </label>
          <input
            name="publishedYear"
            type="number"
            value={publishedYear}
            onChange={(e) => setPublishedYear(e.target.value)}
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 rounded-md"
            id="publishedYear"
          />
        </div>
        {/* Available Copies */}
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
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 rounded-md"
            id="availableCopies"
          />
        </div>
        {/* Total Copies */}
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
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 rounded-md"
            id="totalCopies"
          />
        </div>
        {/* Input za upload slike */}
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
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 rounded-md"
          />
        </div>
        {/* Opcionalni preview slike */}
        {imagePreview && (
          <div className="mb-4">
            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
          </div>
        )}
        <div className="mt-6">
          <button
            type="submit"
            className="hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
      {/* Refresh button s ikonicom */}
      <button 
        type="button" 
        onClick={handleRefresh} 
        className="flex items-center justify-center mt-4 text-blue-600 hover:text-blue-800"
      >
        <FiRefreshCw size={24} className="mr-2" />
        <span>Clear Fields</span>
      </button>
    </div>
  );
}

export default BookForm;
