module.exports = {
  apps: [
    {
      name: 'API_ENV_MANAGER',
      script: 'node ./dist/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
