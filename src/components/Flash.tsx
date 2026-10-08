/** ?msg= で渡された操作結果を表示するバナー */
export function Flash({ msg, ok = true }: { msg?: string; ok?: boolean }) {
  if (!msg) return null;
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
      {msg}
    </div>
  );
}
