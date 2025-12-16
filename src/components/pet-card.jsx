import React from 'react';

const PetCard = ({ pet }) => {
    return (
        <div className="col-md-4 mb-4">
            <div className="card h-100">
                <img src={pet.image} className="card-img-top" alt={pet.title} />
                <div className="card-body">
                    <h5 className="card-title">{pet.title}</h5>
                    <p className="card-text">{pet.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="badge district-badge">{pet.district}</span>
                    </div>
                </div>
                <div className="card-footer">
                    <small className="text-muted">{pet.date}</small>
                    <button className="btn btn-outline-primary btn-sm float-end" data-bs-toggle="modal" data-bs-target={`#adModal${pet.id}`}>
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    )
};

export default PetCard;