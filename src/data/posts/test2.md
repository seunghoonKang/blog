---
title: "2025-10-10"
pubDate: 2025-10-10

description: "This is the first post of my new Astro blog."
author: "Astro Learner"
image:
  url: "https://docs.astro.build/assets/rose.webp"
  alt: "The Astro logo on a dark background with a pink glow."
tags: ["astro", "blogging", "learning in public"]
---

---

### Example 1

Importing a component from the `/components` directory.

This component will accept a javascript date object and format it as a string.

```astro
import DateComp from "../../../components/FormattedDate.astro";

<DateComp date={new Date()} />
```

import FormattedDate from "../../../components/FormattedDate.astro";

<FormattedDate date={new Date()} />

---

### Example 2

Importing a component from a relative path to your content.

This component will display an alert when you click the button.

```astro
import RelativeComponent from "./component.astro";

<RelativeComponent />
```

import RelativeComponent from "./component.astro";

<RelativeComponent />

---

Nano is an extremely lightweight theme, with no frameworks, so there aren't
any examples of react, vue, solid etc. You can integrate these frameworks using
the guide below, and also use those components in your mdx files.

Don't forget to
use the `client` directive to make them interactive.

```astro
<ReactComponent client:load />
```

---

### More Links

- [MDX Syntax Documentation](https://mdxjs.com/docs/what-is-mdx)
- [Astro Framework Integrations](https://docs.astro.build/en/guides/integrations-guide)
- [Astro Usage Documentation](https://docs.astro.build/en/guides/markdown-content/#markdown-and-mdx-pages)
- **Note:** [Client Directives](https://docs.astro.build/en/reference/directives-reference/#
