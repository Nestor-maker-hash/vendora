import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  href?: string;
}

export default function StatCard({
  title,
  value,
  href,
}: StatCardProps) {
  const content = (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <h2 className="mt-3 break-words text-2xl font-bold leading-tight text-gray-900 lg:text-3xl">
        {value}
      </h2>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {content}
      </Link>
    );
  }

  return content;
}
