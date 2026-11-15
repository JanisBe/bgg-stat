export const BGG_BASE_URL = 'https://boardgamegeek.com/boardgame/';

/**
 * Opens the BGG page for the specified game object ID in a new browser tab.
 */
export function openBggPage(objectId: string | number | undefined): void {
  if (objectId) {
    window.open(BGG_BASE_URL + objectId, '_blank');
  }
}
