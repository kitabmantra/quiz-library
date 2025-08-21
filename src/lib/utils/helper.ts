export function encodeBase64(data: string): string {
    return btoa(encodeURIComponent(data));
  }
  
  // Decode (decrypt) Base64 back to string
  export function decodeBase64(encoded: string): string {
    return decodeURIComponent(atob(encoded));
  }
  