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
          background: '#061310',
        }}
      >
        <svg viewBox="0 0 64 64" width="180" height="180" fill="none">
          <rect x="2" y="2" width="60" height="60" rx="15" fill="#061310" />
          <rect x="3" y="3" width="58" height="58" rx="14" stroke="#20d8bd" strokeWidth="2.2" />
          <path
            d="M 10 46 L 10 18 L 15.6 18 L 20.5 29.5 L 25.4 18 L 31 18 L 31 46 L 25.8 46 L 25.8 29.2 L 22.1 37.8 L 18.9 37.8 L 15.2 29.2 L 15.2 46 Z"
            fill="#f5fbf9"
          />
          <path
            d="M 53.5 20.6 L 42.6 20.6 Q 37.6 20.6 37.6 25.6 L 37.6 38.4 Q 37.6 43.4 42.6 43.4 L 46.4 43.4 Q 51.4 43.4 51.4 38.4 L 51.4 32.5 L 44.5 32.5"
            stroke="#20d8bd"
            strokeWidth="5.2"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
