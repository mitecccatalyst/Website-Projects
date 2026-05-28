export default {
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4197",
  },
  webServer: {
    command: "python -m http.server 4197 --bind 127.0.0.1",
    url: "http://127.0.0.1:4197",
    reuseExistingServer: true,
  },
};
