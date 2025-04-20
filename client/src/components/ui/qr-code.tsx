import React, { useEffect, useRef } from 'react';
import QRCodeGenerator from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
}

const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  level = 'L',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeGenerator.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          errorCorrectionLevel: level,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [value, size, level, bgColor, fgColor]);

  return <canvas ref={canvasRef} />;
};

export default QRCode;
