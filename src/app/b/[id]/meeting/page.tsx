import { redirect } from "next/navigation";

// 会議はオフィス画面の「会議」ボタンに統合した
export default async function MeetingRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/b/${id}`);
}
