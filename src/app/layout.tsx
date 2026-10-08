import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { allWorlds } from "@/lib/worlds";

export const metadata: Metadata = {
  title: "メディアブレイン 営業ポータル",
  description: "全事業の営業自動化ポータル。ワールドを選んで、AI社員と営業を進める。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Shell businesses={allWorlds().map(({ id, short, name, hex }) => ({ id, short, name, hex }))}>{children}</Shell>
      </body>
    </html>
  );
}
