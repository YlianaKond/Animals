class AuthService {
    static isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        console.log('AuthService.isAuthenticated():', token ? 'ЕСТЬ токен' : 'НЕТ токена');
        return !!token;
    }

    static getUserData() {
        try {
            const userDataStr = localStorage.getItem('user_data');
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            return userData;
        } catch (error) {
            console.error('Ошибка при чтении user_data:', error);
            return null;
        }
    }

    static getUserName() {
        const userData = this.getUserData();
        if (userData) {
            return userData.name || userData.email || '';
        }
        return '';
    }

    static getUserId() {
        const userData = this.getUserData();
        return userData ? userData.id : null;
    }

    static getToken() {
        return localStorage.getItem('auth_token');
    }

    static logout() {
        console.log('AuthService.logout()');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        // Отправляем событие для обновления компонентов
        const authChangeEvent = new Event('authChange');
        window.dispatchEvent(authChangeEvent);
    }

    static login(token, userData) {
        console.log('AuthService.login(): сохранение токена и данных пользователя');
        localStorage.setItem('auth_token', token);
        if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
            if (userData.id) {
                localStorage.setItem('user_id', userData.id.toString());
            }
        }
        // Отправляем событие для обновления компонентов
        const authChangeEvent = new Event('authChange');
        window.dispatchEvent(authChangeEvent);
    }

    static updateUserData(newData) {
        try {
            const currentData = this.getUserData() || {};
            const updatedData = { ...currentData, ...newData };
            localStorage.setItem('user_data', JSON.stringify(updatedData));
            const userDataUpdateEvent = new Event('userDataUpdate');
            window.dispatchEvent(userDataUpdateEvent);
            return updatedData;
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
            return null;
        }
    }

    // НОВЫЕ МЕТОДЫ ДЛЯ ДОБАВЛЕНИЯ ОБЪЯВЛЕНИЙ

    static setToken(token) {
        console.log('AuthService.setToken(): установка токена', token ? 'есть' : 'нет');
        localStorage.setItem('auth_token', token);
        // Отправляем событие для обновления компонентов
        const authChangeEvent = new Event('authChange');
        window.dispatchEvent(authChangeEvent);
    }

    static saveUserData(userData) {
        console.log('AuthService.saveUserData(): сохранение данных пользователя:', userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (userData.id) {
            localStorage.setItem('user_id', userData.id.toString());
        }
        // Отправляем событие для обновления компонентов
        const userDataUpdateEvent = new Event('userDataUpdate');
        window.dispatchEvent(userDataUpdateEvent);
    }

    // Метод для автоматического входа после регистрации через форму добавления объявления
    static loginAfterRegistration(token, formData) {
        console.log('AuthService.loginAfterRegistration(): автоматический вход после регистрации');

        // Сохраняем токен
        localStorage.setItem('auth_token', token);

        // Создаем объект пользователя из данных формы
        const userData = {
            name: formData.name || '',
            email: formData.email || '',
            phone: formData.phone || '',
            // ID будет получен позже из API, временно используем email как идентификатор
            id: formData.email || Date.now()
        };

        // Сохраняем данные пользователя
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('user_id', userData.id.toString());

        console.log('Автоматический вход выполнен. Данные пользователя:', userData);

        // Отправляем событие для обновления компонентов
        const authChangeEvent = new Event('authChange');
        window.dispatchEvent(authChangeEvent);
    }

    // Метод для проверки, нужно ли показывать модальное окно с паролем для авторизованных пользователей
    static shouldShowPasswordModal() {
        return this.isAuthenticated();
    }

    // Метод для очистки только данных пользователя (без токена)
    static clearUserData() {
        console.log('AuthService.clearUserData(): очистка данных пользователя');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');

        const userDataUpdateEvent = new Event('userDataUpdate');
        window.dispatchEvent(userDataUpdateEvent);
    }

    // Метод для полной очистки (аналогично logout)
    static clearAll() {
        this.logout();
    }

    // Метод для проверки наличия email в localStorage (для предзаполнения форм)
    static getStoredEmail() {
        return localStorage.getItem('user_email');
    }

    // Метод для сохранения email (например, после успешной регистрации)
    static saveEmail(email) {
        if (email) {
            localStorage.setItem('user_email', email);
        }
    }

    // Метод для получения статуса регистрации (нужен для формы добавления объявления)
    static getRegistrationStatus() {
        return {
            isAuthenticated: this.isAuthenticated(),
            userData: this.getUserData(),
            hasEmail: !!localStorage.getItem('user_email')
        };
    }

}

export default AuthService;