// src/components/user-id-fetcher.jsx
import React, { useEffect } from 'react';
import ApiService from '../services/api';

const UserIdFetcher = ({ onUserIdFetched }) => {
    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            // Проверяем, есть ли уже user_id
            const existingUserId = localStorage.getItem('user_id');
            if (existingUserId) {
                onUserIdFetched(parseInt(existingUserId));
                return;
            }

            try {
                // Получаем всех пользователей
                const users = await ApiService.request('/users');
                console.log('Все пользователи для поиска:', users);

                // Ищем текущего пользователя по email (нужно где-то его сохранить)
                const userEmail = localStorage.getItem('user_email');
                if (userEmail && Array.isArray(users)) {
                    const currentUser = users.find(u => u.email === userEmail);
                    if (currentUser) {
                        localStorage.setItem('user_id', currentUser.id.toString());
                        localStorage.setItem('user_data', JSON.stringify(currentUser));
                        onUserIdFetched(currentUser.id);
                    }
                }
            } catch (error) {
                console.error('Ошибка при получении user_id:', error);
            }
        };

        fetchUserId();
    }, [onUserIdFetched]);

    return null;
};

export default UserIdFetcher;