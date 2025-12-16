import React from 'react';

const DeleteAdModal = ({ ad, show, onClose, onDelete }) => {
    if (!show) return null;

    return (
        <div className="modal fade show d-flex align-items-center justify-content-center" style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
        }}>
            <div className="modal-dialog" style={{
                maxWidth: '400px',
                width: '90%',
                margin: 'auto'
            }}>
                <div className="modal-content">
                    <div className="modal-body p-4">
                        <div className='card-body text-center'>
                            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                            <h3 className="card-title mt-3 mb-2">Вы уверены, что хотите удалить объявление?</h3>
                            <p className="text-muted mb-2">ID: {ad.id}, Название: {ad.title}</p>
                            <p className="text-muted mb-4">Это действие нельзя отменить.</p>

                            {/* Кнопки в одной строке с адаптивностью */}
                            <div className="row g-2 justify-content-center">
                                <div className="col-sm-6 d-grid">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onClose}
                                    >
                                        Отмена
                                    </button>
                                </div>
                                <div className="col-sm-6 d-grid">
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            onDelete(ad.id);
                                            onClose();
                                        }}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAdModal;