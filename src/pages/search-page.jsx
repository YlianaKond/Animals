import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LogoutModal from '../components/logout-modal';
import ApiService from '../services/api';
import placeholderImage from '../assets/images/placeholder.svg';
import date from '../assets/images/icon_calendary.png';
import geo from '../assets/images/icon_district.png';
import QuickSearch from '../components/quick-search';

const SearchPage = () => {
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

    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        district: '',
        animalType: ''
    });
    const [activeTab, setActiveTab] = useState('quick'); // 'quick' или 'advanced'
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [quickSearchQuery, setQuickSearchQuery] = useState(''); // Отдельное поле для быстрого поиска
    const [advancedSearchQuery, setAdvancedSearchQuery] = useState(''); // Отдельное поле для расширенного поиска
    const [columnsPerRow, setColumnsPerRow] = useState(4);
    const pageSize = 8;

    const districts = [
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
    ];

    const updateColumnsPerRow = useCallback(() => {
        const width = window.innerWidth;

        if (width >= 1200) {
            setColumnsPerRow(4);
        } else if (width >= 992) {
            setColumnsPerRow(3);
        } else if (width >= 768) {
            setColumnsPerRow(2);
        } else {
            setColumnsPerRow(1);
        }
    }, []);

    useEffect(() => {
        updateColumnsPerRow();
        window.addEventListener('resize', updateColumnsPerRow);
        return () => {
            window.removeEventListener('resize', updateColumnsPerRow);
        };
    }, [updateColumnsPerRow]);

    const getColumnWidth = () => {
        return `${100 / columnsPerRow}%`;
    };

    const getQueryParams = useCallback(() => {
        const params = new URLSearchParams(location.search);
        return {
            animalType: params.get('animalType') || params.get('kind') || '',
            district: params.get('district') || '',
            description: params.get('description') || ''
        };
    }, [location.search]);

    const loadAllOrders = useCallback(async (page) => {
        setLoading(true);
        try {
            const response = await ApiService.searchOrders({});
            if (response && response.data && response.data.orders) {
                const allResults = response.data.orders;

                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedResults = allResults.slice(startIndex, endIndex);

                setResults(paginatedResults);
                setTotalCount(allResults.length);
                setTotalPages(Math.ceil(allResults.length / pageSize));
            } else {
                setResults([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Ошибка при загрузке объявлений:', error);
            setResults([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const performSearch = useCallback(async (page, params, searchType = 'advanced') => {
        setLoading(true);
        setCurrentPage(page);

        try {
            if (!params.animalType && !params.district && !params.description) {
                await loadAllOrders(page);
                return;
            }

            let response;
            if (searchType === 'quick' && params.description) {
                // Для быстрого поиска ищем по описанию
                response = await ApiService.searchOrders({});
                if (response && response.data && response.data.orders) {
                    const allResults = response.data.orders;
                    const queryLower = params.description.toLowerCase();
                    const filteredResults = allResults.filter(order => {
                        const description = order.description || '';
                        return description.toLowerCase().includes(queryLower);
                    });

                    const startIndex = (page - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedResults = filteredResults.slice(startIndex, endIndex);

                    setResults(paginatedResults);
                    setTotalCount(filteredResults.length);
                    setTotalPages(Math.ceil(filteredResults.length / pageSize));
                } else {
                    setResults([]);
                    setTotalCount(0);
                    setTotalPages(0);
                }
            } else {
                // Для расширенного поиска используем стандартный запрос
                response = await ApiService.searchOrders({
                    kind: params.animalType,
                    district: params.district
                });

                if (response && response.data && response.data.orders) {
                    const allResults = response.data.orders;

                    const startIndex = (page - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedResults = allResults.slice(startIndex, endIndex);

                    setResults(paginatedResults);
                    setTotalCount(allResults.length);
                    setTotalPages(Math.ceil(allResults.length / pageSize));
                } else {
                    setResults([]);
                    setTotalCount(0);
                    setTotalPages(0);
                }
            }
        } catch (error) {
            console.error('Ошибка при поиске:', error);
            setResults([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [loadAllOrders]);

    useEffect(() => {
        const queryParams = getQueryParams();
        const newSearchParams = {
            animalType: queryParams.animalType,
            district: queryParams.district,
            description: queryParams.description
        };

        setSearchParams(newSearchParams);
        setAdvancedSearchQuery(queryParams.animalType);
        setQuickSearchQuery(queryParams.description || '');

        if (queryParams.animalType || queryParams.district || queryParams.description) {
            const searchType = queryParams.description ? 'quick' : 'advanced';
            performSearch(1, newSearchParams, searchType);
        } else {
            loadAllOrders(1);
        }
    }, [location.search, getQueryParams, performSearch, loadAllOrders]);

    useEffect(() => {
        // Подсказки только для быстрого поиска (по описанию)
        if (quickSearchQuery.length > 2 && activeTab === 'quick') {
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

                        const formattedSuggestions = matchedOrders.map(order => ({
                            id: order.id,
                            kind: order.kind || '',
                            description: order.description || '',
                            district: '',
                            photo: order.photo || order.photos || null
                        }))
                            .filter(suggestion => suggestion.description.trim() !== '')
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
    }, [quickSearchQuery, activeTab]);

    const handleQuickSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (quickSearchQuery) params.append('description', quickSearchQuery);

        navigate(`/search?${params.toString()}`);
        performSearch(1, { description: quickSearchQuery }, 'quick');
    };

    const handleAdvancedSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (searchParams.animalType) params.append('kind', searchParams.animalType);
        if (searchParams.district) params.append('district', searchParams.district);

        navigate(`/search?${params.toString()}`);
        performSearch(1, searchParams, 'advanced');
    };

    const handleReset = () => {
        setSearchParams({ district: '', animalType: '' });
        setQuickSearchQuery('');
        setAdvancedSearchQuery('');
        setCurrentPage(1);

        navigate('/search');
        loadAllOrders(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);

        const queryParams = getQueryParams();
        const searchType = queryParams.description ? 'quick' : 'advanced';

        if (queryParams.description || queryParams.animalType || queryParams.district) {
            performSearch(page, {
                animalType: queryParams.animalType,
                district: queryParams.district,
                description: queryParams.description
            }, searchType);
        } else {
            loadAllOrders(page);
        }
    };

    const handleQuickSearchInputChange = (value) => {
        setQuickSearchQuery(value);
    };

    const handleAdvancedSearchInputChange = (e) => {
        const value = e.target.value;
        setAdvancedSearchQuery(value);
        setSearchParams(prev => ({ ...prev, animalType: value }));
    };

    const handleSuggestionSelect = (suggestion) => {
        setQuickSearchQuery(suggestion.description);

        // Выполняем поиск сразу при выборе подсказки
        const params = new URLSearchParams();
        if (suggestion.description) params.append('description', suggestion.description);

        navigate(`/search?${params.toString()}`);
        performSearch(1, { description: suggestion.description }, 'quick');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return dateString;
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        const paginationStyle = {
            '--bs-pagination-color': 'rgb(0, 0, 0)',
            '--bs-pagination-bg': '#fff',
            '--bs-pagination-border-color': '#dee2e6',
            '--bs-pagination-hover-color': '#fff',
            '--bs-pagination-hover-bg': 'rgb(57, 80, 51)',
            '--bs-pagination-hover-border-color': 'rgb(0, 0, 0)',
            '--bs-pagination-focus-color': '#fff',
            '--bs-pagination-focus-bg': 'rgb(0, 0, 0)',
            '--bs-pagination-focus-box-shadow': '0 0 0 0.25rem rgba(91, 160, 74, 0.25)',
            '--bs-pagination-active-color': '#fff',
            '--bs-pagination-active-bg': 'rgb(0, 0, 0)',
            '--bs-pagination-active-border-color': 'rgb(0, 0, 0)',
            '--bs-pagination-disabled-color': '#6c757d',
            '--bs-pagination-disabled-bg': '#fff',
            '--bs-pagination-disabled-border-color': '#dee2e6',
        };

        if (startPage > 1) {
            pages.push(
                <li key="first" className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(1)}>
                        1
                    </button>
                </li>
            );
            if (startPage > 2) {
                pages.push(
                    <li key="dots1" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i)}>
                        {i}
                    </button>
                </li>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <li key="dots2" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
            pages.push(
                <li key="last" className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                    </button>
                </li>
            );
        }

        return (
            <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center" style={paginationStyle}>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            &laquo;
                        </button>
                    </li>
                    {pages}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div>
            <Header />
            <br />

            <div className="container mt-4">
                <div className="search-filters card mb-4" style={{ overflow: 'visible' }}>
                    <div className="card-body mt-2" style={{ position: 'relative', overflow: 'visible' }}>
                        {/* Кнопки переключения между видами поиска */}
                        <div className="d-flex justify-content-center mb-4">

                            <div className="btn-group" role="group" aria-label="Search type">
                                <button
                                    type="button"
                                    className={`btn ${activeTab === 'quick' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('quick')}
                                    style={activeTab === 'quick' ? {
                                        ...primaryButtonStyle,
                                        minWidth: '150px'
                                    } : {
                                        backgroundColor: 'white',
                                        borderColor: 'rgb(0, 0, 0)',
                                        color: 'rgb(0, 0, 0)',
                                        minWidth: '150px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeTab !== 'quick') {
                                            e.target.style.backgroundColor = 'rgb(0, 0, 0)';
                                            e.target.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeTab !== 'quick') {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = 'rgb(0, 0, 0)';
                                        }
                                    }}
                                >
                                    Быстрый поиск
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${activeTab === 'advanced' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('advanced')}
                                    style={activeTab === 'advanced' ? {
                                        ...primaryButtonStyle,
                                        minWidth: '150px'
                                    } : {
                                        backgroundColor: 'white',
                                        borderColor: 'rgb(0, 0, 0)',
                                        color: 'rgb(0, 0, 0)',
                                        minWidth: '150px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeTab !== 'advanced') {
                                            e.target.style.backgroundColor = 'rgb(0, 0, 0)';
                                            e.target.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeTab !== 'advanced') {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = 'rgb(0, 0, 0)';
                                        }
                                    }}
                                >
                                    Расширенный поиск
                                </button>
                            </div>
                        </div>

                        {/* Быстрый поиск */}
                        {activeTab === 'quick' && (
                            <div className="quick-search-section">
                                <QuickSearch
                                    initialValue={getQueryParams().description || ''}
                                    showTitle={false}
                                />
                            </div>
                        )}

                        {/* Расширенный поиск */}
                        {activeTab === 'advanced' && (
                            <div className="advanced-search-section">
                                <div className='card-body'>
                                    <form id="advancedSearchForm" onSubmit={handleAdvancedSearch}>
                                        <div className="d-flex gap-3">
                                            <div className="flex-grow-1">
                                                <label htmlFor="districtSearch" className="form-label fw-bold">Район Санкт-Петербурга</label>
                                                <select
                                                    className="form-select"
                                                    id="districtSearch"
                                                    value={searchParams.district}
                                                    onChange={(e) => setSearchParams({ ...searchParams, district: e.target.value })}
                                                >
                                                    <option value="">---</option>
                                                    {districts.map((district, index) => (
                                                        <option key={index} value={district}>
                                                            {district}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex-grow-1">
                                                <label htmlFor="animalTypeSearch" className="form-label fw-bold">Вид животного</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="animalTypeSearch"
                                                    placeholder="Кошка, собака, попугай"
                                                    value={advancedSearchQuery}
                                                    onChange={handleAdvancedSearchInputChange}
                                                />
                                            </div>
                                        </div>
                                        <br />
                                        <div className="d-flex gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-search btn-primary button-css"
                                                style={{
                                                    backgroundColor: 'rgb(226, 157, 186)',
                                                    borderColor: 'rgb(226, 157, 186)'
                                                }}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                        Поиск...
                                                    </>
                                                ) : (
                                                    'Найти объявления'
                                                )}
                                            </button>

                                            <button type="button" className="btn btn-outline-secondary" onClick={handleReset} disabled={loading}>
                                                Сбросить
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <br />
                <h1>
                    <div className='card-title text-center mb-4'>
                        Найдено объявлений:
                        <span style={{ color: 'rgb(226, 157, 186)' }}> {totalCount}</span>
                    </div>
                </h1>
                <br />
                {loading && (
                    <div className="loading-spinner text-center py-5">
                        <div className="spinner-border" role="status" style={{
                            width: '3rem',
                            height: '3rem',
                            color: 'rgb(226, 157, 186)'
                        }}>
                            <span className="visually-hidden">Загрузка...</span>
                        </div>
                        <p className="mt-3">Загрузка объявлений...</p>
                    </div>
                )}

                {!loading && (
                    <>
                        {results.length === 0 ? (
                            <div className="no-results text-center py-5">
                                <i className="bi bi-search" style={{ fontSize: '4rem', color: 'rgb(226, 157, 186)' }}></i>
                                <h4 className="mt-3">Ничего не найдено</h4>
                                <p className="text-muted">Попробуйте изменить параметры поиска</p>
                                <button
                                    className="btn btn-primary mt-2"
                                    style={{
                                        backgroundColor: 'rgb(226, 157, 186)',
                                        borderColor: 'rgb(226, 157, 186)'
                                    }}
                                    onClick={handleReset}
                                >
                                    Показать все объявления
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="search-results-grid">
                                    {results.map(ad => (
                                        <div
                                            key={ad.id || ad._id}
                                            className="search-result-item"
                                            style={{ width: getColumnWidth() }}
                                        >
                                            <div className="card h-100">
                                                <div className="position-relative">
                                                    <img
                                                        src={ad.photo || ad.photos || ad.image || placeholderImage}
                                                        className="card-img-top"
                                                        alt={ad.kind || 'Животное'}
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.src = placeholderImage;
                                                            e.target.style.objectFit = 'contain';
                                                        }}
                                                    />

                                                </div>

                                                <div className="card-body d-flex flex-column">
                                                    <h3 className="card-title">{ad.kind || 'Не указан вид'}</h3>
                                                    <p className="card-text flex-grow-1">
                                                        {ad.description && ad.description.length > 100
                                                            ? `${ad.description.substring(0, 100)}...`
                                                            : ad.description || 'Описание отсутствует'}
                                                    </p>

                                                    <div className="card-icons-container">
                                                        {ad.date && (
                                                            <div className="mb-1 d-flex align-items-center">
                                                                <img
                                                                    src={date}
                                                                    className="icon-img"
                                                                    alt="Иконка календаря"
                                                                />
                                                                <small className="icon-text">Дата: {formatDate(ad.date)}</small>
                                                            </div>
                                                        )}
                                                        {ad.district && (
                                                            <div className="mb-1 d-flex align-items-center">
                                                                <img
                                                                    src={geo}
                                                                    className="icon-img"
                                                                    alt="Иконка района"
                                                                />
                                                                <small className="icon-text">Район: {ad.district}</small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    className="btn btn-primary button-css float-end m-2 btn-css"
                                                    href={`/pet/${ad.id || ad._id}`}
                                                >
                                                    Подробнее
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {renderPagination()}
                            </>
                        )}
                    </>
                )}
            </div>
            <br />
            <br />
            <LogoutModal />
            <Footer />
        </div>
    );
};

export default SearchPage;