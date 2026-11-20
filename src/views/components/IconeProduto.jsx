// VIEW · Ilustração de cada produto do cardápio.
const DESENHOS = {
  suco: (
    <>
      <path d="M28.5 14 33 5" fill="none" stroke="#C2410C" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 13h22l-2.7 27.2A3 3 0 0 1 29.3 43H18.7a3 3 0 0 1-3-2.8z" fill="#FFFDF8" stroke="#3A2719" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.4 21h19.2l-1.9 19a1.8 1.8 0 0 1-1.8 1.6H18.1a1.8 1.8 0 0 1-1.8-1.6z" fill="#F7931E" />
      <circle cx="35.5" cy="13.5" r="6" fill="#FDB833" stroke="#3A2719" strokeWidth="1.4" />
      <path d="M35.5 9v9M31 13.5h9" stroke="#F7931E" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  sanduiche: (
    <>
      <path d="M8 19c0-5 7-8 16-8s16 3 16 8z" fill="#F2C27B" stroke="#3A2719" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 19.5c2.5 2.6 4.5-.6 7 1.2s4.5-1 7 .8 4.5-1.2 7 .6 4.5-.8 9-.8v2.2H9z" fill="#6CB33F" />
      <rect x="9.5" y="23.5" width="29" height="3.6" rx="1.6" fill="#E2463C" />
      <rect x="9.5" y="27.4" width="29" height="3" fill="#F9D24A" />
      <rect x="8" y="30.6" width="32" height="6.4" rx="2.6" fill="#F2C27B" stroke="#3A2719" strokeWidth="1.5" />
    </>
  ),
  salgado: (
    <>
      <path d="M24 9.5 40.5 37a1.6 1.6 0 0 1-1.4 2.4H8.9A1.6 1.6 0 0 1 7.5 37z" fill="#E9A23B" stroke="#3A2719" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 17 34 34H14z" fill="#D2842A" />
    </>
  ),
};

export default function IconeProduto({ id }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
      {DESENHOS[id] || <circle cx="24" cy="24" r="14" fill="#F2C27B" stroke="#3A2719" strokeWidth="1.5" />}
    </svg>
  );
}
