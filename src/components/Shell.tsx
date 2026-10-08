"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";

type Biz = { id: string; short: string; name: string; hex: string };

/** トップ（ワールド選択）は全画面のゲーム画面、それ以外はサイドバー付きの業務画面。 */
export function Shell({ businesses, children }: { businesses: Biz[]; children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return <>{children}</>;
  return (
    <div className="min-h-screen">
      <Nav businesses={businesses} />
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
