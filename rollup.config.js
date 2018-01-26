export default {
  input: 'dist/index.js',
  sourcemap: false,
  output: {
    name: 'ng.jsvwr',
    format: 'umd',
    file: 'dist/bundles/jsvwr.umd.js',
    globals: {
      '@angular/core': 'ng.core',
      '@angular/common': 'ng.common'
    }
  },
  external: [
    '@angular/core',
    '@angular/common'
  ]
}
