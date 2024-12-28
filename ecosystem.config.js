module.exports = {
  apps: [
    {
      name: 'MEME-MANAGER',
      script: 'node ./dist/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
