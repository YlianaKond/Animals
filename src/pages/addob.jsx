import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LogoutModal from '../components/logout-modal';
import ApiService from '../services/api';
import AuthService from '../services/AuthService';
import { validateField } from '../utils/validation';
import Text from '../components/Text';

const Addob = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [formData, setFormData] = useState({
        petType: '',
        petDescription: '',
        mark: '',
        petLocation: '',
        name: '',
        phone: '',
        email: '',
        register: false,
        password: '',
        password_confirmation: '',
        confirm: false
    });
    const [images, setImages] = useState([null, null, null]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [districts] = useState([
        'Адмиралтейский район',
        'Василеостровский район',
        'Выборгский район',
        'Калининский район',
        'Кировский район',
        'Колпинский район',
        'Красногвардейский район',
        'Красносельский район',
        'Кронштадтский район',
        'Курортный район',
        'Московский район',
        'Невский район',
        'Петроградский район',
        'Петродворцовый район',
        'Приморский район',
        'Пушкинский район',
        'Фрунзенский район',
        'Центральный район'
    ]);

    // Добавлены новые состояния из кода 2
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        digit: false
    });

    // Проверка авторизации и загрузка данных пользователя
    useEffect(() => {
        const checkAuthAndLoadData = () => {
            const authStatus = AuthService.isAuthenticated();
            setIsAuthenticated(authStatus);

            if (authStatus) {
                const userData = AuthService.getUserData();
                if (userData) {
                    const cleanName = userData.name ? userData.name.replace(/[^А-Яа-яЁё\s-]/g, '') : '';
                    setUserName(userData.name || '');
                    setFormData(prev => ({
                        ...prev,
                        name: cleanName || userData.name || '',
                        phone: userData.phone || '',
                        email: userData.email || '',
                        // Для авторизованных автоматически включаем "сохранение в личном кабинете"
                        register: true
                    }));
                }
            }
        };

        checkAuthAndLoadData();

        window.addEventListener('authChange', checkAuthAndLoadData);
        window.addEventListener('userDataUpdate', checkAuthAndLoadData);

        return () => {
            window.removeEventListener('authChange', checkAuthAndLoadData);
            window.removeEventListener('userDataUpdate', checkAuthAndLoadData);
        };
    }, []);

    // Проверка требований к паролю при изменении
    useEffect(() => {
        if (formData.password) {
            const newRequirements = {
                length: formData.password.length >= 7,
                lowercase: /[a-z]/.test(formData.password),
                uppercase: /[A-Z]/.test(formData.password),
                digit: /\d/.test(formData.password)
            };
            setPasswordRequirements(newRequirements);
        }
    }, [formData.password]);

    // Валидация имени с поддержкой автозаполнения
    const validateName = (name, isAutoFilled = false) => {
        if (!name.trim()) return false;
        if (isAutoFilled) return true;
        return /^[А-Яа-яЁё\s-]+$/.test(name);
    };

    // Валидация телефона
    const validatePhone = (phone) => /^\+?[0-9\s\-()]+$/.test(phone);

    // Валидация пароля
    const validatePassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/.test(pwd);

    // Валидация формы (улучшенная версия с кодом 2)
    const validateForm = () => {
        const newErrors = {};

        // Проверка обязательных полей
        if (!formData.petType.trim()) {
            newErrors.petType = 'Укажите вид животного';
        }

        if (!formData.petDescription.trim()) {
            newErrors.petDescription = 'Введите описание';
        } else if (formData.petDescription.length < 10 || formData.petDescription.length > 500) {
            newErrors.petDescription = 'Описание должно содержать от 10 до 500 символов';
        }

        if (!formData.petLocation) {
            newErrors.petLocation = 'Выберите район';
        }

        if (!images[0]) {
            newErrors.photo1 = 'Добавьте хотя бы одну фотографию';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Введите ваше имя';
        } else if (!validateName(formData.name, isAuthenticated)) {
            if (isAuthenticated) {
                newErrors.name = 'Имя содержит некириллические символы. Рекомендуется исправить.';
            } else {
                newErrors.name = 'Имя должно содержать только кириллицу, пробелы и дефисы';
            }
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Введите телефон';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Телефон должен содержать только цифры';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Введите email';
        } else {
            const emailValidation = validateField('email', formData.email);
            if (!emailValidation.isValid) {
                newErrors.email = emailValidation.message;
            }
        }

        // Валидация клейма (если заполнено)
        if (formData.mark.trim() && !/^[A-Za-z0-9-]+$/.test(formData.mark)) {
            newErrors.mark = 'Номер клейма/чипа может содержать только латинские буквы, цифры и дефисы';
        }

        // Валидация пароля ТОЛЬКО для НЕавторизованных пользователей С регистрацией
        if (!isAuthenticated && formData.register) {
            if (!formData.password.trim()) {
                newErrors.password = 'Введите пароль';
            } else if (!validatePassword(formData.password)) {
                newErrors.password = 'Пароль должен содержать минимум 7 символов, включая 1 цифру, 1 строчную и 1 заглавную букву';
            }

            if (!formData.password_confirmation.trim()) {
                newErrors.password_confirmation = 'Подтвердите пароль';
            } else if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Пароли не совпадают';
            }
        }

        // Валидация пароля для авторизованных пользователей с регистрацией
        if (isAuthenticated && formData.register) {
            if (!formData.password.trim()) {
                newErrors.password = 'Введите пароль для подтверждения';
            }
        }

        // Согласие на обработку данных
        if (!formData.confirm) {
            newErrors.confirm = 'Необходимо согласие на обработку персональных данных';
        }

        return newErrors;
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
    };

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];

        if (!file) return;

        // Проверяем формат файла (только PNG)
        if (file.type !== 'image/png') {
            setErrors(prev => ({
                ...prev,
                [`photo${index + 1}`]: 'Формат файла должен быть PNG'
            }));
            return;
        }

        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                [`photo${index + 1}`]: 'Размер файла не должен превышать 5MB'
            }));
            return;
        }

        const newImages = [...images];
        newImages[index] = file;
        setImages(newImages);

        // Создаем превью
        const reader = new FileReader();
        reader.onload = (e) => {
            const newPreviews = [...imagePreviews];
            newPreviews[index] = e.target.result;
            setImagePreviews(newPreviews);
        };
        reader.readAsDataURL(file);

        // Очищаем ошибку
        if (errors[`photo${index + 1}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`photo${index + 1}`];
                return newErrors;
            });
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        newPreviews[index] = null;
        setImagePreviews(newPreviews);
    };

    // Функция регистрации пользователя из кода 2
    const registerUser = async (userData) => {
        try {
            const response = await ApiService.register({
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                password: userData.password,
                password_confirmation: userData.password_confirmation,
                confirm: 1
            });

            if (response && response.data) {
                return { success: true, data: response.data };
            } else {
                let errorMessage = 'Ошибка регистрации';

                if (response.error?.errors) {
                    const serverErrors = response.error.errors;
                    for (const field in serverErrors) {
                        if (serverErrors[field] && serverErrors[field][0]) {
                            errorMessage = serverErrors[field][0];
                            break;
                        }
                    }
                } else if (response.error?.message) {
                    errorMessage = response.error.message;
                }

                return {
                    success: false,
                    error: errorMessage,
                    errors: response.error?.errors || {}
                };
            }
        } catch (error) {
            console.error('Ошибка при регистрации пользователя:', error);
            return { success: false, error: 'Сетевая ошибка' };
        }
    };

    // Функция входа пользователя из кода 2
    const loginUser = async (email, password) => {
        try {
            const response = await ApiService.login(email, password);

            if (response && response.data && response.data.token) {
                return {
                    success: true,
                    token: response.data.token,
                    userData: response.data
                };
            } else {
                const errorMsg = response?.error?.message || 'Ошибка входа';
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            return { success: false, error: 'Сетевая ошибка' };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            let userToken = null;
            let isNewRegistration = false;

            // Логика регистрации/входа из кода 2
            if (formData.register) {
                if (!isAuthenticated) {
                    // Попытка регистрации нового пользователя
                    const registrationResult = await registerUser({
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        password: formData.password,
                        password_confirmation: formData.password_confirmation
                    });

                    if (!registrationResult.success) {
                        // Если email уже занят, пробуем войти
                        if (registrationResult.error.includes('email has already been taken') ||
                            registrationResult.error.includes('email уже занят')) {

                            const loginResult = await loginUser(formData.email, formData.password);

                            if (loginResult.success) {
                                userToken = loginResult.token;
                                AuthService.login(userToken, {
                                    email: formData.email,
                                    name: formData.name,
                                    phone: formData.phone,
                                    id: loginResult.userData?.id
                                });
                            } else {
                                setErrors({ password: 'Введите правильный пароль для этого аккаунта' });
                                setLoading(false);
                                return;
                            }
                        } else {
                            setErrors({ general: `Ошибка регистрации: ${registrationResult.error}` });
                            setLoading(false);
                            return;
                        }
                    } else {
                        // Регистрация успешна, пробуем войти
                        const loginResult = await loginUser(formData.email, formData.password);

                        if (loginResult.success) {
                            userToken = loginResult.token;
                            AuthService.login(userToken, {
                                email: formData.email,
                                name: formData.name,
                                phone: formData.phone,
                                id: loginResult.userData?.id
                            });

                            isNewRegistration = true;
                        } else {
                            setErrors({ general: `Регистрация прошла, но вход не удался: ${loginResult.error}` });
                            setLoading(false);
                            return;
                        }
                    }
                } else {
                    // Авторизованный пользователь - проверяем пароль
                    const loginResult = await loginUser(formData.email, formData.password);

                    if (loginResult.success) {
                        const userData = AuthService.getUserData();
                        userToken = userData?.token;
                    } else {
                        setErrors({ password: 'Неверный пароль' });
                        setLoading(false);
                        return;
                    }
                }
            }

            // Отправка формы объявления
            const formDataObj = new FormData();

            // Добавляем файлы
            images.forEach((image, index) => {
                if (image) {
                    formDataObj.append(`photo${index + 1}`, image);
                }
            });

            // Добавляем текстовые поля
            formDataObj.append('kind', formData.petType);
            formDataObj.append('description', formData.petDescription);
            formDataObj.append('district', formData.petLocation);
            formDataObj.append('name', formData.name);
            formDataObj.append('phone', formData.phone);
            formDataObj.append('email', formData.email);
            formDataObj.append('confirm', formData.confirm ? 1 : 0);
            formDataObj.append('register', formData.register ? 1 : 0);

            if (formData.mark.trim()) {
                formDataObj.append('mark', formData.mark);
            }

            // Если выбран режим регистрации, добавляем пароли
            if (formData.register) {
                formDataObj.append('password', formData.password);
                formDataObj.append('password_confirmation', formData.password_confirmation || formData.password);
            }

            // Добавляем заголовок авторизации если есть токен
            const config = {};
            if (userToken) {
                config.headers = {
                    'Authorization': `Bearer ${userToken}`
                };
            }

            console.log('Отправка объявления...');
            console.log('Авторизован:', isAuthenticated);
            console.log('Регистрация:', formData.register);

            const response = await ApiService.createOrder(formDataObj, config);

            console.log('Ответ от создания объявления:', response);

            if (response && response.data && response.data.id) {
                setSuccessMessage('Объявление успешно создано!');

                // Обработка перенаправления
                if (formData.register) {
                    if (isNewRegistration) {
                        setSuccessMessage('Аккаунт создан и объявление успешно добавлено! Перенаправление в личный кабинет...');
                    } else {
                        setSuccessMessage('Объявление успешно добавлено и привязано к вашему аккаунту! Перенаправление в личный кабинет...');
                    }

                    setTimeout(() => {
                        navigate('/profile');
                    }, 2000);
                } else {
                    setSuccessMessage('Анонимное объявление успешно добавлено! Перенаправление...');
                    setTimeout(() => {
                        navigate(`/pet/${response.data.id}`);
                    }, 2000);
                }

            } else {
                setErrors({ general: 'Ошибка при создании объявления' });
            }

        } catch (error) {
            console.error('Create order error:', error);

            if (error.status === 422) {
                // Ошибки валидации с сервера
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

    const renderPasswordRequirements = () => {
        // Показываем требования только для неавторизованных пользователей с регистрацией
        if (!isAuthenticated && formData.register && formData.password) {
            return (
                <div className="password-requirements mt-2">
                    <div className={`requirement ${passwordRequirements.length ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi ${passwordRequirements.length ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span> Минимум 7 символов</span>
                    </div>
                    <div className={`requirement ${passwordRequirements.lowercase ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi ${passwordRequirements.lowercase ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span> Одна строчная буква (a-z)</span>
                    </div>
                    <div className={`requirement ${passwordRequirements.uppercase ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi ${passwordRequirements.uppercase ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span> Одна заглавная буква (A-Z)</span>
                    </div>
                    <div className={`requirement ${passwordRequirements.digit ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi ${passwordRequirements.digit ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span> Одна цифра (0-9)</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <Header />

            <div className="registration-container">
                <div className="card">
                    <div className="card-body p-4">
                        <br />
                        <Text value={'Новое объявление'} />
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



                            <form id="adForm" onSubmit={handleSubmit} noValidate>
                                <div className="row">
                                    <div className="mb-3 required-field">
                                        <label htmlFor="petType" className="form-label fw-bold">Вид животного</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.petType ? 'is-invalid' : ''}`}
                                            id="petType"
                                            value={formData.petType}
                                            onChange={(e) => handleInputChange('petType', e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        {errors.petType && (
                                            <div className="invalid-feedback">
                                                {errors.petType}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3 required-field">
                                    <label htmlFor="petDescription" className="form-label fw-bold">Описание</label>
                                    <textarea
                                        className={`form-control ${errors.petDescription ? 'is-invalid' : ''}`}
                                        id="petDescription"
                                        rows="4"
                                        value={formData.petDescription}
                                        onChange={(e) => handleInputChange('petDescription', e.target.value)}
                                        required
                                        disabled={loading}
                                    ></textarea>
                                    {errors.petDescription && (
                                        <div className="invalid-feedback">
                                            {errors.petDescription}
                                        </div>
                                    )}

                                </div>

                                <div className="mb-3">
                                    <label htmlFor="mark" className="form-label fw-bold">Клеймо (необязательно)</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.mark ? 'is-invalid' : ''}`}
                                        id="mark"
                                        value={formData.mark}
                                        onChange={(e) => handleInputChange('mark', e.target.value)}
                                        disabled={loading}

                                    />
                                    {errors.mark && (
                                        <div className="invalid-feedback">
                                            {errors.mark}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3 required-field">
                                    <label htmlFor="petLocation" className="form-label fw-bold">Район</label>
                                    <select
                                        className={`form-control ${errors.petLocation ? 'is-invalid' : ''} required-field`}
                                        id="petLocation"
                                        value={formData.petLocation}
                                        onChange={(e) => handleInputChange('petLocation', e.target.value)}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="" disabled>---</option>
                                        {districts.map((district, index) => (
                                            <option key={index} value={district}>
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.petLocation && (
                                        <div className="invalid-feedback">
                                            {errors.petLocation}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h3 className="card-title text-center mb-4">Фотографии</h3>
                                    <input
                                        type="file"
                                        className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                                        id="petPhoto1"
                                        accept="image/png, .png"
                                        onChange={(e) => handleImageChange(e, 0)}
                                        required
                                        disabled={loading}
                                    />
                                    <div className="form-text">Загрузите фотографию в формате PNG.</div>
                                    {errors.photo1 && (
                                        <div className="invalid-feedback">
                                            {errors.photo1}
                                        </div>
                                    )}
                                    <p />
                                    <input
                                        type="file"
                                        className={`form-control ${errors.photo2 ? 'is-invalid' : ''}`}
                                        id="petPhoto2"
                                        accept="image/png, .png"
                                        onChange={(e) => handleImageChange(e, 1)}
                                        disabled={loading}
                                    />
                                    <div className="form-text">Загрузите фотографию в формате PNG.</div>
                                    {errors.photo2 && (
                                        <div className="invalid-feedback">
                                            {errors.photo2}
                                        </div>
                                    )}
                                    <p />
                                    <input
                                        type="file"
                                        className={`form-control ${errors.photo3 ? 'is-invalid' : ''}`}
                                        id="petPhoto3"
                                        accept="image/png, .png"
                                        onChange={(e) => handleImageChange(e, 2)}
                                        disabled={loading}
                                    />
                                    <div className="form-text">Загрузите фотографию в формате PNG.</div>
                                    {errors.photo3 && (
                                        <div className="invalid-feedback">
                                            {errors.photo3}
                                        </div>
                                    )}

                                    {/* Превью изображений */}
                                    <div id="imagePreview" className="mt-3">
                                        <div className="row">
                                            {imagePreviews.map((preview, index) => (
                                                preview && (
                                                    <div key={index} className="col-md-4 mb-3">
                                                        <div className="position-relative">
                                                            <img
                                                                src={preview}
                                                                className="preview-image img-thumbnail w-100"
                                                                alt={`Preview ${index + 1}`}
                                                                style={{ height: '200px', objectFit: 'cover' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 mt-1 me-1"
                                                                onClick={() => removeImage(index)}
                                                                disabled={loading}
                                                            >
                                                                <a>Удалить</a>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="card-title text-center mb-4">Контактная информация</h3>
                                    <div className="mb-3 required-field">
                                        <label htmlFor="name" className="form-label">Имя</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''} ${isAuthenticated ? (errors.name ? 'is-warning' : '') : ''}`}
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                            disabled={loading || isAuthenticated}
                                            readOnly={isAuthenticated}
                                        />
                                        {errors.name && (
                                            <div className={`invalid-feedback ${isAuthenticated ? 'text-warning' : ''}`}>
                                                {errors.name}
                                            </div>
                                        )}

                                    </div>

                                    <div className="mb-3 required-field">
                                        <label htmlFor="phone" className="form-label">Телефон</label>
                                        <input
                                            type="tel"
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            required
                                            disabled={loading || isAuthenticated}
                                            readOnly={isAuthenticated}
                                        />
                                        {errors.phone && (
                                            <div className="invalid-feedback">
                                                {errors.phone}
                                            </div>
                                        )}

                                    </div>

                                    <div className="mb-3 required-field">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            required
                                            disabled={loading || isAuthenticated}
                                            readOnly={isAuthenticated}
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Чекбокс регистрации */}
                                <div className="mb-4 form-check">
                                    <div className="form-check">
                                        <input
                                            className={`form-check-input ${errors.register ? 'is-invalid' : ''}`}
                                            type="checkbox"
                                            id="register"
                                            checked={formData.register}
                                            onChange={(e) => handleInputChange('register', e.target.checked)}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="register">
                                            {isAuthenticated ? 'Привязать объявление к аккаунту' : 'Пройти автоматическую регистрацию'}
                                        </label>
                                    </div>
                                </div>

                                {formData.register && (
                                    <div className="password-fields mb-4 show" id="passwordFields">
                                        <div className="mb-3 required-field text-start">
                                            <label htmlFor="password" className="form-label">
                                                {isAuthenticated ? 'Пароль для подтверждения' : 'Пароль для аккаунта'}
                                            </label>
                                            <input
                                                type="password"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="password"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                disabled={loading}
                                                required

                                            />
                                            {errors.password && (
                                                <div className="invalid-feedback">
                                                    {errors.password}
                                                </div>
                                            )}
                                            {renderPasswordRequirements()}
                                        </div>

                                        <div className="mb-3 required-field text-start">
                                            <label htmlFor="password_confirmation" className="form-label">Подтверждение пароля</label>
                                            <input
                                                type="password"
                                                className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                                id="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                                disabled={loading}
                                                required={formData.register}

                                            />
                                            {errors.password_confirmation && (
                                                <div className="invalid-feedback">
                                                    {errors.password_confirmation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-4 form-check">
                                    <div className="form-check required-field">
                                        <input
                                            className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
                                            type="checkbox"
                                            id="confirm"
                                            checked={formData.confirm}
                                            onChange={(e) => handleInputChange('confirm', e.target.checked)}
                                            required
                                            disabled={loading}
                                        />
                                        <div id="confirmError" className="invalid-feedback">{errors.confirm}</div>
                                        Я согласен с <a href="#" className="text-decoration-none">условиями использования</a> и
                                        <a href="#" className="text-decoration-none"> политикой конфиденциальности</a>
                                    </div>
                                </div>

                                <div className="d-grid mb-3">
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-lg button-css"
                                        disabled={loading}
                                        style={{
                                            backgroundColor: 'rgb(91, 160, 74)',
                                            borderColor: 'rgb(91, 160, 74)',
                                            color: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = 'rgb(66, 124, 51)';
                                            e.target.style.borderColor = 'rgb(66, 124, 51)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'rgb(91, 160, 74)';
                                            e.target.style.borderColor = 'rgb(91, 160, 74)';
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                Публикация...
                                            </>
                                        ) : (
                                            <>
                                                <small>
                                                    {formData.register
                                                        ? (isAuthenticated
                                                            ? 'Опубликовать и привязать к аккаунту'
                                                            : 'Опубликовать и зарегистрироваться')
                                                        : 'Опубликовать анонимно'
                                                    }
                                                </small>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <LogoutModal />
        </div>
    );
};

export default Addob;