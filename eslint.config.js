import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'

export default [
  // 0. Ignore patterns (replaces .eslintignore)
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.min.js', 'dist-options/**']
  },

  // 1. Include base recommended configs
  ...pluginVue.configs['flat/essential'],

  // 2. Define custom project formatting and env overrides
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.webextensions,
        ...globals.browser
      }
    },
    rules: {
      // Replaces the prettier skip-formatting behaviour
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-newline': 'off'
    }
  }
]
