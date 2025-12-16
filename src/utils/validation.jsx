// src/utils/validation.jsx
export const validationRules = {
    name: {
        pattern: /^[а-яА-ЯёЁ\s-]+$/,
        message: 'Имя должно содержать только кириллицу, пробелы и дефисы'
    },
    phone: {
        pattern: /^\+?[0-9\s\-()]+$/, // Убраны escape-символы для скобок
        message: 'Некорректный номер телефона'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Некорректный email'
    },
    password: {
        pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}$/,
        message: 'Пароль должен содержать минимум 7 символов, 1 цифру, 1 строчную и 1 заглавную букву'
    }
};

export const validateField = (field, value) => {
    const rule = validationRules[field];
    if (!rule) return { isValid: true };

    return {
        isValid: rule.pattern.test(value),
        message: rule.message
    };
};

export const validateForm = (formData, rules) => {
    const errors = {};

    Object.keys(rules).forEach(field => {
        const validation = validateField(field, formData[field]);
        if (!validation.isValid) {
            errors[field] = validation.message;
        }
    });

    return errors;
};

export const formatPhoneNumber = (phone) => {
    return phone.replace(/\D/g, '');
};