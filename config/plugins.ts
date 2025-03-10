export default () => ({
  upload: {
    config: {
      providerOptions: {
        sizeLimit: 600 * 1024 * 1024, // 500MB limit
      },
    },
  },
});
