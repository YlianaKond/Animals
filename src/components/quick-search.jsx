// src/components/quick-search.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import Text from '../components/Text';

const QuickSearch = ({ initialValue = '', showTitle = true, className = '' }) => {
    const [quickSearchQuery, setQuickSearchQuery] = useState(initialValue);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const navigate = useNavigate();

    // Debounce поиск для подсказок
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
    }, [quickSearchQuery]);

    // Функция обработки быстрого поиска
    const handleQuickSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (quickSearchQuery) params.append('description', quickSearchQuery);

        navigate(`/search?${params.toString()}`);
    };

    // Функция обработки изменения ввода
    const handleQuickSearchInputChange = (value) => {
        setQuickSearchQuery(value);
    };

    // Функция обработки выбора подсказки
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

    return (
        <div className={`quick-search-section ${className}`}>
            {showTitle && (
                <>
                    <br />
                    <Text value={'Найдите своё животное'} />
                    <br />
                </>
            )}
            <form id="quickSearchForm" onSubmit={handleQuickSearch}>
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        id="quickSearchInput"
                        placeholder="Поиск по описанию..."
                        value={quickSearchQuery}
                        onChange={(e) => handleQuickSearchInputChange(e.target.value)}
                        autoComplete="off"
                        style={{
                            fontSize: '1rem',
                            height: 'auto'
                        }}
                    />
                </div>
                {quickSearchQuery.length >= 3 && searchSuggestions.length > 0 && (
                    <div className="suggestions-dropdown border rounded shadow-sm mt-1">
                        {searchSuggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.id}-${index}`}
                                className="suggestion-item p-3 border-bottom"
                                onClick={() => handleSuggestionSelect(suggestion)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    backgroundColor: '#fff'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                }}
                            >
                                <div className="suggestion-text">
                                    <div className="description-text" style={{ lineHeight: '1.4', color: '#333' }}>
                                        {/* Отображаем в нижнем регистре */}
                                        {suggestion.description.length > 100
                                            ? `${suggestion.description.substring(0, 100)}...`
                                            : suggestion.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
};

export default QuickSearch;