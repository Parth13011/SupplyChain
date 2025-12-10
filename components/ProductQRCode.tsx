'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ProductQRCodeProps {
  productId: number;
  productName?: string;
}

export default function ProductQRCode({ productId, productName }: ProductQRCodeProps) {
  const [copied, setCopied] = useState(false);
  
  // Create QR code data - contains product ID that can be scanned
  // Format: "PRODUCT_ID:123" for easy parsing
  const qrCodeData = `PRODUCT_ID:${productId}`;
  
  // Also create a URL format for web tracking
  const trackingUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?productId=${productId}`
    : `PRODUCT_ID:${productId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-code-${productId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `product-${productId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-lg p-4 shadow-lg">
      <div className="text-center mb-3">
        <h3 className="text-lg font-bold text-indigo-600 mb-1">📱 Product QR Code</h3>
        <p className="text-sm text-gray-600">Scan or copy to track this product</p>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        {/* QR Code Display */}
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCodeSVG
            id={`qr-code-${productId}`}
            value={qrCodeData}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Product Info */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Product ID: <span className="text-indigo-600">#{productId}</span></p>
          {productName && (
            <p className="text-xs text-gray-500 mt-1">{productName}</p>
          )}
        </div>

        {/* QR Code Text (Copyable) */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            QR Code Text (Copy this):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrCodeData}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={downloadQRCode}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold text-sm transition-colors"
          >
            📥 Download QR Code
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
          <p className="text-xs text-blue-800 font-semibold mb-1">📋 How to Use:</p>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Scan QR code with any QR scanner app</li>
            <li>Or copy the QR code text above</li>
            <li>Use in Product Tracker to view full history</li>
            <li>Share with anyone in the supply chain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

