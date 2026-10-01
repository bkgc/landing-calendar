import { google } from "googleapis";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { decrypt, encrypt } from "@/lib/utils/encrypt";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

export function getGoogleOAuthClient(
  redirectUri = process.env.GOOGLE_REDIRECT_URI,
) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google Calendar no está configurado.");
  }
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );
}

export async function getGoogleClient(businessId: string) {
  const reference = getAdminFirestore().doc(
    `businesses/${businessId}/integrations/google`,
  );
  const snapshot = await reference.get();
  if (!snapshot.exists)
    throw new Error(
      "Conecta Google Calendar antes de consultar disponibilidad.",
    );
  const data = snapshot.data() as {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
  const oauth = getGoogleOAuthClient();
  oauth.setCredentials({
    access_token: decrypt(data.accessToken),
    refresh_token: decrypt(data.refreshToken),
    expiry_date: data.expiryDate,
  });

  if (!data.expiryDate || data.expiryDate <= Date.now() + 60_000) {
    const refreshed = await oauth.refreshAccessToken();
    const credentials = refreshed.credentials;
    if (credentials.access_token) {
      await reference.update({
        accessToken: encrypt(credentials.access_token),
        expiryDate: credentials.expiry_date || Date.now() + 3_600_000,
        updatedAt: new Date(),
      });
    }
  }
  return google.calendar({ version: "v3", auth: oauth });
}
