import React from 'react';
import { Dialog } from 'primereact/dialog';

const ObservationModal = ({ visible, onHide, title, content, docName }) => {
    return (
        <Dialog
            header={title || "Observación"}
            visible={visible}
            onHide={onHide}
            className="w-[90vw] md:w-[450px]"
            draggable={false}
            resizable={false}
            pt={{
                mask: { className: 'backdrop-blur-sm' }
            }}
            footer={
                <button onClick={onHide} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md w-full md:w-auto text-sm">
                    Entendido
                </button>
            }
        >
            <div className="pt-2">
                {docName && (
                    <>
                        <p className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest mb-1.5">Documento:</p>
                        <div className="mb-4 bg-secondary-light/30 p-2.5 rounded-lg border border-secondary/10 flex items-center gap-2">
                            <i className="pi pi-file text-primary text-sm"></i>
                            <p className="text-sm font-bold text-secondary-dark">{docName}</p>
                        </div>
                    </>
                )}

                <p className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest mb-1.5">Motivo / Detalle:</p>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                    <p className="text-sm text-orange-900 leading-relaxed font-medium italic">
                        "{content}"
                    </p>
                </div>
            </div>
        </Dialog>
    );
};

export default ObservationModal;
