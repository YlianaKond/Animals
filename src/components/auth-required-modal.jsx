import React from 'react';

const AuthRequiredModal = () => {
    return (
        <div className="modal fade" id="authRequiredModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title h5" id="authRequiredModalLabel">Требуется авторизация</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                    </div>
                    <div className="modal-body">
                        <div className="text-center">
                            <i className="bi bi-shield-lock text-primary" style={{ fontSize: '3rem' }} aria-hidden="true"></i>
                            <h3 className="h5 mt-3">Доступ запрещен</h3>
                            <p className="text-muted">Для просмотра личного кабинета необходимо войти в систему.</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <a href="/register" className="btn btn-primary">
                            <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i>Войти
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthRequiredModal;