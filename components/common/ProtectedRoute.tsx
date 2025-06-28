"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) {
      redirect("/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null; // Prevent rendering

  return <>{children}</>;
}
