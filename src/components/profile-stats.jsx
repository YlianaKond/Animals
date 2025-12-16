// src/components/profile-stats.jsx
import React from 'react';
import Text from '../components/Text';

const ProfileStats = ({ adsCount, petsCount, userName, daysCount, phone, email, dateR }) => {

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

    return (
        <div className="card-body">
            <Text value="Статистика" />
            <div className="d-flex justify-content-between"></div>
            <div className='card' style={{
                backgroundColor: 'white',
                minHeight: '130px',
                maxHeight: '130px',
                position: 'relative',
                color: 'black',
            }}>
                <div className='card-body' style={{ padding: '1rem' }}>
                    <div className="d-flex justify-content-between mb-2">
                        <span>Объявлений создано:</span>
                        <span>
                            <small>{adsCount}</small>
                        </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                        <span>Дата регистрации:</span>
                        <span>
                            <small>{formatDate(dateR)}</small>
                        </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                        <span>Зарегистрирован:</span>
                        <span>
                            <small>{daysCount}</small> {getDaysText(daysCount)}
                        </span>
                    </div>
                </div>
            </div>


        </div>
    );
};

// Вспомогательная функция для правильного склонения слова "день"
const getDaysText = (days) => {
    if (days % 10 === 1 && days % 100 !== 11) return 'день';
    if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) return 'дня';
    return 'дней';
};

export default ProfileStats;