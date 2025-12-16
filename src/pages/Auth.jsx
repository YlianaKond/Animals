// src/pages/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LogoutModal from '../components/logout-modal';
import ApiService from '../services/api';
import AuthService from '../services/AuthService';
import { validateField } from '../utils/validation';
import Text from "../components/Text";
import { Link } from "react-router-dom";

const Auth = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        agreeTerms: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const validateLoginForm = () => {
        const newErrors = {};
        const { email, password, confirmPassword, agreeTerms } = formData;

        // Email
        const emailValidation = validateField('email', email);
        if (!email || !emailValidation.isValid) {
            newErrors.email = emailValidation.message || 'Введите корректный email';
        }

        // Пароль
        if (!password) {
            newErrors.password = 'Введите пароль';
        }

        // Согласие с условиями
        if (!agreeTerms) {
            newErrors.agreeTerms = 'Необходимо согласие на обработку персональных данных';
        }

        return newErrors;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateLoginForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            // 1. Выполняем вход через API
            const result = await ApiService.login(
                formData.email,
                formData.password
            );

            console.log('Результат входа:', result);

            if (result && result.data && result.data.token) {
                // 2. Сохраняем данные через AuthService
                AuthService.login(result.data.token, result.data.user || {
                    email: formData.email,
                    id: result.data.user_id || result.data.id
                });

                console.log('AuthService: данные сохранены');
                console.log('Токен:', AuthService.getToken());
                console.log('Данные пользователя:', AuthService.getUserData());

                setSuccessMessage('Вход выполнен успешно! Перенаправление...');

                // 3. Редирект на профиль через 1 секунду
                setTimeout(() => {
                    navigate('/profile');
                }, 1000);

            } else {
                // Проверяем разные форматы ответов
                if (result && result.token) {
                    // Если токен в корне объекта
                    AuthService.login(result.token, result.user || { email: formData.email });
                    setSuccessMessage('Вход выполнен успешно! Перенаправление...');
                    setTimeout(() => {
                        navigate('/profile');
                    }, 1000);
                } else {
                    setErrors({ general: 'Не удалось получить токен авторизации' });
                }
            }

        } catch (error) {
            console.error('Login error:', error);

            if (error.status === 401 || error.status === 422) {
                setErrors({ general: 'Неверный email или пароль' });
            } else if (error.message === 'Network Error') {
                setErrors({ general: 'Ошибка подключения к серверу' });
            } else {
                setErrors({ general: 'Ошибка при входе в систему' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Очищаем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        if (errors.general) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.general;
                return newErrors;
            });
        }
    };

    const handleCheckboxChange = (field, checked) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }));

        // Очищаем ошибку при изменении чекбокса
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Функция для отображения требований к паролю (как в register)
    const renderPasswordRequirements = () => {
        const password = formData.password;
        const requirements = [

        ];

        return (
            <div className="password-requirements mt-2">
                {requirements.map((req, index) => (
                    <div key={index} className={`requirement ${req.met ? 'met' : 'unmet'}`}>
                        <i className={`bi ${req.met ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span>{req.text}</span>
                    </div>
                ))}
            </div>
        );
    };

    // Проверяем, не авторизован ли пользователь уже
    useEffect(() => {
        const isAuth = AuthService.isAuthenticated();
        if (isAuth) {
            console.log('Пользователь уже авторизован, перенаправление на профиль');
            navigate('/profile');
        }
    }, [navigate]);

    return (
        <div>
            <Header isAuthenticated={false} />
            <div className="registration-container">
                <div className="card">
                    <div className="card-body p-4">
                        <br />
                        <Text value={'Вход'} />

                        <div className="text-center mt-3">
                            <p className="mb-0">
                                Еще нет аккаунта?{' '}
                                <Link to="/register" className="text-decoration-none" style={{ display: 'inline-block' }}>
                                    Зарегистрироваться
                                </Link>
                            </p>
                        </div>

                        <div className="card-body p-4">
                            {/* Сообщения об ошибках и успехе */}
                            {errors.general && (
                                <div className="alert alert-danger" role="alert">
                                    {errors.general}
                                </div>
                            )}

                            {successMessage && (
                                <div className="alert alert-success" role="alert">
                                    {successMessage}
                                </div>
                            )}

                            {/* Форма входа */}
                            <form id="loginForm" onSubmit={handleLoginSubmit}>
                                <div className="mb-3 required-field">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}

                                        required
                                        disabled={loading}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3 required-field">
                                    <label htmlFor="password" className="form-label">Пароль</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}

                                        required
                                        minLength="7"
                                        disabled={loading}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">
                                            {errors.password}
                                        </div>
                                    )}
                                    <div className="form-text">
                                        {renderPasswordRequirements()}
                                    </div>
                                </div>

                                {/* Чекбокс согласия с условиями */}
                                <div className="mb-3 form-check">
                                    <div className="mb-3 form-check required-field">
                                        <input
                                            type="checkbox"
                                            className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                                            id="agreeTerms"
                                            checked={formData.agreeTerms}
                                            onChange={(e) => handleCheckboxChange('agreeTerms', e.target.checked)}
                                            required
                                            disabled={loading}
                                        />
                                        <div id="confirmError" className="invalid-feedback">Необходимо согласиться.</div>
                                        Я согласен с <a href="#" className="text-decoration-none">условиями использования</a> и{' '}
                                        <a href="#" className="text-decoration-none">политикой конфиденциальности</a>

                                    </div>
                                    {errors.agreeTerms && (
                                        <div className="invalid-feedback">
                                            {errors.agreeTerms}
                                        </div>
                                    )}


                                </div>


                                <div className="d-grid mb-3">
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-lg button-css"
                                        disabled={loading}
                                        style={{
                                            color: 'white'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Вход...
                                            </>
                                        ) : (
                                            <small>Войти в личный кабинет</small>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
            <div className="footer2">
                <Footer />
            </div>
            <LogoutModal />
        </div>
    );
};

export default Auth;