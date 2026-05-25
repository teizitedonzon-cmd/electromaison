import React from 'react';

const paths = {
  dashboard: <path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-5H4v5Z" />,
  home: <path d="M3 11 12 3l9 8v10h-6v-6H9v6H3V11Z" />,
  package: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5m-8-4.5 8 4.5" />,
  cart: <path d="M6 6h15l-2 8H8L6 3H3m6 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
  users: <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0M19 8a3 3 0 0 1 0 6m2 6a6 6 0 0 0-3-5.2" />,
  logout: <path d="M10 17l5-5-5-5m5 5H3m7-9h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8" />,
  login: <path d="m14 17 5-5-5-5m5 5H8m2 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  clipboard: <path d="M9 5h6m-7 3h8m-8 4h8m-8 4h5M8 3h8l1 2h2v16H5V5h2l1-2Z" />,
  'file-text': <path d="M7 3h7l5 5v13H7V3Zm7 0v5h5M9 13h6M9 17h6M9 9h2" />,
  eye: <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  money: <path d="M4 7h16v10H4V7Zm4 5h.01M16 12h.01M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  clock: <path d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  shop: <path d="M4 10h16l-1-5H5l-1 5Zm2 0v10h12V10M9 20v-6h6v6" />,
  store: <path d="M4 10h16l-1-5H5l-1 5Zm2 0v10h12V10M9 20v-6h6v6" />,
  bell: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
  user: <path d="M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
  mail: <path d="M4 6h16v12H4V6Zm0 0 8 7 8-7" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />,
  lock: <path d="M6 10h12v10H6V10Zm3 0V7a3 3 0 0 1 6 0v3" />,
  'eye-off': <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c6 0 10 8 10 8a18.5 18.5 0 0 1-3.2 4.4M6.6 6.6C3.8 8.2 2 12 2 12s4 8 10 8c1.4 0 2.7-.4 3.8-1" />,
  camera: <path d="M4 7h3l2-3h6l2 3h3v13H4V7Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  'line-chart': <path d="M4 16l4-4 4 6 8-12" />,
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
