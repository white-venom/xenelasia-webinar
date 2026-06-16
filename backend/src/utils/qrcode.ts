import QRCode from 'qrcode';

/**
 * Generates a base64 encoded PNG data URL representing a QR code for a given text.
 * @param text The content to encode in the QR code (e.g. registration details)
 */
export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 250,
      color: {
        dark: '#0b0f19', // Deep dark blue matching theme
        light: '#ffffff' // White background for scanner readability
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};
