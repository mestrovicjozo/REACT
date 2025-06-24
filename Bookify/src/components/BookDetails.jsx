import React from 'react';

function BookDetails({ book }) {
  if (!book) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Nema dostupnih detalja za ovu knjigu.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-full h-96 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <p className="text-lg text-gray-700 mb-2">
        <span className="font-medium">Author:</span> {book.author}
      </p>
      <p className="text-lg text-gray-700 mb-2">
        <span className="font-medium">Genre:</span> {book.genre}
      </p>
      <p className="text-lg text-gray-700 mb-2">
        <span className="font-medium">Published Year:</span> {book.publishedYear}
      </p>
      <p className="text-lg text-gray-700 mb-2">
        <span className="font-medium">Available Copies:</span> {book.availableCopies}
      </p>
      <p className="text-lg text-gray-700 mb-2">
        <span className="font-medium">Total Copies:</span> {book.totalCopies}
      </p>
    </div>
  );
}

export default BookDetails;
