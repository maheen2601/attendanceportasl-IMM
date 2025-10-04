import React from "react";

export default function TeamSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select a team…",
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const ref = React.useRef(null);
  const listRef = React.useRef(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  // close on outside click
  React.useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (val) => {
    onChange?.(val || "");
    setOpen(false);
    setQuery("");
    setActiveIdx(-1);
  };

  // keyboard support
  const onKeyDown = (e) => {
    if (!open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      setActiveIdx((idx) => {
        const max = filtered.length - 1;
        let next = idx;
        if (e.key === "ArrowDown") next = Math.min(max, idx + 1);
        if (e.key === "ArrowUp")   next = Math.max(0, idx - 1);
        // auto-scroll active item into view
        const el = listRef.current?.querySelector(`[data-i="${next}"]`);
        el?.scrollIntoView({ block: "nearest" });
        return next;
      });
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const pick = filtered[Math.max(0, activeIdx)];
      if (pick) choose(pick);
    }
  };

  const Highlight = ({ text, q }) => {
    if (!q) return <>{text}</>;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, i)}
        <span className="bg-yellow-100 rounded px-0.5">{text.slice(i, i + q.length)}</span>
        {text.slice(i + q.length)}
      </>
    );
  };

  return (
    <div className="relative" ref={ref} onKeyDown={onKeyDown}>
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full group inline-flex items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          {value ? (
            <span className="inline-flex items-center gap-2 truncate">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {value.slice(0, 2).toUpperCase()}
              </span>
              <span className="truncate text-gray-900">{value}</span>
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform group-hover:text-gray-700 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {/* Search (sticky) */}
          <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5a6.5 6.5 0 10-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L18.5 20l1.5-1.5-4.5-4.5zM9.5 14A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z" />
              </svg>
              <input
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
                placeholder="Search teams…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                autoFocus
              />
              {value && (
                <button
                  type="button"
                  onClick={() => choose("")}
                  className="text-xs px-2 py-1 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
                  title="Clear selection"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                No matches
              </li>
            )}

            {filtered.map((opt, i) => {
              const selected = value === opt;
              const active = i === activeIdx;
              return (
                <li key={opt} data-i={i}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => choose(opt)}
                    className={[
                      "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition",
                      active ? "bg-gray-50" : "bg-white",
                      selected ? "text-indigo-700" : "text-gray-800",
                    ].join(" ")}
                  >
                    <span className="truncate">
                      <Highlight text={opt} q={query} />
                    </span>
                    {selected && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
