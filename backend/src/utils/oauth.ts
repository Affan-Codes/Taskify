import crypto from "crypto";

export const generateOAuthState = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const verifyOAuthState = (
  storedState: string | undefined,
  receivedState: string | undefined
): boolean => {
  if (!storedState || !receivedState) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(storedState),
    Buffer.from(receivedState)
  );
};

export const isValidRedirectUrl = (
  url: string,
  allowedOrigins: string[]
): boolean => {
  try {
    const parsedUrl = new URL(url);
    return allowedOrigins.some((origin) => {
      const parsedOrigin = new URL(origin);
      return parsedUrl.origin === parsedOrigin.origin;
    });
  } catch {
    return false;
  }
};
