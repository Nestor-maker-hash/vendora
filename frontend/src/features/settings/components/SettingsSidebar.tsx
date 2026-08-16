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
    <aside className="rounded-2xl border bg-white p-4 shadow-sm">

      <h2 className="mb-4 text-lg font-bold">
        Settings
      </h2>

      <div className="space-y-2">

        {sections.map((section) => (
          <button
            key={section}
            onClick={() => onChange(section)}
            className={`w-full rounded-xl px-4 py-3 text-left transition ${
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
