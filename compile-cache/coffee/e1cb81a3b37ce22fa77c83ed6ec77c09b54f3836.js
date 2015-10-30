(function() {
  module.exports = {
    personalAccessToken: {
      description: 'Your personal GitHub access token',
      type: 'string',
      "default": '',
      order: 1
    },
    gistId: {
      description: 'ID of gist to use for configuration storage',
      type: 'string',
      "default": '',
      order: 2
    },
    syncSettings: {
      type: 'boolean',
      "default": true,
      order: 3
    },
    syncPackages: {
      type: 'boolean',
      "default": true,
      order: 4
    },
    syncKeymap: {
      type: 'boolean',
      "default": true,
      order: 5
    },
    syncStyles: {
      type: 'boolean',
      "default": true,
      order: 6
    },
    syncInit: {
      type: 'boolean',
      "default": true,
      order: 7
    },
    syncSnippets: {
      type: 'boolean',
      "default": true,
      order: 8
    },
    extraFiles: {
      description: 'Comma-seperated list of files other than Atom\'s default config files in ~/.atom',
      type: 'array',
      "default": [],
      items: {
        type: 'string'
      },
      order: 9
    },
    analytics: {
      type: 'boolean',
      "default": true,
      description: "There is Segment.io which forwards data to Google Analytics to track what versions and platforms are used. Everything is anonymized and no personal information, such as source code, is sent. See the README.md for more details.",
      order: 10
    },
    _analyticsUserId: {
      type: 'string',
      "default": "",
      description: "Unique identifier for this user for tracking usage analytics",
      order: 11
    },
    checkForUpdatedBackup: {
      description: 'Check for newer backup on Atom start',
      type: 'boolean',
      "default": true,
      order: 12
    },
    _lastBackupHash: {
      type: 'string',
      "default": '',
      description: 'Hash of the last backup restored or created',
      order: 13
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9jb25maWcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixtQkFBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQWEsbUNBQWI7QUFBQSxNQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsRUFGVDtBQUFBLE1BR0EsS0FBQSxFQUFPLENBSFA7S0FGYTtBQUFBLElBTWYsTUFBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQWEsNkNBQWI7QUFBQSxNQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsRUFGVDtBQUFBLE1BR0EsS0FBQSxFQUFPLENBSFA7S0FQYTtBQUFBLElBV2YsWUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxNQUVBLEtBQUEsRUFBTyxDQUZQO0tBWmE7QUFBQSxJQWVmLFlBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsTUFFQSxLQUFBLEVBQU8sQ0FGUDtLQWhCYTtBQUFBLElBbUJmLFVBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsTUFFQSxLQUFBLEVBQU8sQ0FGUDtLQXBCYTtBQUFBLElBdUJmLFVBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsTUFFQSxLQUFBLEVBQU8sQ0FGUDtLQXhCYTtBQUFBLElBMkJmLFFBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsTUFFQSxLQUFBLEVBQU8sQ0FGUDtLQTVCYTtBQUFBLElBK0JmLFlBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsTUFFQSxLQUFBLEVBQU8sQ0FGUDtLQWhDYTtBQUFBLElBbUNmLFVBQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUFhLGtGQUFiO0FBQUEsTUFDQSxJQUFBLEVBQU0sT0FETjtBQUFBLE1BRUEsU0FBQSxFQUFTLEVBRlQ7QUFBQSxNQUdBLEtBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47T0FKRjtBQUFBLE1BS0EsS0FBQSxFQUFPLENBTFA7S0FwQ2E7QUFBQSxJQTBDZixTQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsTUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLE1BRUEsV0FBQSxFQUFhLG9PQUZiO0FBQUEsTUFNQSxLQUFBLEVBQU8sRUFOUDtLQTNDYTtBQUFBLElBa0RmLGdCQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsTUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLE1BRUEsV0FBQSxFQUFhLDhEQUZiO0FBQUEsTUFHQSxLQUFBLEVBQU8sRUFIUDtLQW5EYTtBQUFBLElBdURmLHFCQUFBLEVBQ0U7QUFBQSxNQUFBLFdBQUEsRUFBYSxzQ0FBYjtBQUFBLE1BQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxJQUZUO0FBQUEsTUFHQSxLQUFBLEVBQU8sRUFIUDtLQXhEYTtBQUFBLElBNERmLGVBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsTUFFQSxXQUFBLEVBQWEsNkNBRmI7QUFBQSxNQUdBLEtBQUEsRUFBTyxFQUhQO0tBN0RhO0dBQWpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/pjim/.atom/packages/sync-settings/lib/config.coffee
