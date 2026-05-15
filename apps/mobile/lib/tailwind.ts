import { create } from 'twrnc';

// Metro resolves this once at startup. Swap this file path if you relocate the Tailwind config.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const resolved = require('../tailwind.config.js');

export default create(resolved.default ?? resolved);
