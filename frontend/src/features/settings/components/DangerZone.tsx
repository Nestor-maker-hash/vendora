export default function DangerZone() {
  return (
    <div className="min-w-0 rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <h2 className="text-lg font-semibold text-red-700 sm:text-xl">
        Danger Zone
      </h2>

      <p className="mt-1 break-words text-sm text-red-600 sm:mt-2">
        Account deletion and other irreversible actions will appear here.
      </p>
    </div>
  );
}
