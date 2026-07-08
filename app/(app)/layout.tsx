"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui";
import { Toaster } from "sonner";

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=2000&auto=format&fit=crop";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  const router = useRouter();

  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted && isAuthenticated && pathname !== "/login") {
      const userStr = localStorage.getItem("user");

      if (userStr) {
        const user = JSON.parse(userStr);

        const role = user.role;

        const routes: Record<string, string> = {
          administrateur: "/admin",

          pasteur: "/pasteur",

          tresorier: "/tresorier",

          secretaire: "/secretaire",

          chef_departement: "/chef-departement",
        };

        router.push(routes[role] || "/dashboard");
      } else {
        router.push("/admin");
      }
    }
  }, [isAuthenticated, isLoading, mounted, router, pathname]);

  if (!mounted || (isLoading && pathname !== "/login")) {
    return (
      <div
        className="
        flex
        min-h-screen
        items-center
        justify-center
      "
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="
      relative
      min-h-screen
      overflow-hidden
    "
    >
      {/* Image de fond */}

      <Image
        src={BACKGROUND_IMAGE}
        alt="Background église"
        fill
        priority
        className="
          object-cover
          scale-110
        "
      />

      {/* Overlay sombre + flou */}

      <div
        className="
        absolute
        inset-0
        bg-black/40
        backdrop-blur-sm
      "
      />

      <Toaster position="top-right" richColors />

      {/* Décorations */}

      <div
        className="
        absolute
        inset-0
        overflow-hidden
      "
      >
        <div
          className="
          absolute
          -left-40
          -top-40
          h-80
          w-80
          rounded-full
          bg-primary-200/20
          blur-3xl
        "
        />

        <div
          className="
          absolute
          -bottom-40
          -right-40
          h-80
          w-80
          rounded-full
          bg-primary-200/20
          blur-3xl
        "
        />
      </div>

      {/* Contenu */}

      <div
        className="
        relative
        z-10
        flex
        min-h-screen
        flex-col
        items-center
        justify-center
        p-4
      "
      >
        <div
          className="
          w-full
          max-w-md
        "
        >
          {children}
        </div>
      </div>
    </div>
  );
}
