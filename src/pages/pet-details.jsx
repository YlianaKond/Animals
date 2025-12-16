// src/pages/pet-details.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LogoutModal from '../components/logout-modal';
import ApiService from '../services/api';
import placeholderImage from '../assets/images/placeholder.svg';
import Text from '../components/Text';

const PetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [userName, setUserName] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Получаем информацию об авторизации и имени пользователя
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        setIsAuthenticated(!!token);

        if (token) {
            // Пытаемся получить имя пользователя из localStorage
            const userDataStr = localStorage.getItem('user_data');
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    if (userData.name) {
                        setUserName(userData.name);
                    }
                } catch (error) {
                    console.error('Ошибка при чтении user_data:', error);
                }
            }
        }
    }, []);

    useEffect(() => {
        const loadPetDetails = async () => {
            try {
                setLoading(true);
                const response = await ApiService.getPetDetails(id);

                console.log('API Response:', response); // Для отладки

                // ИСПРАВЛЕННАЯ ПРОВЕРКА: pet - это объект, а не массив
                if (response && response.data && response.data.pet) {
                    setPet(response.data.pet); // Просто берем объект pet
                    console.log('Pet data set:', response.data.pet);
                } else {
                    setError('Животное не найдено');
                }
            } catch (error) {
                console.error('Ошибка при загрузке информации о животном:', error);

                if (error.status === 404) {
                    setError('Животное не найдено');
                } else if (error.status === 204) {
                    setError('Информация о животном отсутствует');
                } else {
                    setError('Ошибка при загрузке информации');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadPetDetails();
        }
    }, [id]);

    const handlePreviousImage = () => {
        if (pet && pet.photos && pet.photos.length > 0) {
            setActiveImageIndex((prevIndex) =>
                prevIndex === 0 ? pet.photos.length - 1 : prevIndex - 1
            );
        }
    };

    const handleNextImage = () => {
        if (pet && pet.photos && pet.photos.length > 0) {
            setActiveImageIndex((prevIndex) =>
                prevIndex === pet.photos.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указана';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Получаем массив фото для отображения (логика из первого кода)
    const getPhotosArray = () => {
        if (!pet) return [];

        console.log('Raw photos array:', pet.photos);

        // Если есть массив photos
        if (pet.photos && Array.isArray(pet.photos)) {
            // Фильтруем: убираем null, пустые строки, и проверяем валидность пути
            const filteredPhotos = pet.photos.filter(photo => {
                // Проверяем, что фото не null/undefined и не пустая строка
                if (!photo) return false;

                // Проверяем, что это строка
                if (typeof photo !== 'string') return false;

                // Проверяем, что содержит хотя бы один слеш (признак пути)
                return photo.includes('/');
            });

            console.log('Filtered photos:', filteredPhotos);
            return filteredPhotos;
        }

        // Если есть одно фото в поле photo
        if (pet.photo && typeof pet.photo === 'string' && pet.photo.includes('/')) {
            console.log('Using single photo:', pet.photo);
            return [pet.photo];
        }

        console.log('No valid photos found');
        return [];
    };

    const photos = getPhotosArray();
    const hasPhotos = photos.length > 0;
    const currentPhotoUrl = hasPhotos ? ApiService.getImageUrl(photos[activeImageIndex]) : null;

    if (loading) {
        return (
            <div>
                <Header isAuthenticated={isAuthenticated} userName={userName} />
                <div className="container py-5 text-center">
                    <div className="spinner-border" role="status" style={{
                        width: '3rem',
                        height: '3rem',
                        color: 'rgb(91, 160, 74)'
                    }}>
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-3">Загрузка информации о животном...</p>
                </div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div>
                <Header isAuthenticated={isAuthenticated} userName={userName} />
                <div className="container py-5">
                    <div className="alert alert-danger" role="alert">
                        {error || 'Животное не найдено'}
                    </div>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={() => navigate(-1)}
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
                        <i className="bi bi-arrow-left me-2">Вернуться</i>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header isAuthenticated={isAuthenticated} userName={userName} />

            <div className="container py-5">
                <div className="row">
                    {/* Карточка с фото - левая колонка */}
                    <div className="col-lg-6 col-md-12 mb-4 mb-lg-0">
                        <div className="card" style={{
                            border: 'none',
                            backgroundColor: 'rgb(91, 160, 74)',
                            height: 'auto',
                            minHeight: '400px'
                        }}>
                            <div className="card-body p-0" style={{
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {hasPhotos ? (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <img
                                                src={currentPhotoUrl}
                                                className="img-fluid"
                                                alt={pet.kind}
                                                style={{
                                                    width: 'auto',
                                                    height: 'auto',
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                    padding: '15px'
                                                }}
                                                onError={(e) => {
                                                    console.error('Image load error:', e.target.src);
                                                    e.target.src = placeholderImage;
                                                    e.target.style.objectFit = 'contain';
                                                }}
                                                onLoad={() => console.log('Image loaded successfully:', currentPhotoUrl)}
                                            />
                                        </div>

                                        {/* Навигация по изображениям */}
                                        {photos.length > 1 && (
                                            <>
                                                <button
                                                    className="btn position-absolute top-50 start-0 translate-middle-y ms-3"
                                                    onClick={handlePreviousImage}
                                                    style={{
                                                        zIndex: 1,
                                                        backgroundColor: 'rgb(91, 160, 74)',
                                                        borderColor: 'rgb(91, 160, 74)',
                                                        color: 'white',
                                                        opacity: '0.8'
                                                    }}
                                                >
                                                    ↩
                                                </button>
                                                <button
                                                    className="btn position-absolute top-50 end-0 translate-middle-y me-3"
                                                    onClick={handleNextImage}
                                                    style={{
                                                        zIndex: 1,
                                                        backgroundColor: 'rgb(91, 160, 74)',
                                                        borderColor: 'rgb(91, 160, 74)',
                                                        color: 'white',
                                                        opacity: '0.8'
                                                    }}
                                                >
                                                    ↪
                                                </button>

                                                {/* Индикаторы */}
                                                <div className="position-absolute bottom-0 start-0 end-0 mb-3">
                                                    <div className="d-flex justify-content-center">
                                                        {photos.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                className="btn btn-sm mx-1"
                                                                onClick={() => setActiveImageIndex(index)}
                                                                style={{
                                                                    width: '10px',
                                                                    height: '10px',
                                                                    padding: 0,
                                                                    backgroundColor: index === activeImageIndex ? 'rgb(91, 160, 74)' : '#6c757d',
                                                                    borderColor: index === activeImageIndex ? 'rgb(91, 160, 74)' : '#6c757d'
                                                                }}
                                                            >
                                                                <span className="visually-hidden">Изображение {index + 1}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center w-100 h-100">
                                        <div className="text-center">
                                            <i className="bi bi-image" style={{ fontSize: '4rem', color: 'white' }}></i>
                                            <p className="mt-2 text-white">Нет фотографий</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Карточка с информацией - правая колонка (без фиксированной высоты) */}
                    <div className="col-lg-6 col-md-12">
                        <div className="card" style={{ border: 'none', height: 'auto' }}>
                            <div className="card-body mt-2">
                                <Text value={pet.kind} />

                                {/* Информация о животном */}
                                <div className="mb-4">
                                    <table className="table table-borderless">
                                        <tbody>
                                            <tr>
                                                <th className="text-muted" style={{ width: '30%' }}>
                                                    <small>Описание:</small>
                                                </th>
                                                <td>
                                                    <p className="card-text mb-0">{pet.description || 'Описание отсутствует'}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="text-muted">
                                                    <small>Район:</small>
                                                </th>
                                                <td>
                                                    <small>{pet.district || 'Не указан'}</small>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="text-muted">
                                                    <small>Дата:</small>
                                                </th>
                                                <td>
                                                    <small>{formatDate(pet.date)}</small>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="text-muted">
                                                    <small>Клеймо:</small>
                                                </th>
                                                <td>
                                                    <small>{pet.mark || 'Не указано'}</small>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="text-muted">
                                                    <small>ID объявления:</small>
                                                </th>
                                                <td>
                                                    <small>{pet.id}</small>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Контактная информация */}
                                <div className="mb-4">
                                    <h4 className="card-title text-center mb-3">Контактная информация</h4>
                                    <table className="table table-borderless">
                                        <tbody>
                                            <tr>
                                                <th className="text-muted" style={{ width: '30%' }}>
                                                    <small>Имя:</small>
                                                </th>
                                                <td>
                                                    <small>{pet.name || 'Не указано'}</small>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="text-muted">
                                                    <small>Телефон:</small>
                                                </th>
                                                <td>
                                                    <small>
                                                        {pet.phone ? (
                                                            <a href={`tel:${pet.phone}`} className="text-decoration-none" style={{ color: 'rgb(91, 160, 74)' }}>
                                                                {pet.phone}
                                                            </a>
                                                        ) : 'Не указан'}
                                                    </small>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="text-muted">
                                                    <small>Email:</small>
                                                </th>
                                                <td>
                                                    <small>
                                                        {pet.email ? (
                                                            <a href={`mailto:${pet.email}`} className="text-decoration-none" style={{ color: 'rgb(91, 160, 74)' }}>
                                                                {pet.email}
                                                            </a>
                                                        ) : 'Не указан'}
                                                    </small>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Кнопки в одной строке */}
                                <div className="mt-4 d-flex flex-nowrap" style={{ flexWrap: 'nowrap', gap: '10px' }}>
                                    <button
                                        className="btn flex-shrink-0"
                                        onClick={() => window.history.back()}
                                        style={{
                                            backgroundColor: 'rgb(91, 160, 74)',
                                            borderColor: 'rgb(91, 160, 74)',
                                            color: 'white',
                                            whiteSpace: 'nowrap',
                                            minWidth: '120px'
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
                                        Вернуться
                                    </button>
                                    <button
                                        className="btn flex-shrink-0"
                                        onClick={() => navigate('/search')}
                                        style={{
                                            color: 'rgb(91, 160, 74)',
                                            borderColor: 'rgb(91, 160, 74)',
                                            backgroundColor: 'transparent',
                                            whiteSpace: 'nowrap',
                                            minWidth: '180px'
                                        }}
                                    >
                                        Поиск других животных
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LogoutModal />
            <Footer />



        </div>
    );
};

export default PetDetails;