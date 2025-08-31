// Never use @iconify/react inside this file.
import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

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
        <svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="64" height="64" rx="14" fill="#ef4444" />
          <path
            d="M46 22H18c-3.3 0-6 2.7-6 6v8c0 3.3 2.7 6 6 6h4v6l8-6h16c3.3 0 6-2.7 6-6v-8c0-3.3-2.7-6-6-6z"
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