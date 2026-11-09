# Agent Guidelines

Rules for anyone (human or coding agent) changing this repo. The [README](README.md) explains what the app
does; the [backend](backend/README.md) and [frontend](frontend/README.md) READMEs explain how each part works.

## Before you start

- Read the README of the part you're changing, and look at existing code before adding new code.
- The risk thresholds, load rules and route ranking come from the assessment brief. Don't change them unless
  asked. If you do, update the tests and rebuild the demo trip (see Commands).
- Keep changes small and focused. Prefer clarity over cleverness, and don't add features the brief doesn't
  ask for without checking first.

## Commands

| What               | Backend (`backend/`)                                                      | Frontend (`frontend/`)           |
| ------------------ | ------------------------------------------------------------------------- | -------------------------------- |
| Run                | `python manage.py runserver`                                              | `npm run dev`                    |
| Tests              | `python manage.py test`                                                   | `npm test`                       |
| Lint / format      |                                                                           | `npm run lint`, `npm run format` |
| Type check / build |                                                                           | `npm run build`                  |
| API schema         | `python manage.py spectacular --validate --fail-on-warn --file /dev/null` |                                  |
| Rebuild demo trip  | `python manage.py build_demo_trip` (writes `frontend/public/demo/`)       |                                  |

Everything above must pass before a change is done. Tests never call the real routing, weather or
geocoding services.

## Code style (both parts)

- Small files with one clear job. Split a file before it gets long.
- Plain, descriptive names. Comments are short and explain _why_, not what the next line does. No banner
  or "step 1" comments.
- No speculative abstractions, and no try/except or try/catch "just in case".

## Backend (Django + DRF)

- `trips/clients/`: one module per outside service. Only these talk to the network, always through
  `clients/http.get_json`. They return dataclasses from `trips/domain.py`, never raw JSON.
- `trips/services/`: the business logic, as plain functions. No request objects, no serializers.
- `trips/serializers/`: request validation and response shape. They also generate the Swagger docs, so keep
  `help_text` useful.
- `trips/views/`: one small file per endpoint: validate with a serializer, call a service, return the
  serialized result. Document each with `@extend_schema`.
- Data shapes live in `trips/domain.py` as dataclasses.
- Errors the user should see are raised as the exceptions in `trips/exceptions.py`; DRF turns them into JSON
  responses, so views don't catch them.
- Cache outside lookups with Django's cache, and add new settings to `.env.example`.
- Tests patch `trips.clients.*` with the fakes in `trips/tests/fakes.py`.

## Frontend (React + TypeScript)

Structure and naming follow a feature-based layout:

- Folders are split by feature (`components/trips`, `services/trips`, `lib/trips`, `hooks/trips`,
  `queryOptions/trips`, `contexts/tripsContext.tsx`, `types/trips.ts`, `constants/trips.ts`,
  `validations/trips/`), plus `shared` for anything generic.
- One function per file, named after the function. Add every new file to its folder's `index.ts` and import
  from the folder (`@/lib/trips`), except inside the same feature folder, where a direct path avoids cycles.
- Exported functions and components are function declarations. Helpers and handlers inside them are arrow
  functions.
- Functions take one object of named parameters: `formatDuration({ minutes })`.
- Always use braces with `if`, even for one-line bodies.
- Inside components: state first, then context and hooks, then handlers. Handlers start with `handle`.
- `services/`: one API call per file, no try/catch. Throw `ApiError` with the API's message so the UI can
  show it. Fetching goes through `queryOptions/` and keys from `QUERY_KEYS`; user-triggered actions use
  `useMutation`, destructured as `{ mutate: handleX, isPending: isX }`, with errors shown via `handleError`.
- Types shared between files go in `types/`. A type used by a single file can stay in that file.
- Pure logic (no React, no network) goes in `lib/` or `utils/`, with a test next to it.

Styling:

- Use only the tokens defined in `src/app/globals.css`: the named spacing scale (`p-xl`, `gap-md`, `size-lg`),
  radius, font sizes and color tokens (`bg-background`, `text-text-secondary`, `bg-risk-severe`). Tailwind's
  default scales are switched off, so `p-4` or `bg-red-500` generate nothing.
- Every color lives in `globals.css`. Map layers can't use classes, so they read colors with `getCssVar()`.
- A new spacing, radius, font size or container token also goes into the tailwind-merge config in
  `src/utils/cn.ts`.
- Reuse the building blocks in `components/ui` (Button, Select, Slider, Tooltip, ...) and their variants
  instead of restyling them from outside.

## Commits

- Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`) and one short sentence.
- No co-author or "generated by" lines.
