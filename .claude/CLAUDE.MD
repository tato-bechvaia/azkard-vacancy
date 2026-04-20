## Frontend Design Skill

This skill guides creation of distinctive, production-grade frontend interfaces.
Avoid generic "AI slop" aesthetics. Implement real working code with exceptional
attention to aesthetic detail.

### Design Thinking (do this before coding)

Commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this solve? Who uses it?
- **Tone**: Pick an extreme — brutally minimal, maximalist, retro-futuristic,
  luxury/refined, editorial/magazine, brutalist/raw, soft/pastel, etc.
- **Differentiation**: What makes this unforgettable?

Execute with intentionality. Bold maximalism and refined minimalism both work —
the key is precision, not intensity.

### Aesthetics Rules

- **Typography**: Use distinctive, characterful fonts. Never Arial, Inter, Roboto,
  or system fonts. Pair a display font with a refined body font.
- **Color**: Commit to a cohesive palette via CSS variables. Dominant colors +
  sharp accents. Never timid, evenly-distributed palettes.
- **Motion**: CSS animations for HTML. Motion library for React. One well-orchestrated
  page load with staggered reveals > scattered micro-interactions. Use hover states
  that surprise.
- **Layout**: Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous
  negative space OR controlled density — never default grid.
- **Backgrounds**: Gradient meshes, noise textures, geometric patterns, layered
  transparencies, dramatic shadows, grain overlays. Never flat solid colors.

### Never Do
- Purple gradients on white backgrounds
- Predictable card/grid layouts
- Cookie-cutter components with no context-specific character
- Converge on the same fonts/colors across generations (e.g. Space Grotesk every time)

### Stack Context (Azkard)
- React + Vite + Tailwind CSS
- Use Tailwind utility classes as base, extend with custom CSS when Tailwind is limiting
- CSS variables for design tokens
- Prefer component-level scoping