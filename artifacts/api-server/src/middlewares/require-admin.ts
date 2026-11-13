import { clerkClient, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

const ADMIN_EMAIL = "malikhkm123@gmail.com";

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Admin sign-in required" });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress.toLowerCase();
    const isVerified =
      user.primaryEmailAddress?.verification?.status === "verified";

    if (!email || email !== ADMIN_EMAIL || !isVerified) {
      res.status(403).json({ error: "This account is not an administrator" });
      return;
    }

    next();
  } catch (error) {
    req.log.error({ err: error }, "Could not verify the admin account");
    res.status(500).json({ error: "Could not verify admin access" });
  }
};
