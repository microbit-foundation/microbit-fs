import microbit from '@microbit/eslint-config';

export default [
  {
    ignores: [
      // Typedoc output.
      'docs',
      // Not part of any tsconfig project.
      'vitest.config.mts',
    ],
  },
  ...microbit,
];
