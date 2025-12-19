// edit-ad-modal.jsx
import React, { useState } from 'react';

const EditAdModal = ({ ad, show, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        photos: [null, null, null],
        mark: ad.mark || '',
        description: ad.description || ''
    });

    const handleFileChange = (index, e) => {
        const file = e.target.files[0];
        const newPhotos = [...formData.photos];
        newPhotos[index] = file;
        setFormData({ ...formData, photos: newPhotos });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

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
                maxWidth: '500px',
                width: '90%',
                margin: 'auto'
            }}>
                <div className="modal-content">
                    <div className="modal-body p-4">
                        <div className='card-body'>
                            <h3 className="card-title text-center mb-4">Изменить объявление</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="editPhoto1" className="form-label">Фото 1 (обязательное)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="editPhoto1"
                                        accept="image/png"
                                        onChange={(e) => handleFileChange(0, e)}
                                        required
                                    />
                                    <div className="form-text">Загрузите фотографию в формате PNG.</div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editPhoto2" className="form-label">Фото 2</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="editPhoto2"
                                        accept="image/png"
                                        onChange={(e) => handleFileChange(1, e)}
                                    />
                                    <div className="form-text">Загрузите фотографию в формате PNG.</div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editPhoto3" className="form-label">Фото 3</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="editPhoto3"
                                        accept="image/png"
                                        onChange={(e) => handleFileChange(2, e)}
                                    />
                                    <div className="form-text">Загрузите фотографию в формате PNG.</div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editMark" className="form-label">Метка/клеймо</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="editMark"
                                        value={formData.mark}
                                        onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editDescription" className="form-label">Описание</label>
                                    <textarea
                                        className="form-control"
                                        id="editDescription"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                {/* Кнопки в одной строке */}
                                <div className="row g-2 justify-content-center mt-4">
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
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{
                                                backgroundColor: 'rgb(175, 98, 140)',
                                                borderColor: 'rgb(175, 98, 140)',
                                                color: 'white',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = 'rgb(175, 98, 140)';
                                                e.target.style.borderColor = 'rgb(175, 98, 140)';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'rgb(175, 98, 140)';
                                                e.target.style.borderColor = 'rgb(175, 98, 140)';
                                                e.target.style.color = 'white';
                                            }}
                                        >
                                            Сохранить
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAdModal;