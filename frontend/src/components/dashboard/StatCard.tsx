interface StatCardProps {
  title: string;
  value: string;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </h2>
    </div>
  );
}
