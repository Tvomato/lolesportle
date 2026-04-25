/**
 * Returns the full-size version of a player image URL.
 *
 * Fandom/Leaguepedia CDN URLs look like:
 *   https://.../Faker.png/revision/latest/scale-to-width-down/60?cb=...
 * Everything from `/revision` onward is a sizing/caching directive for a
 * downscaled thumbnail. Stripping it yields the original uploaded file,
 * which is the highest-quality version available from the CDN.
 */
export function getFullSizeImageUrl(url: string): string {
  return url.split("/revision")[0];
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = getFullSizeImageUrl(url);
  });
}
