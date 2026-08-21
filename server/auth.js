import jwt from "jsonwebtoken";

const COOKIE = "jirra_session";
const secret = () => process.env.JWT_SECRET || "local-development-secret-change-me";

export function issueSession(res, user) {
  const token = jwt.sign({ sub: String(user.id), role: user.global_role }, secret(), { expiresIn: "8h", issuer: "jirra-local" });
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 8 * 60 * 60 * 1000, path: "/" });
}

export function clearSession(res) {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
}

export function requireAuth(req, res, next) {
  try {
    const payload = jwt.verify(req.cookies?.[COOKIE] || "", secret(), { issuer: "jirra-local" });
    req.auth = { id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Please sign in" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.auth?.role !== "super_admin") return res.status(403).json({ error: "Super admin access required" });
  next();
}
