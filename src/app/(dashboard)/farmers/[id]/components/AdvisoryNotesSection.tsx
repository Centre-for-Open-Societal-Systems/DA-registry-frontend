import { ADVISORY_NOTES } from "@/features/farmers/data";
import { SectionCard } from "./SectionCard";
import { AddNoteButton } from "./AddNoteButton";

export function AdvisoryNotesSection({ limit }: { limit?: number }) {
  const notes = limit ? ADVISORY_NOTES.slice(0, limit) : ADVISORY_NOTES;

  return (
    <SectionCard
      title="Advisory Notes"
      action={<AddNoteButton />}
      bodyClassName="p-0"
    >
      <ul>
        {notes.map((note, index) => (
          <li key={`${note.date}-${index}`} className="border-b border-[#E5E7EB] px-5 py-3.5 last:border-0">
            <p className="text-[13.5px] font-semibold text-[#1a2b3c]">
              {note.date} · {note.author}
            </p>
            <p className="mt-0.5 text-[13.5px] text-[#475569]">{note.text}</p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
