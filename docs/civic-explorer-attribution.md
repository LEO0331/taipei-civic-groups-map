# Civic Explorer attribution

Layered SVG artwork in `src/explorer/HexIsland.tsx` is adapted from [Portfolio v3.0.1](https://github.com/LEO0331/portfolio/tree/v3.0.1), `src/components/explorer/HexIsland.tsx` ([PR #43](https://github.com/LEO0331/portfolio/pull/43)). Native controls, responsive scene/list, return/reset focus and reduced-motion patterns follow [Real Estate PR #6](https://github.com/LEO0331/taipei-real-estate-dashboard/pull/6) / [#8](https://github.com/LEO0331/taipei-real-estate-dashboard/pull/8), [Feitsui PR #8](https://github.com/LEO0331/taipei-feitsui-water-map/pull/8) and [Public Safety PR #10](https://github.com/LEO0331/taipei-safety-map/pull/10). The two map PRs were confirmed through merged-PR search; Public Safety's current component was also inspected through GitHub because its local checkout predates the integration.

Only the small artwork primitive is reused directly. The full Portfolio scene would render dataset islands; this integration instead derives seven category hubs from the host catalogue. Existing labels, category mappings and search metadata remain authoritative. No reference repository was modified. The complete MIT notice is retained in the SVG source and reproduced here for adapted presentation patterns.

MIT License

Copyright (c) 2026 LeoChen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
