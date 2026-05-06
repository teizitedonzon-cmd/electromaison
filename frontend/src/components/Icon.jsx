import React from 'react';

const paths = {
  dashboard: <path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-5H4v5Z" />,
  package: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5m-8-4.5 8 4.5" />,
  cart: <path d="M6 6h15l-2 8H8L6 3H3m6 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
  users: <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0M19 8a3 3 0 0 1 0 6m2 6a6 6 0 0 0-3-5.2" />,
  logout: <path d="M10 17l5-5-5-5m5 5H3m7-9h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  clipboard: <path d="M9 5h6m-7 3h8m-8 4h8m-8 4h5M8 3h8l1 2h2v16H5V5h2l1-2Z" />,
  eye: <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  money: <path d="M4 7h16v10H4V7Zm4 5h.01M16 12h.01M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  clock: <path d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  shop: <path d="M4 10h16l-1-5H5l-1 5Zm2 0v10h12V10M9 20v-6h6v6" />,
};

export default function Icon({ name, size = 18, color = 'currentColor', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      aria-hidden="true"
    >
      {paths[name] || paths.package}
    </svg>
  );
}
