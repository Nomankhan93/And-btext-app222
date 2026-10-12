# Current Patch — Web 0.19.5

**Safe Error Presentation & Diagnostics**

Shared error presentation now classifies network, authentication, permission and internal backend failures into safe user-facing copy. Backend `details`, `hint`, SQL/RLS implementation text and error codes are retained only in structured diagnostic context rather than appended to UI messages. Existing safe validation and domain errors remain actionable.

See `PATCH_0_19_5_README.md`.
