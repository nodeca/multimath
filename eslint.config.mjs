import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['browser', 'node'],
    ignores: [
      'support/**',
      'coverage/**',
    ]
  }),

  {
    rules: {
      camelcase: 'off',
      'one-var': 'off',
      '@stylistic/space-infix-ops': 'off'
    }
  },
]
