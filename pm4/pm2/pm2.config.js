module.exports = {
  apps: [
    {
      name: "z2m",
      script: "index.js",
      cwd: "/data/local/nspanel_tools_pkg/z2m/z2m",
      out_file: "/dev/null",
      error_file: "/dev/null",
      max_memory_restart: "500M",
      instances: 1,
      exec_mode: "fork",
      kill_timeout: 30000,
      env: {
        "ZIGBEE2MQTT_DATA": "/data/local/nspanel_tools_pkg/z2m/data"
      }
    }
  ]
};
