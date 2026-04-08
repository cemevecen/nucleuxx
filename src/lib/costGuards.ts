/**
 * Maliyet / kota ile ilgili ortam bayrakları.
 * OAuth: Google Cloud ve X Developer konsollarında kota ve (X’te) ücretli plan sınırları vardır.
 */

export function isOAuthGloballyDisabled(): boolean {
  const v = process.env.AUTH_DISABLE_OAUTH;
  return v === "1" || v === "true" || v === "yes";
}

export type OAuthUiFlags = {
  oauthGloballyDisabled: boolean;
  google: boolean;
  twitter: boolean;
};

/** Sunucu tarafında giriş ekranı ile auth.ts aynı kuralları kullanır. */
export function getOAuthUiFlags(): OAuthUiFlags {
  const oauthGloballyDisabled = isOAuthGloballyDisabled();
  return {
    oauthGloballyDisabled,
    google:
      !oauthGloballyDisabled &&
      !!process.env.GOOGLE_CLIENT_ID &&
      !!process.env.GOOGLE_CLIENT_SECRET,
    twitter:
      !oauthGloballyDisabled &&
      !!process.env.TWITTER_CLIENT_ID &&
      !!process.env.TWITTER_CLIENT_SECRET,
  };
}
