import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "#f3f3f3",
                    height: 900,
                    width: 800,
                    margin: "auto",
                    padding: "2%",
                    border: "5px solid #000",
                    borderRadius: "10px",
                    boxShadow: "2px solid black",
                }}
            >
                
                {children}
                {/* close modal button */}
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        cursor: "pointer",
                    }}>
                    Close without responding
                </button>

            </div>
        </div>
    );
};

export default Modal;