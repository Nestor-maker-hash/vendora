export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-2xl font-bold text-emerald-600">
        Vendora
      </h1>

      <div className="flex items-center gap-4">
        <button className="rounded-lg border px-4 py-2">
          Notifications
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
          N
        </div>
      </div>
    </header>
  );
}
