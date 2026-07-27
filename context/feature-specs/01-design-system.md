Read AGENTS.md before starting.

We're adding the design systems and UI primitive components.

Install and configure `shadcn/ui`.

Add these shadcn components:
- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea

Do not modify the generated `components/ui/*` files after installation.

Also install `lucide-react`.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.


Ensure all the components match the dark theme in `global.css`.

### Check when done
- All components import without errors
- `cn()` works properly
- No defualt light styling appears
