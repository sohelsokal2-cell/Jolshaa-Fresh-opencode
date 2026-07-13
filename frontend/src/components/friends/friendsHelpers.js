export const AVATAR_COLORS = [
  'linear-gradient(135deg,#1B6B5A,#2a9678)',
  'linear-gradient(135deg,#E85C4A,#f0816e)',
  'linear-gradient(135deg,#D4A04A,#e8c06a)',
  'linear-gradient(135deg,#4A7AE8,#6e9af0)',
  'linear-gradient(135deg,#8B5CF8,#a78bfa)',
  'linear-gradient(135deg,#EC4899,#f472b6)',
  'linear-gradient(135deg,#14B8A6,#5eead4)',
  'linear-gradient(135deg,#F97316,#fb923c)',
];

export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0);
}

export function toBnNumber(n) {
  const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(n).replace(/\d/g, d => bnDigits[parseInt(d)]);
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র · Just now';
  if (mins < 60) return `${toBnNumber(mins)} মিনিট আগে · ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${toBnNumber(hrs)} ঘণ্টা আগে · ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${toBnNumber(days)} দিন আগে · ${days}d ago`;
}
