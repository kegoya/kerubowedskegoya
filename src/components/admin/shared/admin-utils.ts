export function formatDate(value: string) {
    return new Date(value).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  
  export function toDateTimeLocal(value: string) {
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return value.slice(0, 16);
    }
  
    const pad = (n: number) => String(n).padStart(2, "0");
  
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  
  export const DEFAULT_PRIMARY_HEX = "#8b1e3f";
  export const DEFAULT_SECONDARY_HEX = "#1e3a8a";
  export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;

  const GOOGLE_DRIVE_ID_RE =
    /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([A-Za-z0-9_-]{20,})/;

  export function toImageUrl(input: string): string {
    const value = input.trim();
    const match = value.match(GOOGLE_DRIVE_ID_RE);
    if (!match) return value;
    const id = encodeURIComponent(match[1]);
    return `https://drive.google.com/thumbnail?id=${id}&sz=w2048`;
  }