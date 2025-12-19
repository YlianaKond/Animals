// src/components/user-ads.jsx
import React, { useState } from 'react';
import EditAdModal from '../components/edit-ad-modal';
import DeleteAdModal from '../components/delete-ad-modal';
import placeholderImage from '../assets/images/placeholder.svg';
import date from '../assets/images/icon_calendary.png';
import geo from '../assets/images/icon_district.png';

const UserAds = ({ ads, onAdUpdate, onAdDelete, getStatusClass, getStatusStyle }) => {
    const [editingAd, setEditingAd] = useState(null);
    const [deletingAd, setDeletingAd] = useState(null);

    const handleEditClick = (ad) => {
        setEditingAd(ad);
    };

    const handleDeleteClick = (ad) => {
        setDeletingAd(ad);
    };

    const handleSaveEdit = (updatedData) => {
        if (editingAd && onAdUpdate) {
            onAdUpdate(editingAd.id, updatedData);
        }
        setEditingAd(null);
    };

    const handleConfirmDelete = (adId) => {
        if (onAdDelete) {
            onAdDelete(adId);
        }
        setDeletingAd(null);
    };

    return (
        <section className="tab-pane fade show active" id="ads" role="tabpanel" aria-labelledby="ads-tab">
            {ads.length === 0 ? (
                <div className="text-center py-5">
                    <h1 className="mt-3" style={{ color: 'white' }}>У вас нет объявлений</h1>
                    <p className="text-muted">Создайте хотя бы одно объявление о найденном животном</p>
                </div>
            ) : (
                <div className="row g-4"> {/* Используем g-4 для автоматических отступов */}
                    {ads.map(ad => (
                        <div key={ad.id} className="col-12 col-lg-4">
                            <div className="card h-100 " style={{ border: 'none' }}>
                                {/* Контейнер для картинки с position-relative */}
                                <div className="position-relative">
                                    <img
                                        src={ad.photo || ad.photos || placeholderImage}
                                        className="card-img-top"
                                        alt={ad.kind}
                                        style={{
                                            height: '200px',
                                            objectFit: 'cover',
                                            width: '100%'
                                        }}
                                        onError={(e) => {
                                            e.target.src = placeholderImage;
                                            e.target.style.objectFit = 'contain';
                                        }}
                                    />

                                    {/* Бейдж теперь внутри position-relative контейнера и поверх картинки */}
                                    <div className="position-absolute bottom-0 end-0 m-2">
                                        <span
                                            className="badge p-2 shadow"
                                            style={getStatusStyle ? getStatusStyle(ad.status) : {}}
                                        >
                                            {ad.statusText}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body d-flex flex-column">
                                    <h3 className="card-title">{ad.kind}</h3>
                                    <p className="card-text flex-grow-1">
                                        {ad.description && ad.description.length > 80
                                            ? `${ad.description.substring(0, 80)}...`
                                            : ad.description}
                                    </p>

                                    {ad.date && (
                                        <div className="mb-1 d-flex align-items-center">
                                            <img src={date} style={{ width: "20px", marginRight: "8px" }} alt="Иконка календаря" />
                                            <small className="text-muted">Дата: {ad.date}</small>
                                        </div>
                                    )}
                                    {ad.district && (
                                        <div className="mb-1 d-flex align-items-center">
                                            <img src={geo} style={{ width: "20px", marginRight: "8px" }} alt="Иконка района" />
                                            <small className="text-muted">Район: {ad.district}</small>
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 w-100 mt-3">
                                        <button
                                            className="btn btn-outline-danger btn-sm flex-grow-1"
                                            onClick={() => handleDeleteClick(ad)}
                                            style={{
                                                borderColor: 'rgb(220, 53, 69)',
                                                color: 'rgb(220, 53, 69)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = 'rgb(220, 53, 69)';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = '';
                                                e.target.style.color = 'rgb(220, 53, 69)';
                                            }}
                                        >
                                            Удалить
                                        </button>
                                        <button
                                            className="btn btn-outline-primary btn-sm flex-grow-1"
                                            onClick={() => handleEditClick(ad)}
                                            style={{
                                                borderColor: 'rgb(221, 171, 210)',
                                                color: 'rgb(91, 160, 74)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = 'rgb(91, 160, 74)';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = '';
                                                e.target.style.color = 'rgb(91, 160, 74)';
                                            }}
                                        >
                                            Изменить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модальное окно редактирования */}
            {editingAd && (
                <EditAdModal
                    ad={editingAd}
                    show={!!editingAd}
                    onClose={() => setEditingAd(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* Модальное окно удаления */}
            {deletingAd && (
                <DeleteAdModal
                    ad={deletingAd}
                    show={!!deletingAd}
                    onClose={() => setDeletingAd(null)}
                    onDelete={handleConfirmDelete}
                />
            )}
        </section>
    );
};

export default UserAds;