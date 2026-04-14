import { useState } from "react";

interface Props {
  sport: string;
  event: string;
  why: string;
  classification?: string;
  classificationExplainer?: string;
}

export default function ArchetypeCard({
  sport,
  event,
  why,
  classification,
  classificationExplainer,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass rounded-xl p-5 transition hover:border-gold/20">
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-heading text-base font-semibold text-white">
          {sport}
        </h3>
        {classification && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold transition hover:bg-gold/20"
          >
            {classification}
          </button>
        )}
      </div>
      <p className="mb-2 text-sm font-medium text-gold/80">{event}</p>
      <p className="text-sm leading-relaxed text-slate">{why}</p>

      {classification && classificationExplainer && expanded && (
        <div className="mt-3 rounded-lg border border-gold/10 bg-gold/5 p-3">
          <p className="text-xs font-medium text-gold">
            Classification: {classification}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-silver">
            {classificationExplainer}
          </p>
        </div>
      )}
    </div>
  );
}
