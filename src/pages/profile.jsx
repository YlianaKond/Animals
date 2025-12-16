// src/pages/profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileStats from '../components/profile-stats';
import UserAds from '../components/user-ads';
import LogoutModal from '../components/logout-modal';
import AuthRequiredModal from '../components/auth-required-modal';
import ApiService from '../services/api';
import placeholderImage from '../assets/images/placeholder.svg';
import Text from '../components/Text';

const Profile = () => {
    const primaryButtonStyle = {
        backgroundColor: 'rgb(91, 160, 74)',
        borderColor: 'rgb(91, 160, 74)',
        color: 'white'
    };

    const primaryButtonHoverStyle = {
        backgroundColor: 'rgb(81, 140, 64)',
        borderColor: 'rgb(81, 140, 64)',
        color: 'white'
    };

    const [activeTab, setActiveTab] = useState('ads');
    const [userData, setUserData] = useState(null);
    const [userAds, setUserAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contactData, setContactData] = useState({
        phone: '',
        email: ''
    });
    const [editErrors, setEditErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isEditingContacts, setIsEditingContacts] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSavingContacts, setIsSavingContacts] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const navigate = useNavigate();

    const handleAdUpdate = async (adId, updatedData) => {
        try {
            const formData = new FormData();

            // Добавляем файлы, если они есть
            if (updatedData.photos && updatedData.photos[0]) {
                formData.append('photo1', updatedData.photos[0]);
            }
            if (updatedData.photos && updatedData.photos[1]) {
                formData.append('photo2', updatedData.photos[1]);
            }
            if (updatedData.photos && updatedData.photos[2]) {
                formData.append('photo3', updatedData.photos[2]);
            }

            formData.append('mark', updatedData.mark || '');
            formData.append('description', updatedData.description || '');

            await ApiService.updateOrder(adId, formData);

            // Обновляем локальное состояние
            const updatedAds = userAds.map(ad =>
                ad.id === adId ? {
                    ...ad,
                    mark: updatedData.mark,
                    description: updatedData.description
                } : ad
            );
            setUserAds(updatedAds);

            setSuccessMessage('Объявление успешно обновлено');
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.error('Ошибка при обновлении объявления:', error);
            setError('Ошибка при обновлении объявления');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleAdDelete = async (adId) => {
        try {
            await ApiService.deleteOrder(adId);

            // Обновляем локальное состояние
            const updatedAds = userAds.filter(ad => ad.id !== adId);
            setUserAds(updatedAds);

            setSuccessMessage('Объявление успешно удалено');
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.error('Ошибка при удалении объявления:', error);
            if (error.status === 403) {
                setError('Нельзя удалить объявление с текущим статусом');
            } else {
                setError('Ошибка при удалении объявления');
            }
            setTimeout(() => setError(null), 3000);
        }
    };

    // Проверка авторизации и загрузка данных
    useEffect(() => {
        console.log('=== PROFILE USEEFFECT START ===');

        const token = localStorage.getItem('auth_token');
        console.log('Токен в localStorage:', token ? 'ЕСТЬ' : 'НЕТ');

        if (!token) {
            console.log('Нет токена, редирект на /register');
            navigate('/register');
            return;
        }

        const loadProfileData = async () => {
            try {
                setLoading(true);
                console.log('=== ЗАГРУЗКА ПРОФИЛЯ ===');

                const token = localStorage.getItem('auth_token');
                if (!token) {
                    console.log('Нет токена, редирект на /register');
                    navigate('/register');
                    return;
                }

                console.log('1. Запрашиваем данные пользователя через /users');

                // Получаем данные текущего пользователя
                const userResponse = await ApiService.request('/users');
                console.log('Ответ пользователя:', userResponse);

                // Обрабатываем данные пользователя
                let userData = null;

                if (userResponse && userResponse.id) {
                    // Формат: {id: 123, name: "Имя", email: "...", ...}
                    userData = userResponse;
                } else if (userResponse && userResponse.data && userResponse.data.id) {
                    // Формат: {data: {id: 123, name: "Имя", ...}}
                    userData = userResponse.data;
                }

                if (!userData || !userData.id) {
                    console.error('Не удалось получить данные пользователя');
                    throw new Error('Не удалось получить данные пользователя');
                }

                console.log('Данные пользователя получены:', userData);

                // Сохраняем ID пользователя в localStorage
                localStorage.setItem('user_id', userData.id.toString());
                localStorage.setItem('user_data', JSON.stringify(userData));

                // Расчет дней с регистрации
                if (userData.registrationDate) {
                    const regDate = new Date(userData.registrationDate);
                    const today = new Date();
                    const diffTime = Math.abs(today - regDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    userData.daysSinceRegistration = diffDays;
                }

                // Устанавливаем данные пользователя
                setUserData(userData);
                setContactData({
                    phone: userData.phone || '',
                    email: userData.email || ''
                });

                console.log('2. Запрашиваем объявления пользователя через /users/orders');

                // Получаем объявления пользователя
                const adsResponse = await ApiService.getCurrentUserOrders();
                console.log('Ответ объявлений:', adsResponse);

                // Обработка объявлений
                if (adsResponse && adsResponse.data && adsResponse.data.orders) {
                    console.log('Объявлений получено:', adsResponse.data.orders.length);
                    const adsWithStatusText = adsResponse.data.orders.map(ad => ({
                        ...ad,
                        statusText: getStatusText(ad.status),
                        image: ad.photo || ad.photos || placeholderImage
                    }));
                    setUserAds(adsWithStatusText);
                } else if (adsResponse && Array.isArray(adsResponse)) {
                    console.log('Объявлений получено (прямой массив):', adsResponse.length);
                    const adsWithStatusText = adsResponse.map(ad => ({
                        ...ad,
                        statusText: getStatusText(ad.status),
                        image: ad.photo || ad.photos || placeholderImage
                    }));
                    setUserAds(adsWithStatusText);
                } else {
                    console.log('Нет объявлений у пользователя');
                    setUserAds([]);
                }

                console.log('=== ЗАГРУЗКА ПРОФИЛЯ ЗАВЕРШЕНА ===');

            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);

                if (error.status === 401) {
                    console.log('Ошибка 401 - неавторизован, очищаем токен');
                    ApiService.clearToken();
                    navigate('/register');
                } else if (error.status === 404) {
                    console.log('Ошибка 404 - пользователь не найден');
                    setError('Пользователь не найден');
                } else {
                    setError('Ошибка при загрузке данных профиля: ' + (error.message || 'Неизвестная ошибка'));
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [navigate]);

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Активное';
            case 'wasFound': return 'Хозяин найден';
            case 'onModeration': return 'На модерации';
            case 'archive': return 'В архиве';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'badge-status-active';
            case 'wasFound': return 'badge-status-wasFound';
            case 'onModeration': return 'badge-status-onModeration';
            case 'archive': return 'badge-status-archive';
            default: return '';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active':
                return { backgroundColor: '#rgb(91, 160, 74)', color: 'white' };
            case 'wasFound':
                return { backgroundColor: '#17a2b8', color: 'white' };
            case 'onModeration':
                return { backgroundColor: '#ffc107', color: 'black' };
            case 'archive':
                return { backgroundColor: '#6c757d', color: 'white' };
            default:
                return {};
        }
    };

    // Функция для валидации email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Функция для валидации телефона
    const validatePhone = (phone) => {
        // Удаляем все нецифровые символы
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10;
    };

    // Обработка изменения контактных данных
    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactData(prev => ({
            ...prev,
            [name]: value
        }));

        // Очищаем ошибки для этого поля
        if (editErrors[name]) {
            setEditErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Отмена редактирования контактов
    const handleCancelContacts = () => {
        setContactData({
            phone: userData?.phone || '',
            email: userData?.email || ''
        });
        setEditErrors({});
        setIsEditingContacts(false);
    };

    // Сохранение контактных данных
    const handleContactSubmit = async (e) => {
        e.preventDefault();

        setEditErrors({});
        setIsSavingContacts(true);

        // Валидация на клиенте
        const errors = {};

        if (contactData.email && !validateEmail(contactData.email)) {
            errors.email = 'Введите корректный адрес электронной почты';
        }

        if (contactData.phone && !validatePhone(contactData.phone)) {
            errors.phone = 'Номер телефона должен содержать не менее 10 цифр';
        }

        if (Object.keys(errors).length > 0) {
            setEditErrors(errors);
            setIsSavingContacts(false);
            return;
        }

        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                throw new Error('Пользователь не авторизован');
            }

            let hasChanges = false;

            // Обновляем телефон, если он изменился
            if (contactData.phone !== userData?.phone) {
                await ApiService.updatePhone(userId, contactData.phone);
                hasChanges = true;
            }

            // Обновляем email, если он изменился
            if (contactData.email !== userData?.email) {
                await ApiService.updateEmail(userId, contactData.email);
                hasChanges = true;
            }

            if (hasChanges) {
                // Обновляем локальные данные
                setUserData(prev => ({
                    ...prev,
                    phone: contactData.phone,
                    email: contactData.email
                }));

                setSuccessMessage('Контактные данные успешно обновлены');
                setIsEditingContacts(false);
            } else {
                setSuccessMessage('Изменений не обнаружено');
            }

            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.error('Ошибка при обновлении контактов:', error);

            if (error.status === 422 || error.status === 400) {
                setEditErrors(error.data?.error?.errors || {});
            } else if (error.status === 409) {
                setEditErrors({ email: 'Этот email уже используется другим пользователем' });
            } else {
                setError('Ошибка при обновлении контактных данных: ' + (error.data?.error?.message || 'Неизвестная ошибка'));
                setTimeout(() => setError(null), 3000);
            }
        } finally {
            setIsSavingContacts(false);
        }
    };

    // Обработка изменения полей пароля
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        // Очищаем ошибки для этого поля
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Отмена смены пароля
    const handleCancelPassword = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordErrors({});
        setIsChangingPassword(false);
    };

    // Сохранение нового пароля
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        setPasswordErrors({});
        setIsSavingPassword(true);

        const { currentPassword, newPassword, confirmPassword } = passwordData;

        // Валидация на клиенте
        const errors = {};
        const passwordRegex = /^(?=.d)(?=.*[a-z])(?=.*[A-Z]).{7,}$/;

        if (!currentPassword) {
            errors.currentPassword = 'Введите текущий пароль';
        }

        if (!newPassword) {
            errors.newPassword = 'Введите новый пароль';
        } else if (!passwordRegex.test(newPassword)) {
            errors.newPassword = 'Пароль должен содержать минимум 7 символов, 1 цифру, 1 строчную и 1 заглавную букву';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Подтвердите новый пароль';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            setIsSavingPassword(false);
            return;
        }

        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                throw new Error('Пользователь не авторизован');
            }

            await ApiService.updatePassword(userId, {
                currentPassword,
                newPassword,
                confirmPassword
            });

            setSuccessMessage('Пароль успешно изменен');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsChangingPassword(false);

            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.error('Ошибка при смене пароля:', error);

            if (error.status === 401 || error.status === 422 || error.status === 400) {
                setPasswordErrors(error.data?.error?.errors || {});
            } else {
                setError('Ошибка при смене пароля: ' + (error.data?.error?.message || 'Неизвестная ошибка'));
                setTimeout(() => setError(null), 3000);
            }
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleLogout = () => {
        console.log('Выход из профиля');
        ApiService.clearToken();
        navigate('/');
    };

    if (loading) {
        return (
            <div>
                <Header isAuthenticated={false} />
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{
                        width: '3rem',
                        height: '3rem',
                        color: 'rgb(91, 160, 74)'
                    }}>
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-2">Загрузка профиля...</p>
                    <p className="text-muted small">Проверяем авторизацию...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div>
                <Header isAuthenticated={false} />
                <div className="container py-5">
                    <div className="alert alert-danger" role="alert">
                        Не удалось загрузить данные профиля
                    </div>
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-primary button-css"
                            onClick={() => navigate('/register')}
                        >
                            Вернуться на страницу входа
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header isAuthenticated={true} userName={userData.name} />
            <div className='container'>
                {successMessage && (
                    <div className="alert-fixed-top">
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            {successMessage}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setSuccessMessage('')}
                            ></button>
                        </div>
                    </div>
                )}
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col">
                            <br />
                            <br />
                            <Text value="Мой кабинет" />
                            <br />
                        </div>
                    </div>
                </div>

                {/* Основной контейнер с двумя колонками */}
                <div className="profile-main-container">
                    <div className="row">
                        {/* Левая колонка - ProfileStats */}
                        <div className="col-12 col-lg-3">
                            <div className="profile-stats-wrapper">
                                <div className="card profile-stats-card" style={{
                                    backgroundColor: 'rgb(91, 160, 74)',
                                    color: 'white',
                                    minHeight: '250px',
                                    height: '250px',
                                    width: '100%',
                                    maxWidth: '320px',
                                    margin: '0 auto'
                                }}>
                                    <ProfileStats
                                        userName={userData.name}
                                        daysCount={userData.daysSinceRegistration || 0}
                                        adsCount={userData.ordersCount || userAds.length}
                                        petsCount={userData.petsCount || 0}
                                        dateR={userData.registrationDate}
                                        email={userData.email || 0}
                                        phone={userData.phone}
                                    />
                                </div>
                                <br />

                            </div>
                        </div>

                        {/* Правая колонка - UserAds и Настройки */}
                        <div className="col-12 col-lg-9">
                            <div className="user-ads-wrapper">
                                <div className="card h-100 user-ads-card" style={{
                                    backgroundColor: 'rgb(91, 160, 74)',
                                    minHeight: '280px'
                                }}>
                                    <div className="card-body d-flex flex-column" style={{ width: '100%' }}>

                                        {/* АДАПТИВНЫЙ КОНТЕЙНЕР ДЛЯ КНОПОК */}
                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 mt-2 gap-3 gap-md-0">

                                            {/* Кнопки вкладок */}
                                            <ul className="nav nav-pills flex-column flex-sm-row" id="profileTabs" role="tablist">
                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        className={`nav-link ${activeTab === 'ads' ? 'active' : ''}`}
                                                        onClick={() => setActiveTab('ads')}
                                                        style={activeTab === 'ads' ? primaryButtonStyle : {
                                                            color: 'rgba(34, 67, 26, 1)',
                                                            backgroundColor: 'transparent',
                                                            borderColor: 'transparent'
                                                        }}
                                                    >
                                                        Мои объявления
                                                    </button>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                                        onClick={() => setActiveTab('settings')}
                                                        style={activeTab === 'settings' ? primaryButtonStyle : {
                                                            color: 'rgba(34, 67, 26, 1)',
                                                            backgroundColor: 'transparent',
                                                            borderColor: 'transparent'
                                                        }}
                                                    >
                                                        Настройки
                                                    </button>
                                                </li>
                                            </ul>

                                            {/* Кнопка "Добавить объявление" */}
                                            <a
                                                href="/add"
                                                className="btn button-css add-ad-btn"
                                                style={{
                                                    border: '2px solid white',
                                                    color: 'white',
                                                    width: '100%',
                                                    maxWidth: '250px'
                                                }}
                                            >
                                                + Добавить объявление
                                            </a>
                                        </div>

                                        <div className="tab-content flex-grow-1">
                                            <div className={`tab-pane fade ${activeTab === 'ads' ? 'show active' : ''}`}>
                                                <UserAds
                                                    ads={userAds}
                                                    onAdUpdate={handleAdUpdate}
                                                    onAdDelete={handleAdDelete}
                                                    getStatusClass={getStatusClass}
                                                    getStatusStyle={getStatusStyle}
                                                />
                                                <br />
                                            </div>

                                            <div className={`tab-pane fade ${activeTab === 'settings' ? 'show active' : ''}`}>
                                                <section id="settings" role="tabpanel">
                                                    <div className="card mb-4">
                                                        <div className="card-body">
                                                            <form onSubmit={handleContactSubmit}>
                                                                <div className="mb-3">
                                                                    <label htmlFor="phone" className="form-label">Телефон</label>
                                                                    <input
                                                                        type="tel"
                                                                        className={`form-control ${editErrors.phone ? 'is-invalid' : ''}`}
                                                                        id="phone"
                                                                        name="phone"
                                                                        value={contactData.phone}
                                                                        onChange={handleContactChange}
                                                                        required
                                                                        disabled={!isEditingContacts}
                                                                    />
                                                                    {editErrors.phone && (
                                                                        <div className="invalid-feedback">
                                                                            {editErrors.phone}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="mb-4">
                                                                    <label htmlFor="email" className="form-label">Электронная почта</label>
                                                                    <input
                                                                        type="email"
                                                                        className={`form-control ${editErrors.email ? 'is-invalid' : ''}`}
                                                                        id="email"
                                                                        name="email"
                                                                        value={contactData.email}
                                                                        onChange={handleContactChange}
                                                                        required
                                                                        disabled={!isEditingContacts}
                                                                    />
                                                                    {editErrors.email && (
                                                                        <div className="invalid-feedback">
                                                                            {editErrors.email}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {!isEditingContacts && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-primary button-css"
                                                                        onClick={() => setIsEditingContacts(true)}
                                                                        style={{
                                                                            backgroundColor: 'rgb(91, 160, 74)',
                                                                            borderColor: 'rgb(91, 160, 74)',
                                                                            color: 'white'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.backgroundColor = 'rgb(81, 140, 64)';
                                                                            e.target.style.borderColor = 'rgb(81, 140, 64)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.backgroundColor = 'rgb(91, 160, 74)';
                                                                            e.target.style.borderColor = 'rgb(91, 160, 74)';
                                                                        }}
                                                                    >
                                                                        Изменить
                                                                    </button>
                                                                )}

                                                                {isEditingContacts && (
                                                                    <div className="d-flex gap-2">
                                                                        <button
                                                                            type="submit"
                                                                            className="btn btn-primary button-css"
                                                                            disabled={isSavingContacts}
                                                                            style={{
                                                                                backgroundColor: 'rgb(91, 160, 74)',
                                                                                borderColor: 'rgb(91, 160, 74)',
                                                                                color: 'white'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.backgroundColor = 'rgb(81, 140, 64)';
                                                                                e.target.style.borderColor = 'rgb(81, 140, 64)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.backgroundColor = 'rgb(91, 160, 74)';
                                                                                e.target.style.borderColor = 'rgb(91, 160, 74)';
                                                                            }}
                                                                        >
                                                                            {isSavingContacts ? (
                                                                                <>
                                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                                    Сохранение...
                                                                                </>
                                                                            ) : 'Сохранить изменения'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary"
                                                                            onClick={handleCancelContacts}
                                                                            disabled={isSavingContacts}
                                                                        >
                                                                            Отмена
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </form>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="alert-fixed-top">
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError(null)}
                            ></button>
                        </div>
                    </div>
                )}

                <br />
                <br />
            </div>
            <Footer />
            <LogoutModal onLogout={handleLogout} />
            <AuthRequiredModal />
        </div>
    );
};

export default Profile;