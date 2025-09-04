import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos para PIX
  const totalTime = 15 * 60;

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressValue = (timeLeft / totalTime) * 100;

  const getTextColor = () => {
    if (progressValue > 50) return "#2e7d32"; // Verde
    if (progressValue > 25) return "#ed6c02"; // Laranja
    return "#d32f2f"; // Vermelho
  };

  const getProgressColor = () => {
    if (progressValue > 50) return "#4caf50"; // Verde
    if (progressValue > 25) return "#ff9800"; // Laranja
    return "#f44336"; // Vermelho
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ 
        fontFamily: 'monospace', 
        fontSize: '32px',
        fontWeight: 'bold', 
        marginBottom: '16px',
        color: getTextColor()
      }}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progressValue}%`,
          height: '100%',
          backgroundColor: getProgressColor(),
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

const ModalPaymentPix = ({
  modalVisible,
  setModalVisible,
  invoiceId,
  pixCode,
  isPaymentSuccess,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Fallback para pixCode
  const validPixCode = pixCode

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(validPixCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      console.error("Erro ao copiar código:", error);
    }
  };

  if (!modalVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={() => setModalVisible(false)}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            borderBottom: '1px solid #e0e0e0'
          }}>
            <button
              onClick={() => setModalVisible(false)}
              style={{ 
                backgroundColor: '#f5f5f5',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 11H7.414l4.293-4.293a1 1 0 0 0-1.414-1.414l-6 6a1 1 0 0 0 0 1.414l6 6a1 1 0 0 0 1.414-1.414L7.414 13H19a1 1 0 0 0 0-2z" fill="currentColor"/>
              </svg>
            </button>
            
            <h2 style={{ 
              margin: 0,
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              Pagamento via Pix
            </h2>
            
            <div style={{ width: '40px' }} />
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {isPaymentSuccess ? (
              /* Success State */
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center', 
                paddingTop: '32px',
                paddingBottom: '32px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                
                <h1 style={{ 
                  color: '#4caf50', 
                  fontWeight: 'bold', 
                  marginBottom: '16px',
                  fontSize: '32px',
                  margin: '0 0 16px 0'
                }}>
                  Pagamento Aprovado!
                </h1>
                
                <p style={{ 
                  color: '#757575', 
                  marginBottom: '24px',
                  fontSize: '16px'
                }}>
                  Sua transação foi processada com sucesso
                </p>
                
                <div style={{ 
                  backgroundColor: '#e8f5e8', 
                  border: '1px solid #4caf50',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    color: '#4caf50'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  </div>
                  <span style={{ fontWeight: '600', color: '#2e7d32' }}>
                    Pagamento de plano feito.
                  </span>
                </div>
              </div>
            ) : (
              /* Payment State */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Info Card */}
                <div style={{ 
                  backgroundColor: '#e3f2fd', 
                  border: '1px solid #2196f3',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#2196f3', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M3 5v14c0 1.1.89 2 2 2h14c0-1.1-.9-2-2-2H5V5c0-1.1-.9-2-2-2s-2 .9-2 2zm16-2H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1565c0', fontSize: '16px' }}>
                      Escaneie o QR Code
                    </div>
                    <div style={{ color: '#1565c0', fontSize: '14px' }}>
                      Use o app do seu banco ou copie o código Pix
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    padding: '24px', 
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <QRCode
                      value={validPixCode}
                      size={200}
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                </div>

                {/* Timer Section */}
                <div style={{ 
                  backgroundColor: '#fff3e0', 
                  border: '1px solid #ff9800',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '16px'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#ff9800', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div style={{ fontWeight: '600', color: '#e65100' }}>
                    Tempo restante
                  </div>
                  <div style={{ width: '100%', paddingLeft: '16px', paddingRight: '16px' }}>
                    <CountdownTimer />
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  style={{
                    height: '64px',
                    backgroundColor: isCopied ? '#e8f5e8' : '#ffffff',
                    border: `2px solid ${isCopied ? '#4caf50' : '#2196f3'}`,
                    color: isCopied ? '#4caf50' : '#2196f3',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: isCopied ? '#e8f5e8' : '#e3f2fd', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {isCopied ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#4caf50">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#2196f3">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    )}
                  </div>
                  {isCopied ? "Código copiado!" : "Copiar código Pix"}
                </button>

                {/* Instructions */}
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '16px' 
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#757575">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                      Como pagar
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#2196f3', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        1
                      </div>
                      <span style={{ fontSize: '14px' }}>
                        Abra o app do seu banco
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#2196f3', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        2
                      </div>
                      <span style={{ fontSize: '14px' }}>
                        Escaneie o QR Code ou cole o código
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#2196f3', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        3
                      </div>
                      <span style={{ fontSize: '14px' }}>
                        Confirme o pagamento
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalPaymentPix;
