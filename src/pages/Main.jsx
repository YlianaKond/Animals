// src/pages/main.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsletterSection from '../components/newletter-section';
import LogoutModal from '../components/logout-modal';
import QuickSearch from '../components/quick-search';
import ApiService from '../services/api';
import AuthService from '../services/AuthService';
import placeholderImage from '../assets/images/placeholder.svg';
import Text from '../components/Text';
import dateIcon from '../assets/images/icon_calendary.png';
import geoIcon from '../assets/images/icon_district.png';

const Main = () => {
    const [sliderPets, setSliderPets] = useState([]);
    const [recentPets, setRecentPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSlider, setShowSlider] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');

    // Добавляем состояния из второго кода
    const [quickSearchQuery, setQuickSearchQuery] = useState(''); // Состояние для быстрого поиска
    const navigate = useNavigate(); // Добавляем навигацию

    // Проверка авторизации (логика из первого кода)
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = AuthService.isAuthenticated();
            setIsAuthenticated(authStatus);
            setUserName(AuthService.getUserName());
        };

        checkAuth();

        // Подписываемся на события изменения авторизации
        window.addEventListener('authChange', checkAuth);
        window.addEventListener('userDataUpdate', checkAuth);

        return () => {
            window.removeEventListener('authChange', checkAuth);
            window.removeEventListener('userDataUpdate', checkAuth);
        };
    }, []);



    // Загрузка данных для слайдера и последних найденных животных
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Загрузка слайдера
                const sliderResponse = await ApiService.getPetsSlider();
                if (sliderResponse && sliderResponse.data && sliderResponse.data.pets) {
                    const pets = sliderResponse.data.pets;
                    setSliderPets(pets);
                    setShowSlider(pets.length > 0);
                } else {
                    // Если нет данных, пробуем получить пустой массив
                    const emptyResponse = await ApiService.getPetsSlider(true);
                    setSliderPets(emptyResponse?.data?.pets || []);
                    setShowSlider(false);
                }

                // Загрузка последних найденных животных
                const recentResponse = await ApiService.getRecentPets();
                if (recentResponse && recentResponse.data && recentResponse.data.orders) {
                    // Сортируем по дате
                    const sortedPets = recentResponse.data.orders
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 6);

                    setRecentPets(sortedPets);
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setShowSlider(false);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Debounce поиск для подсказок (исправленная версия)
    useEffect(() => {
        if (quickSearchQuery.length > 2) {
            const timer = setTimeout(async () => {
                try {
                    const response = await ApiService.searchOrders({});

                    if (response && response.data && response.data.orders) {
                        const allOrders = response.data.orders;
                        const queryLower = quickSearchQuery.toLowerCase();

                        // Ищем совпадения в описании
                        const matchedOrders = allOrders.filter(order => {
                            const description = order.description || '';
                            return description.toLowerCase().includes(queryLower);
                        }).slice(0, 10);

                        // Форматируем подсказки и убираем дубликаты
                        const uniqueDescriptions = new Set();
                        const formattedSuggestions = matchedOrders
                            .map(order => ({
                                id: order.id,
                                kind: order.kind || '',
                                originalDescription: order.description || '', // Сохраняем оригинальное описание
                                description: (order.description || '').toLowerCase(), // Приводим к нижнему регистру для отображения
                                district: '',
                                photo: order.photo || order.photos || null
                            }))
                            .filter(suggestion => {
                                // Фильтруем пустые описания и убираем дубликаты
                                const desc = suggestion.description.trim();
                                if (desc === '' || uniqueDescriptions.has(desc)) {
                                    return false;
                                }
                                uniqueDescriptions.add(desc);
                                return true;
                            })
                            .slice(0, 5); // Ограничиваем 5 подсказками

                        setSearchSuggestions(formattedSuggestions);
                    } else {
                        setSearchSuggestions([]);
                    }
                } catch (error) {
                    console.error('Ошибка при поиске подсказок:', error);
                    setSearchSuggestions([]);
                }
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setSearchSuggestions([]);
        }
    }, [quickSearchQuery]); // Зависимость от quickSearchQuery

    // Функция обработки быстрого поиска из второго кода
    const handleQuickSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (quickSearchQuery) params.append('description', quickSearchQuery);

        navigate(`/search?${params.toString()}`);
    };

    // Функция обработки изменения ввода быстрого поиска из второго кода
    const handleQuickSearchInputChange = (value) => {
        setQuickSearchQuery(value);
    };

    // Функция обработки выбора подсказки из второго кода (исправленная)
    const handleSuggestionSelect = (suggestion) => {
        // Используем оригинальное описание (не нижний регистр)
        setQuickSearchQuery(suggestion.originalDescription);

        // Выполняем поиск сразу при выборе подсказки
        const params = new URLSearchParams();
        if (suggestion.originalDescription) {
            params.append('description', suggestion.originalDescription);
        }

        // Очищаем подсказки после выбора
        setSearchSuggestions([]);

        navigate(`/search?${params.toString()}`);
    };

    const handleNewsletterSubmit = async (email) => {
        try {
            const response = await ApiService.subscribeToNews(email);

            if (response && !response.error) {
                return {
                    success: true,
                    message: 'Вы успешно подписались на рассылку!'
                };
            } else {
                return {
                    success: false,
                    message: response.error?.message || 'Ошибка при подписке'
                };
            }
        } catch (error) {
            if (error.status === 422) {
                return {
                    success: false,
                    message: error.data?.error?.errors?.email?.[0] || 'Ошибка валидации'
                };
            }
            return {
                success: false,
                message: 'Ошибка при подключении к серверу'
            };
        }
    };

    const getStatusBadge = (registred) => {
        return registred ? 'bg-success' : 'bg-secondary';
    };

    if (loading) {
        return (
            <div>
                <Header isAuthenticated={isAuthenticated} userName={userName} />
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{
                        width: '3rem',
                        height: '3rem',
                        color: 'rgb(235, 186, 218)'
                    }}>
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-2">Загрузка данных...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header isAuthenticated={isAuthenticated} userName={userName} />

            <br />
            <br />

            <Text value={'ПОМОГАЕМ ИСКАТЬ ЖИВОТНЫХ в СПб и ЛЕН ОБЛАСТИ'} />

            {/* Карусель со слайдером */}
            {showSlider && (
                <div className="carousel-container">
                    <br />
                    <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                            {sliderPets.map((_, index) => (
                                
                                <button
                                    key={index}
                                    type="button"
                                    
                                    data-bs-target="#carouselExampleCaptions"
                                    data-bs-slide-to={index}
                                    className={index === 0 ? "active" : ""}
                                    aria-label={`Slide ${index + 1}`}
                                ></button>
                            ))}
                        </div>
                        <div className="carousel-inner">
                            {sliderPets.map((pet, index) => (
                                <div key={pet.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                    <div className="row align-items-center">
                                        <div className="carousel-image-container position-relative">
                                            <img loading='lazy'
                                                src={pet.image || placeholderImage}
                                                className="d-block square-slider-image"
                                                alt={pet.kind}
                                                style={{ objectFit: 'cover', height: '400px', width: '100%' }}
                                                onError={(e) => {
                                                    e.target.src = placeholderImage;
                                                    e.target.style.objectFit = 'contain';
                                                }}
                                            />

                                            {/* Плашка "Хозяин найден" сверху справа */}
                                            <div className="position-absolute top-0 end-0 me-4 mt-3">
                                                <span className="badge bg-success fs-6 p-2 shadow">Хозяин найден</span>
                                            </div>

                                            {/* Контент поверх изображения внизу */}
                                            <div className="carousel-content position-absolute bottom-0 start-0 end-0 p-3"
                                                style={{
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                                    color: 'white'
                                                }}>
                                                <div className="d-flex flex-column" style={{ gap: '0.25rem' }}>
                                                    <h1 className="card-title text-center">{pet.kind}</h1>
                                                    <h5 className="text-center">{pet.description}</h5>
                                                </div>
                                                <br />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {sliderPets.length > 1 && (
                            <>
                                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <br />
            <br />


            <div className="container">
                <div className="card" style={{
                    backgroundColor: 'rgb(212, 109, 169)',
                    border: 'none',
                    color: 'white',

                }}>
                    <div className="card-body search-block">
                        <QuickSearch showTitle={true} />
                    </div>
                    <br />
                </div>
            </div>



            {/* Последние найденные животные */}
            <div className="container mt-5">
                <div className="card">
                    <div className="card-body">
                        <br />
                        <Text value={'Недавно найденные животные'} />
                        <br />
                        {recentPets.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-muted">Нет данных о найденных животных</p>
                            </div>
                        ) : (
                            <div className="row">
                                {recentPets.map(pet => (
                                    <div key={pet.id} className="col-md-4 mb-4">
                                        <div className="card h-100 position-relative" style={{ border: 'none' }}>
                                            <div className="position-relative">
                                                <img loading='lazy'
                                                    src={pet.photo || pet.photos || placeholderImage}
                                                    className="card-img-top"
                                                    alt={pet.kind}
                                                    style={{ height: '250px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.src = placeholderImage;
                                                        e.target.style.objectFit = 'contain';
                                                    }}
                                                />

                                                {/* Плашка "Зарегистрировано/Не зарегистрировано" */}
                                                <div className="position-absolute bottom-0 end-0 m-2">
                                                    <span className={`badge ${getStatusBadge(pet.registred)} p-2 shadow`}>
                                                        {pet.registred ? 'Зарегистрировано' : 'Не зарегистрировано'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card-body d-flex flex-column">
                                                <h3 className="card-title">{pet.kind}</h3>
                                                <p />
                                                <div className="mb-1 d-flex align-items-center">
                                                    <img src={dateIcon} style={{ "width": "20px", "marginRight": "8px" }} alt="Иконка календаря" />
                                                    <small className="text-muted">Дата: {pet.date}</small>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <img src={geoIcon} style={{ "width": "20px", "marginRight": "8px" }} alt="Иконка района" />
                                                    <span className="text-muted">Район: {pet.district}</span>
                                                </div>
                                                <br />

                                                {/* Кнопка Подробнее */}
                                                <button
                                                    className="btn btn-primary button-css"
                                                    onClick={() => window.location.href = `/pet/${pet.id}`}
                                                    style={{
                                                        backgroundColor: 'rgb(230, 116, 205)',
                                                        borderColor: 'rgb(235, 152, 177)',
                                                        color: 'white'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = 'rgb(216, 128, 162)';
                                                        e.target.style.borderColor = 'rgb(212, 137, 175)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'rgb(230, 116, 205)';
                                                        e.target.style.borderColor = 'rgb(230, 116, 205)';
                                                    }}
                                                >
                                                    Подробнее
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NewsletterSection onSubmit={handleNewsletterSubmit} />
            <LogoutModal />
            <Footer />
        </div>
    );
};

export default Main;