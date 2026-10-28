
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sciprogram_session";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET must contain at least 32 characters.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  admin: AdminSession,
): Promise<string> {
  return new SignJWT({
    email: admin.email,
    name: admin.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
