import jwt from "jsonwebtoken";

const AuthCheck = async (token: string) => {
  if (!token) {
    return { status: 401, message: "token not found" };
  }
  try {
    const decode = jwt.verify(token, process.env.TOKEN_SECRETE as string);
    return decode;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message == "jwt expired") {
        return { status: 401, message: "Token Expired" };
      }
    }
  }
};

export default AuthCheck;
