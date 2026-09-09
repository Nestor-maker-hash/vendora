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
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl sm:p-5">
      <p className="text-xs font-medium text-gray-500 sm:text-sm">
        {title}
      </p>

      <h2 className="mt-2 break-words text-xl font-bold leading-tight text-gray-900 sm:mt-3 sm:text-2xl lg:text-3xl">
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
