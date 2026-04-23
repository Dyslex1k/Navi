export const formatRoomNameForUi = (name?: string | null) => {
  if (!name) {
    return '';
  }

  return name
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ');
};
