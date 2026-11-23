import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#071e1a',
        }}
      >
        <svg viewBox="0 0 64 64" width="180" height="180" fill="none">
          <rect x="2" y="2" width="60" height="60" rx="20" fill="#071e1a" />
          <rect
            x="3"
            y="3"
            width="58"
            height="58"
            rx="19"
            stroke="#20d8bd"
            strokeOpacity="0.45"
            strokeWidth="1.8"
          />
          <path
            d="M 13.6 42.12 L 13.6 21.88 L 18.2 21.88 L 22.25 33.1 L 26.3 21.88 L 30.9 21.88 L 30.9 42.12 L 26.85 42.12 L 26.85 29.79 L 23.81 38.62 L 20.68 38.62 L 17.65 29.79 L 17.65 42.12 Z"
            fill="#20d8bd"
          />
          <path
            d="M 49.66 21.88 L 49.66 25.84 L 42.3 25.84 C 39.18 25.84 38.44 27.86 38.44 32 C 38.44 36.14 39.18 38.16 42.49 38.16 L 46.35 38.16 L 46.35 34.67 L 42.49 34.67 L 42.49 30.9 L 50.4 30.9 L 50.4 41.48 C 49.11 41.94 46.9 42.12 42.49 42.12 C 36.42 42.12 34.21 38.44 34.21 32 C 34.21 25.56 36.42 21.88 42.49 21.88 Z"
            fill="#20d8bd"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
