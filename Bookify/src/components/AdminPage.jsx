import React, { useState } from 'react';
import BookForm from './BookForm';
import BookUpdate from './BookUpdate';
import loginImage from '../assets/login.jpg';
import ViewReservations from './ViewReservations';
function AdminPage({ onLogout }) {
  const [showBookForm, setShowBookForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);


  const toggleBookForm = () => {
    setShowBookForm(!showBookForm);
  };
  const toggleUpdateForm = () => {
    setShowUpdateForm(!showUpdateForm);
  };
  const toggleReservationForm = () => {
    setShowReservationForm(!showReservationForm);
  };
  return (
    <div>
      <img
        alt="Background"
        src={loginImage}
        className="rounded-lg shadow-xl -z-40 absolute w-320 h-full opacity-20"
      />
      <div className="relative p-8">
        <div className="absolute top-4 right-4">
          <button
            onClick={onLogout}
            className="cursor-pointer justify-center rounded-md py-2 px-4 bg-indigo-600 text-sm font-medium text-white shadow-sm inline-flex border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Log out
          </button>
        </div>

        <h1 className="text-6xl mb-4">Administratura</h1>

        <div className="mb-4 mt-22">
          <button
            onClick={toggleBookForm}
            className="cursor-pointer justify-center rounded-md py-2 px-4 bg-green-600 text-sm font-medium text-white shadow-sm inline-flex border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showBookForm ? 'Zatvori' : 'Dodajte knjigu'}
          </button>
        </div>

        {/* Uvjetno renderiranje BookForm komponente */}
        {showBookForm && <BookForm />}

        <div className="mb-4 mt-32">
          <button
            onClick={toggleUpdateForm}
            className="cursor-pointer justify-center rounded-md py-2 px-4 bg-green-600 text-sm font-medium text-white shadow-sm inline-flex border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showUpdateForm ? 'Zatvori' : 'Uredite knjigu'}
          </button>
        </div>

        {/* Uvjetno renderiranje BookForm komponente */}
        {showUpdateForm && <BookUpdate />}
        
      </div>
      <div className="mb-4 mt-18">
          <button
            onClick={toggleReservationForm}
            className="cursor-pointer justify-center rounded-md py-2 px-4 bg-green-600 text-sm font-medium text-white shadow-sm inline-flex border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showReservationForm ? 'Zatvori' : 'Sva Zaduženja'}
          </button>
        </div>

        {/* Uvjetno renderiranje BookForm komponente */}
        {showReservationForm && <ViewReservations />}
    </div>
  );
}

export default AdminPage;
