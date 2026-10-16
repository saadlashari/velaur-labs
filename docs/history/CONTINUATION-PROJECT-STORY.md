# Project story and gallery integrity update

- Fixed a data-loss bug: editing project content paragraphs previously replaced the entire JSONB content object, deleting gallery screenshots and other fields. Paragraph updates now preserve sibling keys.
- Added independent Challenge, Solution, Outcome fields to the project CMS, persisted within existing projects.content JSONB.
- Public project detail page displays only non-empty story sections, with responsive panel layout.
- Gallery stays independent of description edits.
- Not included: population/verification of 37 real projects, image rights checks, actual browser/Neon QA or complete premium redesign.
