import React from 'react';

const Popup = ({
    yesAction,
    noAction,
    title = 'Are you sure you want to continue Payment Process?',
    disableYesAction = false,
}) => {
    const onClose = (e) => {
        e.stopPropagation();
        noAction();
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                role="document"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content bg-light text-light border border-dark p-3">
                    <div className="modal-header border-0">
                        <h5 className="modal-title text-center w-100" style={{ color: 'black' }}>{title}</h5>
                    </div>
                    <div className="modal-footer d-flex justify-content-center gap-3 border-0">
                        <button
                            type="button"
                            className="btn btn-primary w-45"
                            onClick={() => {
                                yesAction(); // perform action
                                noAction();  // close popup after action
                            }}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-dark w-45"
                            onClick={() => noAction()}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;
