import { NextResponse } from "next/server";

export const pagination = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") as string) || 5;

  (req as any).pagination = {
    skip: (page - 1) * 5,
  };

  return NextResponse.next();
};
