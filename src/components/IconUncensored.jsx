import React from "react";

export function IconUncensored(props) {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
    >
      <path fill="#c80a50" d="M58 32a26 26 0 11-52 0 26 26 0 0152 0z" />
      <path
        fill="#a00028"
        d="M53.9 18H52v2c0 1.1-.9 2-2 2s-2-.9-2-2v-2h-2c-1.1 0-2-.9-2-2s.9-2 2-2h2v-2-.4c2.3 1.8 4.3 4 5.9 6.4zM16 21c0 1.1.9 2 2 2h2v24a2 2 0 104 0V21a2 2 0 00-2-2h-4a2 2 0 00-2 2zM42.5 32.9a8 8 0 10-11 0A9 9 0 0037 49a9 9 0 005.5-16.1zM33 27a4 4 0 118 0 4 4 0 01-8 0zm4 18a5 5 0 110-10 5 5 0 010 10z"
      />
      <path
        fill="#f0f0f0"
        d="M16 20c0 1.1.9 2 2 2h2v24a2 2 0 104 0V20a2 2 0 00-2-2h-4a2 2 0 00-2 2zM42.5 31.9a8 8 0 10-11 0A9 9 0 0037 48a9 9 0 005.5-16.1zM33 26a4 4 0 118 0 4 4 0 01-8 0zm4 18a5 5 0 110-10 5 5 0 010 10zM54 13h-2v-2a2 2 0 10-4 0v2h-2a2 2 0 100 4h2v2a2 2 0 104 0v-2h2a2 2 0 100-4z"
      />
    </svg>
  );
}
