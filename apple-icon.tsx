// Never use @iconify/react inside this file.
import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="180" height="180" rx="36" fill="#ef4444" />
          <path
            d="M130 60H50c-9.94 0-18 8.06-18 18v24c0 9.94 8.06 18 18 18h12v18l24-18h44c9.94 0 18-8.06 18-18V78c0-9.94-8.06-18-18-18z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
} 