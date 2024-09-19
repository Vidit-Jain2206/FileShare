import jwt from "jsonwebtoken";

export const generateToken = ({
  id,
  username,
  email,
}: {
  id: string;
  username: string;
  email: string;
}): string => {
  return jwt.sign({ id, username, email }, process.env.JWT_SECRET || "", {
    expiresIn: "7d",
  });
};

export const verifyToken = (
  token: string
): {
  id: string;
  username: string;
  email: string;
} | null => {
  const user = jwt.verify(token, process.env.JWT_SECRET || "");
  return (user as { id: string; username: string; email: string }) || null;
};
