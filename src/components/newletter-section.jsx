// src/components/newsletter-section.jsx
import React, { useState } from 'react';

const NewsletterSection = ({ onSubmit }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('success');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Базовая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setMessage('Пожалуйста, введите корректный email адрес');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            if (onSubmit) {
                const result = await onSubmit(email);

                if (result.success) {
                    setMessage(result.message || 'Вы успешно подписались на рассылку!');
                    setMessageType('success');
                    setEmail('');
                } else {
                    setMessage(result.message || 'Ошибка при подписке');
                    setMessageType('error');
                }
            } else {
                // Fallback если onSubmit не передан
                setTimeout(() => {
                    setMessage('Вы успешно подписались на рассылку!');
                    setMessageType('success');
                    setEmail('');
                    setLoading(false);
                }, 1000);
            }
        } catch (error) {
            setMessage('Ошибка при подключении к серверу');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="newsletter-section">
            <br />
            <br />
            <div className="container">
                {/* Исправлено: убраны неправильные CSS свойства из inline-стилей */}
                <h1 style={{ textAlign: "center" }}>Подпишитесь на рассылку</h1>
                <br />
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-9">
                        {message && (
                            <div
                                className={`alert text-center mt-3 ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`}
                                role="alert"
                            >
                                {messageType === 'success' && (
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                )}
                                {messageType === 'error' && (
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                )}
                                <span>{message}</span>
                            </div>
                        )}
                        <form id="newsletterForm" onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Введите ваш email"
                                    aria-label="Email"
                                    id="emailInput"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-3">
                                <div id="emailHelp" className="form-text">Мы ни с кем не делимся вашей почтой.</div>
                            </div>
                            <button
                                className="btn btn-primary button-css"
                                type="submit"
                                id="subscribeBtn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner" aria-hidden="true"></span>
                                        <span className="visually-hidden">Загрузка...</span>
                                    </>
                                ) : (
                                    'Подписаться'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <br />
            <br />
            <br />
        </section>
    );
};

export default NewsletterSection;