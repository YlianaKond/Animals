import { API_HOST, BASE_URL } from '../config/api';

class ApiService {
    constructor() {
        this.baseUrl = API_HOST;
        this.token = localStorage.getItem('auth_token');
        this.searchTimeout = null;
    }

    // Метод для поиска пользователя по email
    async findUserByEmail(email) {
        try {
            // Получаем всех пользователей
            const response = await this.request('/users');
            console.log('Поиск пользователя по email:', email);

            // Проверяем разные форматы ответа
            let users = [];
            if (Array.isArray(response)) {
                users = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                users = response.data;
            } else if (response && Array.isArray(response.users)) {
                users = response.users;
            }

            // Ищем пользователя по email
            const user = users.find(u => u.email === email);
            if (user) {
                console.log('Пользователь найден:', user);
                return user;
            }

            console.warn('Пользователь не найден');
            return null;
        } catch (error) {
            console.error('Ошибка поиска пользователя по email:', error);
            return null;
        }
    }

    // Получение имени пользователя
    getStoredUserName() {
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                return userData.name || '';
            } catch (error) {
                console.error('Ошибка при чтении данных пользователя:', error);
            }
        }
        return '';
    }

    // Получение ID пользователя из токена
    getUserIdFromToken() {
        // Просто проверяем сохраненный ID
        const savedUserId = localStorage.getItem('user_id');
        if (savedUserId) {
            return parseInt(savedUserId);
        }
        return null;
    }

    // Получение данных текущего пользователя
    async getCurrentUser() {
        console.log('Получение данных текущего пользователя через /users');
        return this.request('/users');
    }

    // Получение объявлений текущего пользователя
    async getCurrentUserOrders() {
        console.log('Получение объявлений текущего пользователя через /users/orders');
        let result = await this.request('/users/orders');

        // Преобразуем пути изображений
        if (result && result.data && result.data.orders) {
            result.data.orders = result.data.orders.map(order => ({
                ...order,
                photo: order.photo ? this.getImageUrl(order.photo) : null,
                photos: order.photos ? this.getImageUrl(order.photos) : null
            }));
        } else if (Array.isArray(result)) {
            // Если API возвращает напрямую массив
            result = result.map(order => ({
                ...order,
                photo: order.photo ? this.getImageUrl(order.photo) : null,
                photos: order.photos ? this.getImageUrl(order.photos) : null
            }));
        }

        return result;
    }

    // Добавляем метод для получения полного URL изображения
    getImageUrl(imagePath) {
        if (!imagePath) {
            console.warn('Image path is null or undefined');
            return null;
        }

        // Если URL уже полный, возвращаем как есть
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // Очищаем путь от возможных проблем
        const cleanPath = imagePath.trim();

        // Проверяем, что путь начинается со слеша
        if (!cleanPath.startsWith('/')) {
            console.warn('Image path does not start with /:', cleanPath);
            return null;
        }

        // Собираем полный URL
        const fullUrl = `${BASE_URL}${cleanPath}`;

        return fullUrl;
    }

    setToken(token) {
        console.log('setToken: установка токена', token ? 'есть' : 'нет');
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    clearToken() {
        console.log('clearToken: очистка токена');
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_data');
    }

    getHeaders(isFormData = false) {
        const headers = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, method = 'GET', data = null, isFormData = false) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`API ${method} ${url}`, data ? 'с данными' : 'без данных');

        const options = {
            method,
            headers: this.getHeaders(isFormData),
        };

        if (data) {
            if (isFormData) {
                options.body = data;
            } else {
                options.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, options);

            // Handle 204 No Content
            if (response.status === 204) {
                return { success: true };
            }

            const responseData = await response.json();
            console.log(`API ${method} ${url} ответ:`, responseData);

            if (!response.ok) {
                console.error(`API Error ${response.status}:`, responseData);
                const error = new Error(`API Error ${response.status}`);
                error.status = response.status;
                error.data = responseData;
                throw error; // Выбрасываем экземпляр Error
            }

            return responseData;
        } catch (error) {
            console.error(`API Error (${method} ${endpoint}):`, error);
            throw error;
        }
    }

    // Слайдер с животными
    async getPetsSlider(empty = false) {
        const endpoint = empty ? '/pets/slider/empty' : '/pets/slider';
        const result = await this.request(endpoint);

        // Преобразуем пути изображений в полные URL
        if (result && result.data && result.data.pets) {
            result.data.pets = result.data.pets.map(pet => ({
                ...pet,
                image: pet.image ? this.getImageUrl(pet.image) : null
            }));
        }

        return result;
    }

    // Быстрый поиск
    async searchPets(query = '', delay = 1000) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        return new Promise((resolve) => {
            this.searchTimeout = setTimeout(async () => {
                const endpoint = query ? `/search?query=${encodeURIComponent(query)}` : '/search';
                const result = await this.request(endpoint);

                // Преобразуем пути изображений
                if (result && result.data && result.data.orders) {
                    result.data.orders = result.data.orders.map(order => ({
                        ...order,
                        photo: order.photo ? this.getImageUrl(order.photo) : null,
                        photos: order.photos ? this.getImageUrl(order.photos) : null
                    }));
                }

                resolve(result);
            }, delay);
        });
    }

    // Последние найденные животные
    async getRecentPets() {
        const result = await this.request('/pets');

        // Преобразуем пути изображений
        if (result && result.data && result.data.orders) {
            result.data.orders = result.data.orders.map(order => ({
                ...order,
                photo: order.photo ? this.getImageUrl(order.photo) : null,
                photos: order.photos ? this.getImageUrl(order.photos) : null
            }));
        }

        return result;
    }

    // Подписка на новости
    async subscribeToNews(email) {
        return this.request('/subscription', 'POST', { email });
    }

    // Регистрация пользователя
    async register(userData) {
        console.log('Регистрация пользователя:', userData);
        const result = await this.request('/register', 'POST', {
            ...userData,
            confirm: userData.confirm ? 1 : 0
        });

        // Если при регистрации возвращается ID пользователя
        if (result && result.id) {
            localStorage.setItem('user_id', result.id.toString());
            localStorage.setItem('user_data', JSON.stringify(result));
        }

        return result;
    }

    // Авторизация
    async login(email, password) {
        console.log('Логин пользователя:', email);
        const result = await this.request('/login', 'POST', { email, password });
        if (result.data && result.data.token) {
            this.setToken(result.data.token);

            try {
                // Запросим всех пользователей (если это возможно)
                // или получим ID через другой endpoint
                console.log('Пытаемся получить ID пользователя после входа');

                // Если API позволяет поиск по email
                const searchResult = await this.request(`/users?email=${encodeURIComponent(email)}`);

                if (searchResult && searchResult.length > 0) {
                    const user = searchResult[0];
                    localStorage.setItem('user_data', JSON.stringify(user));
                    localStorage.setItem('user_id', user.id.toString());
                    console.log('Пользователь найден по email, ID:', user.id);
                } else {
                    console.log('Пользователь не найден по email, нужно будет получить ID позже');
                }
            } catch (error) {
                console.warn('Не удалось получить пользователя по email, возможно API не поддерживает поиск:', error);
                // Продолжаем без данных пользователя - получим их позже на странице профиля
            }
        }
        return result;
    }

    // Поиск по объявлениям
    async searchOrders(params) {
        const { district, kind } = params;
        let queryString = '';
        const paramsArray = [];

        if (district) paramsArray.push(`district=${encodeURIComponent(district)}`);
        if (kind) paramsArray.push(`kind=${encodeURIComponent(kind)}`);

        if (paramsArray.length > 0) {
            queryString = `?${paramsArray.join('&')}`;
        }

        const result = await this.request(`/search/order${queryString}`);

        // Преобразуем пути изображений
        if (result && result.data && result.data.orders) {
            result.data.orders = result.data.orders.map(order => ({
                ...order,
                photo: order.photo ? this.getImageUrl(order.photo) : null,
                photos: order.photos ? this.getImageUrl(order.photos) : null
            }));
        }

        return result;
    }

    // Получение информации о пользователе
    async getUserProfile(userId) {
        return this.request(`/users/${userId}`);
    }

    // Обновление телефона
    async updatePhone(userId, phone) {
        return this.request(`/users/phone`, 'PATCH', { phone });
    }

    // Обновление email
    async updateEmail(userId, email) {
        return this.request(`/users/email`, 'PATCH', { email });
    }

    // Объявления пользователя
    async getUserOrders() {
        return this.getCurrentUserOrders();
    }

    // Удаление объявления
    async deleteOrder(orderId) {
        return this.request(`/users/orders/${orderId}`, 'DELETE');
    }

    // Редактирование объявления
    async updateOrder(orderId, formData) {
        return this.request(`/pets/${orderId}`, 'POST', formData, true);
    }

    // Получение карточки животного
    async getPetDetails(petId) {
        const result = await this.request(`/pets/${petId}`);

        // Преобразуем пути изображений
        if (result && result.data && result.data.pet && result.data.pet.length > 0) {
            const pet = result.data.pet[0];
            if (pet.photos && Array.isArray(pet.photos)) {
                pet.photos = pet.photos.map(photo =>
                    photo ? this.getImageUrl(photo) : null
                );
            }
        }

        return result;
    }

    // Добавление нового объявления - БЕЗ авторизации!
    async createOrder(formData) {
        return this.request('/pets', 'POST', formData, true);
    }


}

const apiService = new ApiService();
export default apiService;