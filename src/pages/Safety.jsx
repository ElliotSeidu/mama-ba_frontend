import { useState } from "react";

const database = [
  { name: "Neem Leaves", latin: "Azadirachta indica", verdict: "caution", note: "Limited use is generally fine, but high doses or concentrated extracts are not recommended during pregnancy." },
  { name: "Ginger Root", latin: "Zingiber officinale", verdict: "safe", note: "Commonly used in moderate amounts to relieve nausea. Stick to culinary quantities." },
  { name: "Prekese (Tetrapleura tetraptera)", latin: "Tetrapleura tetraptera", verdict: "caution", note: "Traditionally used, but high doses during pregnancy may pose risks. Seek medical advice before use." },
];

const verdictStyles = {
  safe: "bg-forest-green/10 text-forest-green border-forest-green/30",
  caution: "bg-tertiary-container/10 text-tertiary border-tertiary/30",
  avoid: "bg-error-container text-error border-error/30",
};

export default function Safety() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const results = database.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <h1 className="font-headline text-headline-md text-on-background mb-1">Herbal & Food Safety Checker</h1>
      <p className="text-on-surface-variant mb-4">Search ingredients to check their safety during pregnancy.</p>

      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search herbs, foods, roots..."
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
        />
      </div>

      {!selected ? (
        <div className="flex flex-col gap-3">
          {results.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelected(item)}
              className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:bg-surface-container-low transition-colors"
            >
              <p className="font-headline text-label-md text-on-surface">{item.name}</p>
              <p className="text-sm text-on-surface-variant italic">{item.latin}</p>
            </button>
          ))}
          {results.length === 0 && (
            <p className="text-on-surface-variant text-center mt-8">No matches yet — try another search term.</p>
          )}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-primary mb-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to search
          </button>
          <h2 className="font-headline text-headline-lg text-on-surface mb-1">{selected.name}</h2>
          <p className="text-on-surface-variant italic mb-4">{selected.latin}</p>
          <div className={`rounded-xl border p-4 ${verdictStyles[selected.verdict]}`}>
            <h3 className="font-headline text-label-md capitalize mb-1">
              {selected.verdict === "caution" ? "Use with Caution" : selected.verdict}
            </h3>
            <p>{selected.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}