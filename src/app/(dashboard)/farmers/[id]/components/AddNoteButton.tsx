"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AddAdvisoryNoteModal } from "./AddAdvisoryNoteModal";

export function AddNoteButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="brand" size="md" onClick={() => setIsOpen(true)}>
        + Add note
      </Button>
      <AddAdvisoryNoteModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
