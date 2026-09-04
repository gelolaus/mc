export const serverKeys = ['lobby', 'survival', 'creative'] as const;

export const serverDisplayNames: Record<(typeof serverKeys)[number], string> = {
  lobby: 'Lobby',
  survival: 'Survival',
  creative: 'Creative',
};
