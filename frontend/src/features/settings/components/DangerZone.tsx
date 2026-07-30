export default function DangerZone() {
  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-red-700">
        Danger Zone
      </h2>

      <p className="mt-2 text-red-600">
        Account deletion and other irreversible actions will appear here.
      </p>
    </div>
  );
}
