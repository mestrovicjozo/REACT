import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function Profile({ userId, onBack}) {
  const [user, setUser] = useState(null);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBookId, setPendingBookId] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .catch((err) => console.error('Error fetching user:', err));
  }, [userId]);

  const handleReturn = async (bookId) => {
    setPendingBookId(bookId);
    setShowConfirm(true);
  };

  const confirmReturn = async () => {
    setShowConfirm(false);
    setLoadingReturn(true);
    try {
      const res = await fetch(`http://localhost:3000/api/return/${pendingBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast.error("Greška pri vraćanju knjige: " + (errorData.error || ''));
      } else {
        toast.success("Knjiga uspješno vraćena!");
        const updatedRes = await fetch(`http://localhost:3000/api/users/${userId}`);
        const updatedData = await updatedRes.json();
        setUser(updatedData.user);
      }
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Došlo je do greške kod vraćanja knjige.");
    } finally {
      setLoadingReturn(false);
      setPendingBookId(null);
    }
  };

  const cancelReturn = () => {
    setShowConfirm(false);
    setPendingBookId(null);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center rounded-md py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
      >
        Back to Home
      </button>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Profile</h1>
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Your Reserved Books</h2>
      {user.rentedBooks && user.rentedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {user.rentedBooks.map((book) => (
            <div key={book._id} className="bg-white rounded-lg shadow p-3 sm:p-4">
              {book.imageUrl && (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-40 sm:h-48 object-cover rounded mb-3 sm:mb-4"
                />
              )}
              <h3 className="text-lg sm:text-xl font-semibold line-clamp-2">{book.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">By {book.author}</p>
              <button
                onClick={() => handleReturn(book._id)}
                className="mt-3 sm:mt-4 w-full sm:w-auto bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loadingReturn}
              >
                {loadingReturn ? "Vraćam..." : "Vrati"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">You currently have no reserved books.</p>
      )}
      {/* Modal za potvrdu */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Jeste li sigurni da želite vratiti ovu knjigu?</h2>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={confirmReturn}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 focus:outline-none"
              >
                Potvrdi
              </button>
              <button
                onClick={cancelReturn}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 focus:outline-none"
              >
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
