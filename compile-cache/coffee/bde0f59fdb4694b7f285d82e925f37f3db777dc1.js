(function() {
  var child, filteredEnvironment, fs, path, pty, systemLanguage, _;

  pty = require('pty.js');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var command, language;
    language = "en_US.UTF-8";
    if (process.platform === 'darwin') {
      try {
        command = 'plutil -convert json -o - ~/Library/Preferences/.GlobalPreferences.plist';
        language = "" + (JSON.parse(child.execSync(command).toString()).AppleLocale) + ".UTF-8";
      } catch (_error) {}
    }
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ATOM_SHELL_INTERNAL_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    env.LANG = systemLanguage;
    env.TERM_PROGRAM = 'Terminal-Plus';
    return env;
  })();

  module.exports = function(pwd, shell, args, options) {
    var callback, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (/zsh|bash/.test(shell) && args.indexOf('--login') === -1) {
      args.unshift('--login');
    }
    ptyProcess = pty.fork(shell, args, {
      cwd: pwd,
      env: filteredEnvironment,
      name: 'xterm-256color'
    });
    title = shell = path.basename(shell);
    ptyProcess.on('data', function(data) {
      return emit('terminal-plus:data', data);
    });
    ptyProcess.on('data', function() {
      var newTitle;
      newTitle = ptyProcess.process;
      if (newTitle === shell) {
        emit('terminal-plus:clear-title');
      } else if (title !== newTitle) {
        emit('terminal-plus:title', newTitle);
      }
      return title = newTitle;
    });
    ptyProcess.on('exit', function() {
      emit('terminal-plus:exit');
      return callback();
    });
    return process.on('message', function(_arg) {
      var cols, event, rows, text, _ref;
      _ref = _arg != null ? _arg : {}, event = _ref.event, cols = _ref.cols, rows = _ref.rows, text = _ref.text;
      switch (event) {
        case 'resize':
          return ptyProcess.resize(cols, rows);
        case 'input':
          return ptyProcess.write(text);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi9wcm9jZXNzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0REFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUhKLENBQUE7O0FBQUEsRUFJQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FKUixDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFvQixDQUFBLFNBQUEsR0FBQTtBQUNsQixRQUFBLGlCQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsYUFBWCxDQUFBO0FBQ0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLFFBQXZCO0FBQ0U7QUFDRSxRQUFBLE9BQUEsR0FBVSwwRUFBVixDQUFBO0FBQUEsUUFDQSxRQUFBLEdBQVcsRUFBQSxHQUFFLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLE9BQWYsQ0FBdUIsQ0FBQyxRQUF4QixDQUFBLENBQVgsQ0FBOEMsQ0FBQyxXQUFoRCxDQUFGLEdBQThELFFBRHpFLENBREY7T0FBQSxrQkFERjtLQURBO0FBS0EsV0FBTyxRQUFQLENBTmtCO0VBQUEsQ0FBQSxDQUFILENBQUEsQ0FOakIsQ0FBQTs7QUFBQSxFQWNBLG1CQUFBLEdBQXlCLENBQUEsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsR0FBQTtBQUFBLElBQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxJQUFGLENBQU8sT0FBTyxDQUFDLEdB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

//# sourceURL=/home/pjim/.atom/packages/terminal-plus/lib/process.coffee