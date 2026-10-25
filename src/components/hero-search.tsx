const FIELDS = [
  { name: "location", label: "Location", placeholder: "Address, City Or Zip" },
  { name: "dateDuration", label: "Date/Duration", placeholder: "Anytime/3 Days" },
  { name: "budget", label: "Budget", placeholder: "$0-$3000" },
  { name: "people", label: "People", placeholder: "5-10" },
];

function fieldClasses(index: number) {
  return [
    "px-5 py-4 sm:px-6",
    // Mobile 2x2 grid: left divider on the second column, top divider on the second row.
    index % 2 === 1 ? "border-l border-white/20" : "",
    index >= 2 ? "border-t border-white/20" : "",
    // Desktop row: left divider on everything but the first column.
    index >= 1 ? "md:border-l" : "",
    index >= 2 ? "md:border-t-0" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function HeroSearch() {
  return (
    <form
      aria-label="Search destinations"
      className="absolute inset-x-0 bottom-0 grid grid-cols-2 bg-black/30 backdrop-blur-sm md:grid-cols-[repeat(4,1fr)_auto]"
    >
      {FIELDS.map((field, index) => (
        <div key={field.name} className={fieldClasses(index)}>
          <label
            htmlFor={field.name}
            className="block text-sm font-semibold text-white"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            className="w-full bg-transparent pt-1 text-sm text-white outline-none placeholder:text-white/60"
          />
        </div>
      ))}

      <button
        type="submit"
        className="col-span-2 bg-brand px-12 py-4 text-base font-semibold text-white hover:bg-brand/90 md:col-span-1 md:-my-2 md:self-center"
      >
        Search
      </button>
    </form>
  );
}
