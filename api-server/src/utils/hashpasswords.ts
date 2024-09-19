import bcryptjs from "bcryptjs";

export const hashPassword = (password: string): string => {
  const salt = bcryptjs.genSaltSync(10);
  return bcryptjs.hashSync(password, salt);
};

export const isPasswordEqual = (
  password: string,
  hashedPassword: string
): boolean => {
  return bcryptjs.compareSync(password, hashedPassword);
};
