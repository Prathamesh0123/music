/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
  './src/**/*.{html,ts}',
  "./node_modules/flowbite/**/*.js" // Add this line
],



  theme: {
    extend: {},
  },
  plugins: [
      require('flowbite/plugin') // Add this line
  ],
}

