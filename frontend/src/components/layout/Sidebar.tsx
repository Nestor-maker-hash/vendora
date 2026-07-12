const links = [
  "Dashboard",
  "Products",
  "Orders",
  "Customers",
  "Analytics",
  "Settings",
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <button
            key={link}
            className="block w-full rounded-lg px-4 py-3 text-left hover:bg-emerald-50"
          >
            {link}
          </button>
        ))}
      </nav>
    </aside>
  );
}
