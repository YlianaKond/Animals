import React from 'react';

const AdvancedSearch = ({
    districts = [],
    searchParams,
    onSearchParamChange,
    onSearch,
    onReset,
    loading = false
}) => {
    const defaultDistricts = [
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

    const districtsList = districts.length > 0 ? districts : defaultDistricts;

    const handleDistrictChange = (e) => {
        onSearchParamChange({ district: e.target.value });
    };

    const handleAnimalTypeChange = (e) => {
        onSearchParamChange({ animalType: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    const handleReset = () => {
        onReset();
    };

    return (
        <div className="advanced-search-section">
            <div className='card-body'>
                <form id="advancedSearchForm" onSubmit={handleSubmit}>
                    <div className="d-flex gap-3">
                        <div className="flex-grow-1">
                            <label htmlFor="districtSearch" className="form-label fw-bold">Район Санкт-Петербурга</label>
                            <select
                                className="form-select"
                                id="districtSearch"
                                value={searchParams.district || ''}
                                onChange={handleDistrictChange}
                            >
                                <option value="">---</option>
                                {districtsList.map((district, index) => (
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
                                value={searchParams.animalType || ''}
                                onChange={handleAnimalTypeChange}
                            />
                        </div>
                    </div>
                    <br />
                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-search btn-primary button-css"
                            style={{
                                backgroundColor: 'rgb(218, 125, 140)',
                                borderColor: 'rgb(218, 125, 140)'
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Поиск...
                                </>
                            ) : (
                                <>
                                    Найти объявления
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Сбросить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdvancedSearch;