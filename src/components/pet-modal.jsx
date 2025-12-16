import React from 'react';

const PetModal = ({ pet }) => {
    return (
        <div className="modal fade" id={`adModal${pet.id}`} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Подробная информация</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6">
                                <img src={pet.image} className="img-fluid rounded" alt={pet.title} />
                            </div>
                            <div className="col-md-6">
                                <h4>{pet.title}</h4>
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><strong>ID:</strong></td>
                                            <td>{pet.id}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Телефон:</strong></td>
                                            <td>{pet.contact}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Имя:</strong></td>
                                            <td>{pet.author}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Вид:</strong></td>
                                            <td>{pet.animalType}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Метка:</strong></td>
                                            <td>{pet.mark}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Район:</strong></td>
                                            <td>{pet.district}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Дата:</strong></td>
                                            <td>{pet.date}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Статус:</strong></td>
                                            <td><span className="badge bg-success">Зарегистрировано</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-3">
                            <h5>Описание:</h5>
                            <p>{pet.description}</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default PetModal;