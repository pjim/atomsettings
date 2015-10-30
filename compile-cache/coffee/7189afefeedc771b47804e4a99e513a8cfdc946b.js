(function() {
  var BufferedProcess, DESCRIPTION, GitHubApi, PackageManager, REMOVE_KEYS, SyncSettings, Tracker, fs, _, _ref,
    __hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  _ = require('underscore-plus');

  _ref = [], GitHubApi = _ref[0], PackageManager = _ref[1], Tracker = _ref[2];

  DESCRIPTION = 'Atom configuration storage operated by http://atom.io/packages/sync-settings';

  REMOVE_KEYS = ["sync-settings"];

  SyncSettings = {
    config: require('./config.coffee'),
    activate: function() {
      return setImmediate((function(_this) {
        return function() {
          if (GitHubApi == null) {
            GitHubApi = require('github');
          }
          if (PackageManager == null) {
            PackageManager = require('./package-manager');
          }
          if (Tracker == null) {
            Tracker = require('./tracker');
          }
          atom.commands.add('atom-workspace', "sync-settings:backup", function() {
            _this.backup();
            return _this.tracker.track('Backup');
          });
          atom.commands.add('atom-workspace', "sync-settings:restore", function() {
            _this.restore();
            return _this.tracker.track('Restore');
          });
          atom.commands.add('atom-workspace', "sync-settings:view-backup", function() {
            _this.viewBackup();
            return _this.tracker.track('View backup');
          });
          if (atom.config.get('sync-settings.checkForUpdatedBackup')) {
            _this.checkForUpdate();
          }
          _this.tracker = new Tracker('sync-settings._analyticsUserId', 'sync-settings.analytics');
          return _this.tracker.trackActivate();
        };
      })(this));
    },
    deactivate: function() {
      return this.tracker.trackDeactivate();
    },
    serialize: function() {},
    checkForUpdate: function(cb) {
      if (cb == null) {
        cb = null;
      }
      if (atom.config.get('sync-settings.gistId')) {
        console.debug('checking latest backup...');
        return this.createClient().gists.get({
          id: atom.config.get('sync-settings.gistId')
        }, (function(_this) {
          return function(err, res) {
            var SyntaxError, message;
            console.debug(err, res);
            if (err) {
              console.error("error while retrieving the gist. does it exists?", err);
              try {
                message = JSON.parse(err.message).message;
                if (message === 'Not Found') {
                  message = 'Gist ID Not Found';
                }
              } catch (_error) {
                SyntaxError = _error;
                message = err.message;
              }
              atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
              return typeof cb === "function" ? cb() : void 0;
            }
            console.debug("latest backup version " + res.history[0].version);
            if (res.history[0].version !== atom.config.get('sync-settings._lastBackupHash')) {
              _this.notifyNewerBackup();
            } else {
              _this.notifyBackupUptodate();
            }
            return typeof cb === "function" ? cb() : void 0;
          };
        })(this));
      } else {
        return this.notifyMissingGistId();
      }
    },
    notifyNewerBackup: function() {
      var notification, workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return notification = atom.notifications.addWarning("sync-settings: Your settings are out of date.", {
        dismissable: true,
        buttons: [
          {
            text: "Backup",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:backup");
              return notification.dismiss();
            }
          }, {
            text: "View backup",
            onDidClick: function() {
              return atom.commands.dispatch(workspaceElement, "sync-settings:view-backup");
            }
          }, {
            text: "Restore",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:restore");
              return notification.dismiss();
            }
          }, {
            text: "Dismiss",
            onDidClick: function() {
              return notification.dismiss();
            }
          }
        ]
      });
    },
    notifyBackupUptodate: function() {
      return atom.notifications.addSuccess("sync-settings: Latest backup is already applied.");
    },
    notifyMissingGistId: function() {
      return atom.notifications.addError("sync-settings: Missing gist ID");
    },
    backup: function(cb) {
      var cmtend, cmtstart, ext, file, files, _i, _len, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      if (cb == null) {
        cb = null;
      }
      files = {};
      if (atom.config.get('sync-settings.syncSettings')) {
        files["settings.json"] = {
          content: JSON.stringify(atom.config.settings, this.filterSettings, '\t')
        };
      }
      if (atom.config.get('sync-settings.syncPackages')) {
        files["packages.json"] = {
          content: JSON.stringify(this.getPackages(), null, '\t')
        };
      }
      if (atom.config.get('sync-settings.syncKeymap')) {
        files["keymap.cson"] = {
          content: (_ref1 = this.fileContent(atom.keymaps.getUserKeymapPath())) != null ? _ref1 : "# keymap file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncStyles')) {
        files["styles.less"] = {
          content: (_ref2 = this.fileContent(atom.styles.getUserStyleSheetPath())) != null ? _ref2 : "// styles file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncInit')) {
        files["init.coffee"] = {
          content: (_ref3 = this.fileContent(atom.config.configDirPath + "/init.coffee")) != null ? _ref3 : "# initialization file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncSnippets')) {
        files["snippets.cson"] = {
          content: (_ref4 = this.fileContent(atom.config.configDirPath + "/snippets.cson")) != null ? _ref4 : "# snippets file (not found)"
        };
      }
      _ref6 = (_ref5 = atom.config.get('sync-settings.extraFiles')) != null ? _ref5 : [];
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        file = _ref6[_i];
        ext = file.slice(file.lastIndexOf(".")).toLowerCase();
        cmtstart = "#";
        if (ext === ".less" || ext === ".scss" || ext === ".js") {
          cmtstart = "//";
        }
        if (ext === ".css") {
          cmtstart = "/*";
        }
        cmtend = "";
        if (ext === ".css") {
          cmtend = "*/";
        }
        files[file] = {
          content: (_ref7 = this.fileContent(atom.config.configDirPath + ("/" + file))) != null ? _ref7 : "" + cmtstart + " " + file + " (not found) " + cmtend
        };
      }
      return this.createClient().gists.edit({
        id: atom.config.get('sync-settings.gistId'),
        description: "automatic update by http://atom.io/packages/sync-settings",
        files: files
      }, function(err, res) {
        var message;
        if (err) {
          console.error("error backing up data: " + err.message, err);
          message = JSON.parse(err.message).message;
          if (message === 'Not Found') {
            message = 'Gist ID Not Found';
          }
          atom.notifications.addError("sync-settings: Error backing up your settings. (" + message + ")");
        } else {
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully backed up. <br/><a href='" + res.html_url + "'>Click here to open your Gist.</a>");
        }
        return typeof cb === "function" ? cb(err, res) : void 0;
      });
    },
    viewBackup: function() {
      var Shell, gistId;
      Shell = require('shell');
      gistId = atom.config.get('sync-settings.gistId');
      return Shell.openExternal("https://gist.github.com/" + gistId);
    },
    getPackages: function() {
      var info, name, theme, version, _ref1, _ref2, _results;
      _ref1 = atom.packages.getLoadedPackages();
      _results = [];
      for (name in _ref1) {
        if (!__hasProp.call(_ref1, name)) continue;
        info = _ref1[name];
        _ref2 = info.metadata, name = _ref2.name, version = _ref2.version, theme = _ref2.theme;
        _results.push({
          name: name,
          version: version,
          theme: theme
        });
      }
      return _results;
    },
    restore: function(cb) {
      if (cb == null) {
        cb = null;
      }
      return this.createClient().gists.get({
        id: atom.config.get('sync-settings.gistId')
      }, (function(_this) {
        return function(err, res) {
          var callbackAsync, file, filename, message, _ref1;
          if (err) {
            console.error("error while retrieving the gist. does it exists?", err);
            message = JSON.parse(err.message).message;
            if (message === 'Not Found') {
              message = 'Gist ID Not Found';
            }
            atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
            return;
          }
          callbackAsync = false;
          _ref1 = res.files;
          for (filename in _ref1) {
            if (!__hasProp.call(_ref1, filename)) continue;
            file = _ref1[filename];
            switch (filename) {
              case 'settings.json':
                if (atom.config.get('sync-settings.syncSettings')) {
                  _this.applySettings('', JSON.parse(file.content));
                }
                break;
              case 'packages.json':
                if (atom.config.get('sync-settings.syncPackages')) {
                  callbackAsync = true;
                  _this.installMissingPackages(JSON.parse(file.content), cb);
                }
                break;
              case 'keymap.cson':
                if (atom.config.get('sync-settings.syncKeymap')) {
                  fs.writeFileSync(atom.keymaps.getUserKeymapPath(), file.content);
                }
                break;
              case 'styles.less':
                if (atom.config.get('sync-settings.syncStyles')) {
                  fs.writeFileSync(atom.styles.getUserStyleSheetPath(), file.content);
                }
                break;
              case 'init.coffee':
                if (atom.config.get('sync-settings.syncInit')) {
                  fs.writeFileSync(atom.config.configDirPath + "/init.coffee", file.content);
                }
                break;
              case 'snippets.cson':
                if (atom.config.get('sync-settings.syncSnippets')) {
                  fs.writeFileSync(atom.config.configDirPath + "/snippets.cson", file.content);
                }
                break;
              default:
                fs.writeFileSync("" + atom.config.configDirPath + "/" + filename, file.content);
            }
          }
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully synchronized.");
          if (!callbackAsync) {
            return cb();
          }
        };
      })(this));
    },
    createClient: function() {
      var github, token;
      token = atom.config.get('sync-settings.personalAccessToken');
      console.debug("Creating GitHubApi client with token = " + token);
      github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https'
      });
      github.authenticate({
        type: 'oauth',
        token: token
      });
      return github;
    },
    filterSettings: function(key, value) {
      if (key === "") {
        return value;
      }
      if (~REMOVE_KEYS.indexOf(key)) {
        return void 0;
      }
      return value;
    },
    applySettings: function(pref, settings) {
      var key, keyPath, value, _results;
      _results = [];
      for (key in settings) {
        value = settings[key];
        keyPath = "" + pref + "." + key;
        if (_.isObject(value) && !_.isArray(value)) {
          _results.push(this.applySettings(keyPath, value));
        } else {
          console.debug("config.set " + keyPath.slice(1) + "=" + value);
          _results.push(atom.config.set(keyPath.slice(1), value));
        }
      }
      return _results;
    },
    installMissingPackages: function(packages, cb) {
      var pending, pkg, _i, _len;
      pending = 0;
      for (_i = 0, _len = packages.length; _i < _len; _i++) {
        pkg = packages[_i];
        if (atom.packages.isPackageLoaded(pkg.name)) {
          continue;
        }
        pending++;
        this.installPackage(pkg, function() {
          pending--;
          if (pending === 0) {
            return typeof cb === "function" ? cb() : void 0;
          }
        });
      }
      if (pending === 0) {
        return typeof cb === "function" ? cb() : void 0;
      }
    },
    installPackage: function(pack, cb) {
      var packageManager, type;
      type = pack.theme ? 'theme' : 'package';
      console.info("Installing " + type + " " + pack.name + "...");
      packageManager = new PackageManager();
      return packageManager.install(pack, function(error) {
        var _ref1;
        if (error != null) {
          console.error("Installing " + type + " " + pack.name + " failed", (_ref1 = error.stack) != null ? _ref1 : error, error.stderr);
        } else {
          console.info("Installed " + type + " " + pack.name);
        }
        return typeof cb === "function" ? cb(error) : void 0;
      });
    },
    fileContent: function(filePath) {
      var e;
      try {
        return fs.readFileSync(filePath, {
          encoding: 'utf8'
        }) || null;
      } catch (_error) {
        e = _error;
        console.error("Error reading file " + filePath + ". Probably doesn't exist.", e);
        return null;
      }
    }
  };

  module.exports = SyncSettings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9zeW5jLXNldHRpbmdzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSx3R0FBQTtJQUFBLDZCQUFBOztBQUFBLEVBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUdBLE9BQXVDLEVBQXZDLEVBQUMsbUJBQUQsRUFBWSx3QkFBWixFQUE0QixpQkFINUIsQ0FBQTs7QUFBQSxFQU1BLFdBQUEsR0FBYyw4RUFOZCxDQUFBOztBQUFBLEVBT0EsV0FBQSxHQUFjLENBQUMsZUFBRCxDQVBkLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FBUjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUVSLFlBQUEsQ0FBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBOztZQUVYLFlBQWEsT0FBQSxDQUFRLFFBQVI7V0FBYjs7WUFDQSxpQkFBa0IsT0FBQSxDQUFRLG1CQUFSO1dBRGxCOztZQUVBLFVBQVcsT0FBQSxDQUFRLFdBQVI7V0FGWDtBQUFBLFVBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxzQkFBcEMsRUFBNEQsU0FBQSxHQUFBO0FBQzFELFlBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxLQUFULENBQWUsUUFBZixFQUYwRDtVQUFBLENBQTVELENB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

//# sourceURL=/home/pjim/.atom/packages/sync-settings/lib/sync-settings.coffee
