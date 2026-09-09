"use client";

interface Props {
  current: string;
  onChange: (section: string) => void;
}

const sections = [
  "Storefront",
  "Payments",
  "Delivery",
  "Password & Security",
  "Analytics",
  "Notifications",
  "Danger Zone",
];

export default function SettingsSidebar({
  current,
  onChange,
}: Props) {
  return (
    <aside className="min-w-0 overflow-hidden rounded-xl border bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4">

      <h2 className="mb-2 px-1 text-base font-bold sm:mb-4 sm:text-lg">
        Settings
      </h2>

      <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5 sm:space-y-2 sm:gap-0 sm:overflow-visible sm:pb-0 sm:flex-col">

        {sections.map((section) => (
          <button
            key={section}
            onClick={() => onChange(section)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs font-medium transition sm:w-full sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm ${
              current === section
                ? "bg-emerald-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {section}
          </button>
        ))}

      </div>

    </aside>
  );
}
