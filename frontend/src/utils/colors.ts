export const hexToRgba = (hex: string, opacity: number): string => {
  const sanitizedHex = hex.replace('#', '');
  const bigint = parseInt(sanitizedHex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}; 

export const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'High': return '#E53935';
        case 'Medium': return '#FB8C00';
        case 'Low': return '#43A047';
        default: return '#999';
    }
};