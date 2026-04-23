const ownershipKey = (username: string) => `owned-map-ids:${username}`;

export function getOwnedMapIds(username: string): Set<string> {
  const raw = localStorage.getItem(ownershipKey(username));
  if (!raw) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

export function addOwnedMapId(username: string, mapId: string): void {
  const owned = getOwnedMapIds(username);
  owned.add(mapId);
  localStorage.setItem(ownershipKey(username), JSON.stringify(Array.from(owned)));
}

export function removeOwnedMapId(username: string, mapId: string): void {
  const owned = getOwnedMapIds(username);
  owned.delete(mapId);
  localStorage.setItem(ownershipKey(username), JSON.stringify(Array.from(owned)));
}
