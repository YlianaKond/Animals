// src/pages/register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LogoutModal from '../components/logout-modal';
import ApiService from '../services/api';
import { validateField } from '../utils/validation';
import Text from "../components/Text";
import { Link } from "react-router-dom";

const Register = () => {
    const [activeForm, setActiveForm] = useState('register');
    const [formData, setFormData] = useState({
        register: {
            name: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false
        },
        login: {
            email: '',
            password: ''
        }
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Валидация формы регистрации
    const validateRegisterForm = () => {
        const newErrors = {};
        const { name, phone, email, password, confirmPassword, agreeTerms } = formData.register;

        // Имя
        const nameValidation = validateField('name', name);
        if (!name || !nameValidation.isValid) {
            newErrors.name = nameValidation.message || 'Введите ваше имя';
        }

        // Телефон
        const phoneValidation = validateField('phone', phone);
        if (!phone || !phoneValidation.isValid) {
            newErrors.phone = phoneValidation.message || 'Введите корректный номер телефона';
        }

        // Email
        const emailValidation = validateField('email', email);
        if (!email || !emailValidation.isValid) {
            newErrors.email = emailValidation.message || 'Введите корректный email';
        }

        // Пароль
        const passwordValidation = validateField('password', password);
        if (!password || !passwordValidation.isValid) {
            newErrors.password = passwordValidation.message || 'Введите корректный пароль';
        }

        // Подтверждение пароля
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        // Согласие с условиями
        if (!agreeTerms) {
            newErrors.agreeTerms = 'Необходимо согласие на обработку персональных данных';
        }

        return newErrors;
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateRegisterForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const userData = {
                name: formData.register.name,
                phone: formData.register.phone,
                email: formData.register.email,
                password: formData.register.password,
                password_confirmation: formData.register.confirmPassword,
                confirm: formData.register.agreeTerms 
            };

            // 1. Регистрация
            const response = await ApiService.register(userData);
            console.log('Ответ от регистрации:', response);

            if (response && !response.error) {
                // Сохраняем email
                const userEmail = formData.register.email;
                localStorage.setItem('user_email', userEmail);

                setSuccessMessage('Регистрация успешна! Выполняется вход...');

                // 2. Автоматический вход после регистрации
                setTimeout(async () => {
                    try {
                        const loginResult = await ApiService.login(
                            userEmail,
                            formData.register.password
                        );

                        if (loginResult && loginResult.data && loginResult.data.token) {
                            console.log('Автоматический вход выполнен');
                            // Данные пользователя будут получены на странице профиля
                            navigate('/profile');
                        }
                    } catch (loginError) {
                        console.error('Ошибка при автоматическом входе:', loginError);
                        setErrors({ login: 'Ошибка при автоматическом входе' });
                    }
                }, 1500);

            } else {
                setErrors({ general: response.error?.message || 'Ошибка при регистрации' });
            }

        } catch (error) {
            console.error('Registration error:', error);

            if (error.status === 422) {
                const serverErrors = error.data?.error?.errors || {};
                const formattedErrors = {};

                Object.keys(serverErrors).forEach(key => {
                    if (Array.isArray(serverErrors[key])) {
                        formattedErrors[key] = serverErrors[key][0];
                    } else {
                        formattedErrors[key] = serverErrors[key];
                    }
                });

                setErrors(formattedErrors);
            } else {
                setErrors({ general: 'Ошибка при подключении к серверу' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            // 1. Выполняем вход
            const result = await ApiService.login(
                formData.login.email,
                formData.login.password
            );

            if (result && result.data && result.data.token) {
                console.log('Вход выполнен, токен получен');

                // Сохраняем email (опционально, для отображения)
                localStorage.setItem('user_email', formData.login.email);

                // Данные пользователя будут получены на странице профиля
                // через запрос GET /users с токеном

                setSuccessMessage('Вход выполнен успешно!');
                setTimeout(() => {
                    navigate('/profile');
                }, 1000);

            } else {
                setErrors({ login: 'Ошибка при входе' });
            }

        } catch (error) {
            console.error('Login error:', error);

            if (error.status === 401 || error.status === 422) {
                setErrors({ login: 'Неверный email или пароль' });
            } else {
                setErrors({ login: 'Ошибка при подключении к серверу' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (formType, field, value) => {
        setFormData(prev => ({
            ...prev,
            [formType]: {
                ...prev[formType],
                [field]: value
            }
        }));

        // Очищаем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const renderPasswordRequirements = () => {
        const password = formData.register.password;

        const requirements = [
            { text: 'Минимум 7 символов, 1 цифра, 1 строчная и 1 заглавная буква' }
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

    return (
        <div>
            <Header isAuthenticated={false} />
            <div className="registration-container">
                <div className="card">
                    <div className="card-body p-4">
                        <br />
                        <Text value={'Регистрация'} />
                        <div className="text-center mt-3">
                            <p className="mb-0">
                                Уже есть аккаунт?{' '}
                                <Link to="/auth" className="text-decoration-none" style={{ display: 'inline-block' }}>
                                    Войти
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

                            {/* Форма регистрации */}
                            {activeForm === 'register' && (
                                <form id="registerForm" onSubmit={handleRegisterSubmit}>

                                    <div className="mb-3 required-field">
                                        <label htmlFor="regName" className="form-label ">Имя</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            id="regName"
                                            value={formData.register.name}
                                            onChange={(e) => handleInputChange('register', 'name', e.target.value)}
                                            //placeholder="Введите ваше имя"
                                            required
                                            disabled={loading}
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">
                                                {errors.name}
                                            </div>
                                        )}

                                    </div>

                                    <div className="mb-3 required-field">
                                        <label htmlFor="regPhone" className="form-label">Телефон</label>
                                        <input
                                            type="tel"
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            id="regPhone"
                                            value={formData.register.phone}
                                            onChange={(e) => handleInputChange('register', 'phone', e.target.value)}
                                            //placeholder="+7 (999) 999-99-99"
                                            required
                                            disabled={loading}
                                        />
                                        {errors.phone && (
                                            <div className="invalid-feedback">
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3 required-field">
                                        <label htmlFor="regEmail" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            id="regEmail"
                                            value={formData.register.email}
                                            onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                                            //placeholder="Введите ваш email"
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
                                        <label htmlFor="regPassword" className="form-label">Пароль</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            id="regPassword"
                                            value={formData.register.password}
                                            onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                                            //placeholder="Придумайте пароль"
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

                                    <div className="mb-3 required-field">
                                        <label htmlFor="regConfirmPassword" className="form-label">Подтверждение пароля</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            id="regConfirmPassword"
                                            value={formData.register.confirmPassword}
                                            onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)}
                                            //placeholder="Повторите пароль"
                                            required
                                            disabled={loading}
                                        />
                                        {errors.confirmPassword && (
                                            <div className="invalid-feedback">
                                                {errors.confirmPassword}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3 form-check">
                                        <div className="mb-3 form-check required-field">
                                            <input
                                                type="checkbox"
                                                className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                                                id="agreeTerms"
                                                checked={formData.register.agreeTerms}
                                                onChange={(e) => handleInputChange('register', 'agreeTerms', e.target.checked)}
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
                                                    Регистрация...
                                                </>
                                            ) : (
                                                <>
                                                    <small>Зарегистрироваться</small>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Форма входа */}
                            {activeForm === 'login' && (
                                <form id="loginForm" onSubmit={handleLoginSubmit}>
                                    {errors.login && (
                                        <div className="alert alert-danger" role="alert">
                                            {errors.login}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="loginEmail" className="form-label">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-envelope"></i>
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="loginEmail"
                                                value={formData.login.email}
                                                onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                                                //placeholder="Введите ваш email"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="loginPassword" className="form-label">Пароль</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-lock"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="loginPassword"
                                                value={formData.login.password}
                                                onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                                                placeholder="Введите ваш пароль"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="d-grid mb-3">
                                        <button
                                            type="submit"
                                            className="btn btn-success btn-lg button-css"
                                            style={{
                                                color: 'white'
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Регистрация...
                                                </>
                                            ) : (
                                                <>
                                                    <small>Зарегистрироваться</small>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <LogoutModal />
        </div>
    );
};

export default Register;