import dotenv from 'dotenv';

dotenv.config();

export const openWhatsApp = (phoneNumber, message) => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const encodedMessage = encodeURIComponent(message);

  if (isMobile) {
    window.open(
      `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`,
      '_blank'
    );
  } else {
    window.open(
      `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`,
      '_blank'
    );
  }
};

export const ZAPLIA_WHATSAPP = process.env.REACT_APP_ZAPLIA_WHATSAPP;

if (!ZAPLIA_WHATSAPP) {
  throw new Error('ZAPLIA_WHATSAPP is not defined in environment variables');
}
