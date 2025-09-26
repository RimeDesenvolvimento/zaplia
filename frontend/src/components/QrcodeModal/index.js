import React, { useEffect, useState, useContext } from 'react';
import QRCode from 'qrcode.react';
import toastError from '../../errors/toastError';

import {
  Dialog,
  DialogContent,
  Paper,
  Typography,
  useTheme,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Divider,
} from '@material-ui/core';
import { i18n } from '../../translate/i18n';
import api from '../../services/api';
import { SocketContext } from '../../context/Socket/SocketContext';

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const theme = useTheme();

  const socketManager = useContext(SocketContext);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (open) {
      setTermsAccepted(false);
      setShowQrCode(false);
    }
  }, [open]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const companyId = localStorage.getItem('companyId');
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-whatsappSession`, data => {
      if (data.action === 'update' && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === 'update' && data.session.qrcode === '') {
        onClose();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose, socketManager]);

  const handleTermsAccept = () => {
    setShowQrCode(true);
  };

  const handleTermsChange = event => {
    setTermsAccepted(event.target.checked);
  };

  const renderTermsContent = () => (
    <Box>
      <Typography
        variant="h5"
        component="h2"
        color="textPrimary"
        gutterBottom
        style={{
          fontFamily: 'Montserrat',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#d32f2f',
        }}
      >
        ⚠️ Atenção antes de conectar seu WhatsApp
      </Typography>

      <Typography
        variant="body1"
        color="textPrimary"
        gutterBottom
        style={{ marginBottom: '16px', lineHeight: '1.6' }}
      >
        Para que a conexão funcione corretamente, é <strong>obrigatório</strong>{' '}
        que o seu número do WhatsApp já tenha sido conectado e sincronizado pelo
        menos uma vez no WhatsApp Web em um computador.
      </Typography>

      <Typography
        variant="h6"
        color="textPrimary"
        gutterBottom
        style={{
          fontWeight: 'bold',
          marginTop: '20px',
          marginBottom: '12px',
          color: theme.palette.primary.main,
        }}
      >
        O que você deve fazer:
      </Typography>

      <Box component="ol" style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        <Typography
          component="li"
          variant="body1"
          color="textPrimary"
          style={{ marginBottom: '8px' }}
        >
          Abra o WhatsApp no seu celular.
        </Typography>
        <Typography
          component="li"
          variant="body1"
          color="textPrimary"
          style={{ marginBottom: '8px' }}
        >
          Vá em <strong>Aparelhos Conectados</strong> e conecte ao WhatsApp Web
          em um navegador no computador.
        </Typography>
        <Typography
          component="li"
          variant="body1"
          color="textPrimary"
          style={{ marginBottom: '8px' }}
        >
          Aguarde até que todas as mensagens sejam sincronizadas.
        </Typography>
        <Typography
          component="li"
          variant="body1"
          color="textPrimary"
          style={{ marginBottom: '8px' }}
        >
          Depois disso, você pode sair do WhatsApp Web no computador se quiser —
          não é necessário permanecer conectado.
        </Typography>
        <Typography
          component="li"
          variant="body1"
          color="textPrimary"
          style={{ marginBottom: '8px' }}
        >
          <strong>Só então</strong> volte ao Zaplia e faça a conexão do seu
          WhatsApp na plataforma.
        </Typography>
      </Box>

      <Typography
        variant="h6"
        color="textPrimary"
        gutterBottom
        style={{
          fontWeight: 'bold',
          marginTop: '20px',
          marginBottom: '12px',
          color: theme.palette.primary.main,
        }}
      >
        Por que isso é importante?
      </Typography>

      <Typography
        variant="body1"
        color="textPrimary"
        gutterBottom
        style={{ marginBottom: '16px', lineHeight: '1.6' }}
      >
        O WhatsApp exige que o número seja sincronizado no modo múltiplos
        aparelhos antes de qualquer integração. Se essa etapa não for feita, a
        conexão no Zaplia pode falhar ou não carregar todas as mensagens.
      </Typography>

      <Typography
        variant="body2"
        color="textSecondary"
        style={{
          fontStyle: 'italic',
          marginBottom: '24px',
          padding: '12px',
          backgroundColor: theme.palette.grey[100],
          borderRadius: '4px',
        }}
      >
        Caso tenha dúvidas, nossa equipe de suporte está à disposição para te
        ajudar.
      </Typography>

      <Divider style={{ margin: '20px 0' }} />

      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={handleTermsChange}
              color="primary"
            />
          }
          label={
            <Typography variant="body1" style={{ fontWeight: '500' }}>
              Li e estou ciente dos requisitos acima
            </Typography>
          }
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleTermsAccept}
          disabled={!termsAccepted}
          size="large"
          style={{
            minWidth: '200px',
            fontWeight: 'bold',
          }}
        >
          Continuar para QR Code
        </Button>
      </Box>
    </Box>
  );

  const renderQrCodeContent = () => (
    <Paper elevation={0} style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '20px' }}>
        <Typography
          variant="h2"
          component="h2"
          color="textPrimary"
          gutterBottom
          style={{
            fontFamily: 'Montserrat',
            fontWeight: 'bold',
            fontSize: '20px',
          }}
        >
          {i18n.t('qrCodeModal.title')}
        </Typography>
        <Typography variant="body1" color="textPrimary" gutterBottom>
          {i18n.t('qrCodeModal.steps.one')}
        </Typography>
        <Typography variant="body1" color="textPrimary" gutterBottom>
          {i18n.t('qrCodeModal.steps.two.partOne')}
          <svg
            className="MuiSvgIcon-root"
            focusable="false"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
          </svg>
          {i18n.t('qrCodeModal.steps.two.partTwo')}
          <svg
            className="MuiSvgIcon-root"
            focusable="false"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
          </svg>
          {i18n.t('qrCodeModal.steps.two.partThree')}
        </Typography>
        <Typography variant="body1" color="textPrimary" gutterBottom>
          {i18n.t('qrCodeModal.steps.three')}
        </Typography>
        <Typography variant="body1" color="textPrimary" gutterBottom>
          {i18n.t('qrCodeModal.steps.four')}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => setShowQrCode(false)}
          style={{ marginTop: '16px' }}
        >
          Voltar aos Termos
        </Button>
      </div>
      <div>
        {qrCode ? (
          <QRCode value={qrCode} size={256} />
        ) : (
          <span>{i18n.t('qrCodeModal.waiting')}</span>
        )}
      </div>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      scroll="paper"
      PaperProps={{
        style: {
          minHeight: showQrCode ? 'auto' : '600px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogContent style={{ padding: '24px' }}>
        {!showQrCode ? renderTermsContent() : renderQrCodeContent()}
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
