
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Main from './pages/Main';
import SearchPage from './pages/search-page';
import Profile from './pages/profile';
import Register from './pages/register';
import Auth from './pages/Auth';
import Addob from './pages/addob';
import PetDetails from './pages/pet-details';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css';

// Компонент для проверки авторизации
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('auth_token');
    console.log('PrivateRoute: токен =', token ? 'ЕСТЬ' : 'НЕТ');

    if (!token) {
        console.log('PrivateRoute: нет токена, редирект на /register');
        return <Navigate to="/register" />;
    }

    return children;
};

function App() {
    return (
        <div className="App" style={{ "backgroundColor": "rgba(247, 247, 247, 1)" }}>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pet/:id" element={<PetDetails />} />
                <Route path="/add" element={<Addob />} />

                {/* Защищенный маршрут для профиля */}
                <Route path="/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />

                {/* Резервный маршрут */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;