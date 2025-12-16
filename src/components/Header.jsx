// src/components/header.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import ApiService from '../services/api'; // Импортируем ApiService

const Header = ({ isAuthenticated = false, userName = "" }) => {
    const [userNameState, setUserNameState] = useState(userName);

    useEffect(() => {
        // Проверяем авторизацию по наличию токена
        const checkAuthAndGetName = () => {
            const token = localStorage.getItem('auth_token');
            const authenticated = !!token || isAuthenticated;

            if (authenticated) {
                // Пытаемся получить имя из пропсов
                if (userName && userName.trim() !== '') {
                    setUserNameState(userName);
                } else {
                    // Или из localStorage
                    const storedName = ApiService.getStoredUserName();
                    if (storedName && storedName.trim() !== '') {
                        setUserNameState(storedName);
                    } else {
                        // Или из user_data в localStorage
                        const userDataStr = localStorage.getItem('user_data');
                        if (userDataStr) {
                            try {
                                const userData = JSON.parse(userDataStr);
                                if (userData.name && userData.name.trim() !== '') {
                                    setUserNameState(userData.name);
                                }
                            } catch (error) {
                                console.error('Ошибка при чтении user_data:', error);
                            }
                        }
                    }
                }
            }
        };

        checkAuthAndGetName();
    }, [isAuthenticated, userName]);

    const authenticated = !!localStorage.getItem('auth_token') || isAuthenticated;

    return (
        <header>
            <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "rgb(91, 160, 74)" }}>
                <div className="container-fluid">
                    <Link to="/">
                        <img src={logo} alt="Логотип" width="100px" className="me-5" />
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"

                    >
                        <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link
                                    className="nav-link px-4"
                                    to="/"
                                    style={{ color: 'white' }}
                                >
                                    Главная
                                </Link>
                            </li>

                            {/* Показываем "Личный кабинет" только авторизованным пользователям */}
                            {authenticated && (
                                <li className="nav-item">
                                    <Link
                                        className="nav-link px-4"
                                        to="/profile"
                                        style={{ color: 'white' }}
                                    >
                                        Личный кабинет
                                    </Link>
                                </li>
                            )}

                            {/* Всегда показываем добавление объявления */}
                            <li className="nav-item">
                                <Link
                                    className="nav-link px-4"
                                    to="/add"
                                    style={{ color: 'white' }}
                                >
                                    Добавить объявление
                                </Link>
                            </li>

                            {/* Всегда показываем поиск */}
                            <li className="nav-item">
                                <Link
                                    className="nav-link px-4"
                                    to="/search"
                                    style={{ color: 'white' }}
                                >
                                    Поиск по объявлениям
                                </Link>
                            </li>
                        </ul>

                        {/* Правая часть хедера - кнопки или профиль */}
                        <div className="d-flex align-items-center">
                            {!authenticated ? (
                                // Кнопки для неавторизованных пользователей - всегда справа
                                <div className="d-flex align-items-center gap-3">
                                    <Link
                                        to="/auth"
                                        className="btn"
                                        style={{
                                            minWidth: '100px',
                                            transition: 'all 0.2s',
                                            backgroundColor: 'white',
                                            color: 'rgb(91, 160, 74)',
                                            border: '1px solid white'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                            e.target.style.color = 'rgb(91, 160, 74)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = 'rgb(91, 160, 74)';
                                        }}
                                        onMouseDown={(e) => {
                                            e.target.style.backgroundColor = '#e9ecef';
                                            e.target.style.color = 'rgb(91, 160, 74)';
                                        }}
                                        onMouseUp={(e) => {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                            e.target.style.color = 'rgb(91, 160, 74)';
                                        }}
                                    >
                                        Войти
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn"
                                        style={{
                                            minWidth: '140px',
                                            transition: 'all 0.2s',
                                            backgroundColor: 'rgb(91, 160, 74)',
                                            color: 'white',
                                            border: '1px solid white'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = 'rgb(66, 124, 51)';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'rgb(91, 160, 74)';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseDown={(e) => {
                                            e.target.style.backgroundColor = 'rgb(56, 104, 41)';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseUp={(e) => {
                                            e.target.style.backgroundColor = 'rgb(66, 124, 51)';
                                            e.target.style.color = 'white';
                                        }}
                                    >
                                        Регистрация
                                    </Link>
                                </div>
                            ) : (
                                // Dropdown для авторизованного пользователя - справа
                                <div className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle d-flex align-items-center"
                                        href="#"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        style={{ color: 'white' }}
                                    >
                                        <i className="bi bi-person-circle me-2"></i>
                                        {userNameState || "Пользователь"}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <Link
                                                className="dropdown-item"
                                                to="/profile"
                                                style={{
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = 'rgb(91, 160, 74)';
                                                    e.target.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = '';
                                                    e.target.style.color = '';
                                                }}
                                            >
                                                Личный кабинет
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <a
                                                className="dropdown-item"
                                                href="/"
                                                data-bs-toggle="modal"
                                                data-bs-target="#logoutModal"
                                                style={{
                                                    transition: 'background-color 0.2s, color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = 'rgb(220, 53, 69)';
                                                    e.target.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = '';
                                                    e.target.style.color = 'rgb(220, 53, 69)';
                                                }}
                                            >
                                                Выйти
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;