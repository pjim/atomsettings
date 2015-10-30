(function() {
  var $, CompositeDisposable, Pty, Task, Terminal, TerminalPlusView, View, lastActiveElement, lastOpenedView, os, path, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Task = _ref.Task, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, View = _ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = TerminalPlusView = (function(_super) {
    __extends(TerminalPlusView, _super);

    function TerminalPlusView() {
      this.focus = __bind(this.focus, this);
      this.hide = __bind(this.hide, this);
      this.open = __bind(this.open, this);
      this.recieveItemOrFile = __bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = __bind(this.setAnimationSpeed, this);
      return TerminalPlusView.__super__.constructor.apply(this, arguments);
    }

    TerminalPlusView.prototype.opened = false;

    TerminalPlusView.prototype.animating = false;

    TerminalPlusView.prototype.windowHeight = $(window).height();

    TerminalPlusView.content = function() {
      return this.div({
        "class": 'terminal-plus terminal-view',
        outlet: 'terminalPlusView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.div({
            "class": 'btn-toolbar',
            outlet: 'toolbar'
          }, function() {
            _this.button({
              outlet: 'closeBtn',
              "class": 'btn inline-block-tight right',
              click: 'destroy'
            }, function() {
              return _this.span({
                "class": 'icon icon-x'
              });
            });
            _this.button({
              outlet: 'hideBtn',
              "class": 'btn inline-block-tight right',
              click: 'hide'
            }, function() {
              return _this.span({
                "class": 'icon icon-chevron-down'
              });
            });
            return _this.button({
              outlet: 'maximizeBtn',
              "class": 'btn inline-block-tight right',
              click: 'maximize'
            }, function() {
              return _this.span({
                "class": 'icon icon-screen-full'
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    TerminalPlusView.prototype.initialize = function() {
      var override;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      });
      this.subscriptions.add(this.maximizeBtn.tooltip);
      this.prevHeight = atom.config.get('terminal-plus.style.defaultPanelHeight');
      this.xterm.height(0);
      this.setAnimationSpeed();
      atom.config.onDidChange('terminal-plus.style.animationSpeed', this.setAnimationSpeed);
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('terminal-plus') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('click', this.focus);
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      return this.xterm.on('drop', this.recieveItemOrFile);
    };

    TerminalPlusView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('terminal-plus.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, _i, _len, _ref2, _results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        return this.input("" + (dataTransfer.getData('text/plain')) + " ");
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input("" + filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        _ref2 = dataTransfer.files;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          file = _ref2[_i];
          _results.push(this.input("" + file.path + " "));
        }
        return _results;
      }
    };

    TerminalPlusView.prototype.forkPtyProcess = function(shell, args) {
      var editorFolder, editorPath, home, projectFolder, pwd, _ref2;
      if (args == null) {
        args = [];
      }
      projectFolder = atom.project.getPaths()[0];
      editorPath = (_ref2 = atom.workspace.getActiveTextEditor()) != null ? _ref2.getPath() : void 0;
      if (editorPath != null) {
        editorFolder = path.dirname(editorPath);
      }
      home = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      switch (atom.config.get('terminal-plus.core.workingDirectory')) {
        case 'Project':
          pwd = projectFolder || editorFolder || home;
          break;
        case 'Active File':
          pwd = editorFolder || projectFolder || home;
          break;
        default:
          pwd = home;
      }
      return Task.once(Pty, path.resolve(pwd), shell, args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    TerminalPlusView.prototype.displayTerminal = function() {
      var args, cols, rows, shell, shellArguments, _ref2;
      _ref2 = this.getDimensions(), cols = _ref2.cols, rows = _ref2.rows;
      shell = atom.config.get('terminal-plus.core.shell');
      shellArguments = atom.config.get('terminal-plus.core.shellArguments');
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      this.ptyProcess = this.forkPtyProcess(shell, args);
      this.terminal = new Terminal({
        cursorBlink: atom.config.get('terminal-plus.toggles.cursorBlink'),
        scrollback: atom.config.get('terminal-plus.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    TerminalPlusView.prototype.attachListeners = function() {
      this.ptyProcess.on('terminal-plus:data', (function(_this) {
        return function(data) {
          _this.terminal.write(data);
          return _this.focusTerminal();
        };
      })(this));
      this.ptyProcess.on('terminal-plus:exit', (function(_this) {
        return function() {
          if (atom.config.get('terminal-plus.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.ptyProcess.on('terminal-plus:title', (function(_this) {
        return function(title) {
          return _this.statusIcon.updateTooltip(title);
        };
      })(this));
      this.ptyProcess.on('terminal-plus:clear-title', (function(_this) {
        return function() {
          return _this.statusIcon.removeTooltip();
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand;
          _this.applyStyle();
          _this.focus();
          autoRunCommand = atom.config.get('terminal-plus.core.autoRunCommand');
          if (autoRunCommand) {
            return _this.input("" + autoRunCommand + os.EOL);
          }
        };
      })(this));
    };

    TerminalPlusView.prototype.destroy = function() {
      var _ref2, _ref3;
      this.subscriptions.dispose();
      this.statusIcon.remove();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((_ref2 = this.ptyProcess) != null) {
        _ref2.terminate();
      }
      return (_ref3 = this.terminal) != null ? _ref3.destroy() : void 0;
    };

    TerminalPlusView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + $('.item-views').height();
      this.xterm.css('height', '');
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    TerminalPlusView.prototype.open = function() {
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            return _this.displayTerminal();
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    TerminalPlusView.prototype.hide = function() {
      var _ref2;
      if ((_ref2 = this.terminal) != null) {
        _ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    TerminalPlusView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    TerminalPlusView.prototype.input = function(data) {
      this.terminal.stopScrolling();
      this.ptyProcess.send({
        event: 'input',
        text: data
      });
      this.resizeTerminalToView();
      return this.focusTerminal();
    };

    TerminalPlusView.prototype.resize = function(cols, rows) {
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    TerminalPlusView.prototype.applyStyle = function() {
      var fontFamily, style;
      style = atom.config.get('terminal-plus.style');
      this.xterm.addClass(style.theme);
      fontFamily = ["monospace"];
      if (style.fontFamily !== '') {
        fontFamily.unshift(style.fontFamily);
      }
      this.terminal.element.style.fontFamily = fontFamily.join(', ');
      return this.terminal.element.style.fontSize = style.fontSize + 'px';
    };

    TerminalPlusView.prototype.attachResizeEvents = function() {
      this.on('focus', this.focus);
      $(window).on('resize', (function(_this) {
        return function() {
          var bottomPanel, clamped, delta, newHeight, overflow;
          _this.xterm.css('transition', '');
          newHeight = $(window).height();
          bottomPanel = $('atom-panel-container.bottom')[0];
          overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
          delta = newHeight - _this.windowHeight;
          _this.windowHeight = newHeight;
          if (_this.maximized) {
            clamped = Math.max(_this.maxHeight + delta, _this.rowHeight);
            if (_this.panel.isVisible()) {
              _this.adjustHeight(clamped);
            }
            _this.maxHeight = clamped;
            _this.prevHeight = Math.min(_this.prevHeight, _this.maxHeight);
          } else if (overflow > 0) {
            clamped = Math.max(_this.nearestRow(_this.prevHeight + delta), _this.rowHeight);
            if (_this.panel.isVisible()) {
              _this.adjustHeight(clamped);
            }
            _this.prevHeight = clamped;
          }
          _this.resizeTerminalToView();
          return _this.xterm.css('transition', "height " + (0.25 / _this.animationSpeed) + "s linear");
        };
      })(this));
      return this.panelDivider.on('mousedown', this.resizeStarted.bind(this));
    };

    TerminalPlusView.prototype.detachResizeEvents = function() {
      this.off('focus', this.focus);
      $(window).off('resize');
      return this.panelDivider.off('mousedown');
    };

    TerminalPlusView.prototype.attachEvents = function() {
      this.resizeTerminalToView = this.resizeTerminalToView.bind(this);
      this.resizePanel = this.resizePanel.bind(this);
      this.resizeStopped = this.resizeStopped.bind(this);
      return this.attachResizeEvents();
    };

    TerminalPlusView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    TerminalPlusView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    TerminalPlusView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    TerminalPlusView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    TerminalPlusView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    TerminalPlusView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    TerminalPlusView.prototype.insertSelection = function() {
      var cursor, editor, line, selection;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        return this.ptyProcess.send({
          event: 'input',
          text: "" + selection + os.EOL
        });
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        this.ptyProcess.send({
          event: 'input',
          text: "" + line + os.EOL
        });
        return editor.moveDown(1);
      }
    };

    TerminalPlusView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      return TerminalPlusView.__super__.focus.call(this);
    };

    TerminalPlusView.prototype.focusTerminal = function() {
      this.terminal.focus();
      return this.terminal.element.focus();
    };

    TerminalPlusView.prototype.resizeTerminalToView = function() {
      var cols, rows, _ref2;
      if (!this.panel.isVisible()) {
        return;
      }
      _ref2 = this.getDimensions(), cols = _ref2.cols, rows = _ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    TerminalPlusView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        this.terminal.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    TerminalPlusView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    return TerminalPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi92aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2SEFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLE9BQThCLE9BQUEsQ0FBUSxNQUFSLENBQTlCLEVBQUMsWUFBQSxJQUFELEVBQU8sMkJBQUEsbUJBQVAsQ0FBQTs7QUFBQSxFQUNBLFFBQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxVQUFBLENBQUQsRUFBSSxhQUFBLElBREosQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQixDQUhOLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVIsQ0FKWCxDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQU9BLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQVBMLENBQUE7O0FBQUEsRUFTQSxjQUFBLEdBQWlCLElBVGpCLENBQUE7O0FBQUEsRUFVQSxpQkFBQSxHQUFvQixJQVZwQixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHVDQUFBLENBQUE7Ozs7Ozs7OztLQUFBOztBQUFBLCtCQUFBLE1BQUEsR0FBUSxLQUFSLENBQUE7O0FBQUEsK0JBQ0EsU0FBQSxHQUFXLEtBRFgsQ0FBQTs7QUFBQSwrQkFFQSxZQUFBLEdBQWMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQUZkLENBQUE7O0FBQUEsSUFJQSxnQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sNkJBQVA7QUFBQSxRQUFzQyxNQUFBLEVBQVEsa0JBQTlDO09BQUwsRUFBdUUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyRSxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxlQUFQO0FBQUEsWUFBd0IsTUFBQSxFQUFRLGNBQWhDO1dBQUwsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sYUFBUDtBQUFBLFlBQXNCLE1BQUEsRUFBTyxTQUE3QjtXQUFMLEVBQTZDLFNBQUEsR0FBQTtBQUMzQyxZQUFBLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLE1BQUEsRUFBUSxVQUFSO0FBQUEsY0FBb0IsT0FBQSxFQUFPLDhCQUEzQjtBQUFBLGNBQTJELEtBQUEsRUFBTyxTQUFsRTthQUFSLEVBQXFGLFNBQUEsR0FBQTtxQkFDbkYsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGdCQUFBLE9BQUEsRUFBTyxhQUFQO2VBQU4sRUFEbUY7WUFBQSxDQUFyRixDQUFBLENBQUE7QUFBQSxZQUVBLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLE1BQUEsRUFBUSxTQUFSO0FBQUEsY0FBbUIsT0FBQSxFQUFPLDhCQUExQjtBQUFBLGNBQTBELEtBQUEsRUFBTyxNQUFqRTthQUFSLEVBQWlGLFNBQUEsR0FBQTtxQkFDL0UsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGdCQUFBLE9BQUEsRUFBTyx3QkFBUDtlQUFOLEVBRCtFO1lBQUEsQ0FBakYsQ0FGQSxDQUFBO21CQUlBLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLE1BQUEsRUFBUSxhQUFSO0FBQUEsY0FBdUIsT0FBQSxFQUFPLDhCQUE5QjtBQUFBLGNBQThELEtBQUEsRUFBTyxVQUFyRTthQUFSLEVBQXlGLFNBQUEsR0FBQTtxQkFDdkYsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGdCQUFBLE9BQUEsRUFBTyx1QkFBUDtlQUFOLEVBRHVGO1lBQUEsQ0FBekYsRUFMMkM7VUFBQSxDQUE3QyxDQURBLENBQUE7aUJBUUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE9BQVA7QUFBQSxZQUFnQixNQUFBLEVBQVEsT0FBeEI7V0FBTCxFQVRxRTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZFLEVBRFE7SUFBQSxDQUpWLENBQUE7O0FBQUEsK0JBZ0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixVQUFBLFFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsbUJBQUEsQ0FBQSxDQUFyQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxRQUFuQixFQUNqQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7T0FEaUIsQ0FBbkIsQ0FGQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNqQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7T0FEaUIsQ0FBbkIsQ0FKQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxXQUFuQixFQUNyQjtBQUFBLFFBQUEsS0FBQSxFQUFPLFlBQVA7T0FEcUIsQ0FOdkIsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEMsQ0FSQSxDQUFBO0FBQUEsTUFVQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsQ0FWZCxDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFkLENBWEEsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FiQSxDQUFBO0FBQUEsTUFjQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0Isb0NBQXhCLEVBQThELElBQUMsQ0FBQSxpQkFBL0QsQ0FkQSxDQUFBO0FBQUEsTUFnQkEsUUFBQSxHQUFXLFNBQUMsS0FBRCxHQUFBO0FBQ1QsUUFBQSxJQUFVLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQWpDLENBQXlDLGVBQXpDLENBQUEsS0FBNkQsTUFBdkU7QUFBQSxnQkFBQSxDQUFBO1NBQUE7QUFBQSxRQUNBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FEQSxDQUFBO2VBRUEsS0FBSyxDQUFDLGVBQU4sQ0FBQSxFQUhTO01BQUEsQ0FoQlgsQ0FBQTtBQUFBLE1BcUJBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBbUIsSUFBQyxDQUFBLEtBQXBCLENBckJBLENBQUE7QUFBQSxNQXVCQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxXQUFWLEVBQXVCLFFBQXZCLENBdkJBLENBQUE7QUFBQSxNQXdCQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxVQUFWLEVBQXNCLFFBQXRCLENBeEJBLENBQUE7YUF5QkEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixJQUFDLENBQUEsaUJBQW5CLEVBMUJVO0lBQUEsQ0FoQlosQ0FBQTs7QUFBQSwrQkE0Q0EsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQixDQUFsQixDQUFBO0FBQ0EsTUFBQSxJQUF5QixJQUFDLENBQUEsY0FBRCxLQUFtQixDQUE1QztBQUFBLFFBQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsR0FBbEIsQ0FBQTtPQURBO2FBR0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUEwQixTQUFBLEdBQVEsQ0FBQyxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQVQsQ0FBUixHQUFnQyxVQUExRCxFQUppQjtJQUFBLENBNUNuQixDQUFBOztBQUFBLCtCQWtEQSxpQkFBQSxHQUFtQixTQUFDLEtBQUQsR0FBQTtBQUNqQixVQUFBLHVEQUFBO0FBQUEsTUFBQSxLQUFLLENBQUMsY0FBTixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsS0FBSyxDQUFDLGVBQU4sQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVDLGVBQWdCLEtBQUssQ0FBQyxjQUF0QixZQUZELENBQUE7QUFJQSxNQUFBLElBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsWUFBckIsQ0FBQSxLQUFzQyxNQUF6QztlQUNFLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFFLENBQUMsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsWUFBckIsQ0FBRCxDQUFGLEdBQXNDLEdBQTdDLEVBREY7T0FBQSxNQUVLLElBQUcsUUFBQSxHQUFXLFlBQVksQ0FBQyxPQUFiLENBQXFCLGFBQXJCLENBQWQ7ZUFDSCxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQUEsR0FBRyxRQUFILEdBQVksR0FBbkIsRUFERztPQUFBLE1BRUEsSUFBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQW5CLEdBQTRCLENBQS9CO0FBQ0g7QUFBQTthQUFBLDRDQUFBOzJCQUFBO0FBQ0Usd0JBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxFQUFBLEdBQUcsSUFBSSxDQUFDLElBQVIsR0FBYSxHQUFwQixFQUFBLENBREY7QUFBQTt3QkFERztPQVRZO0lBQUEsQ0FsRG5CLENBQUE7O0FBQUEsK0JBK0RBLGNBQUEsR0FBZ0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ2QsVUFBQSx5REFBQTs7UUFEc0IsT0FBSztPQUMzQjtBQUFBLE1BQUEsYUFBQSxHQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBeEMsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxpRUFBaUQsQ0FBRSxPQUF0QyxDQUFBLFVBRGIsQ0FBQTtBQUVBLE1BQUEsSUFBMkMsa0JBQTNDO0FBQUEsUUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBQWYsQ0FBQTtPQUZBO0FBQUEsTUFHQSxJQUFBLEdBQVUsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBdkIsR0FBb0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFoRCxHQUE4RCxPQUFPLENBQUMsR0FBRyxDQUFDLElBSGpGLENBQUE7QUFLQSxjQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FBUDtBQUFBLGFBQ08sU0FEUDtBQUNzQixVQUFBLEdBQUEsR0FBTSxhQUFBLElBQWlCLFlBQWpCLElBQWlDLElBQXZDLENBRHRCO0FBQ087QUFEUCxhQUVPLGFBRlA7QUFFMEIsVUFBQSxHQUFBLEdBQU0sWUFBQSxJQUFnQixhQUFoQixJQUFpQyxJQUF2QyxDQUYxQjtBQUVPO0FBRlA7QUFHTyxVQUFBLEdBQUEsR0FBTSxJQUFOLENBSFA7QUFBQSxPQUxBO2FBVUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQWYsRUFBa0MsS0FBbEMsRUFBeUMsSUFBekMsRUFBK0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUM3QyxVQUFBLEtBQUMsQ0FBQSxLQUFELEdBQVMsU0FBQSxHQUFBLENBQVQsQ0FBQTtpQkFDQSxLQUFDLENBQUEsTUFBRCxHQUFVLFNBQUEsR0FBQSxFQUZtQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9DLEVBWGM7SUFBQSxDQS9EaEIsQ0FBQTs7QUFBQSwrQkE4RUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLDhDQUFBO0FBQUEsTUFBQSxRQUFlLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZixFQUFDLGFBQUEsSUFBRCxFQUFPLGFBQUEsSUFBUCxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixDQURSLENBQUE7QUFBQSxNQUVBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixDQUZqQixDQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sY0FBYyxDQUFDLEtBQWYsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBQyxNQUE3QixDQUFvQyxTQUFDLEdBQUQsR0FBQTtlQUFRLElBQVI7TUFBQSxDQUFwQyxDQUhQLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBdkIsQ0FKZCxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFFBQUEsQ0FBUztBQUFBLFFBQ3ZCLFdBQUEsRUFBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixDQURLO0FBQUEsUUFFdkIsVUFBQSxFQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCLENBRks7QUFBQSxRQUd2QixNQUFBLElBSHVCO0FBQUEsUUFHakIsTUFBQSxJQUhpQjtPQUFULENBTmhCLENBQUE7QUFBQSxNQVlBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FaQSxDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBYkEsQ0FBQTthQWNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLENBQVgsQ0FBZixFQWZlO0lBQUEsQ0E5RWpCLENBQUE7O0FBQUEsK0JBK0ZBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxvQkFBZixFQUFxQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDbkMsVUFBQSxLQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsSUFBaEIsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxhQUFELENBQUEsRUFGbUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQyxDQUFBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLG9CQUFmLEVBQXFDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDbkMsVUFBQSxJQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBZDttQkFBQSxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUE7V0FEbUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQyxDQUpBLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLHFCQUFmLEVBQXNDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtpQkFDcEMsS0FBQyxDQUFBLFVBQVUsQ0FBQyxhQUFaLENBQTBCLEtBQTFCLEVBRG9DO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsQ0FQQSxDQUFBO0FBQUEsTUFVQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSwyQkFBZixFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUMxQyxLQUFDLENBQUEsVUFBVSxDQUFDLGFBQVosQ0FBQSxFQUQwQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBVkEsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLEdBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FiaEIsQ0FBQTtBQUFBLE1BZUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxFQUFWLENBQWEsTUFBYixFQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7aUJBQ25CLEtBQUMsQ0FBQSxLQUFELENBQU8sSUFBUCxFQURtQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBZkEsQ0FBQTthQWtCQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxNQUFmLEVBQXVCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDckIsY0FBQSxjQUFBO0FBQUEsVUFBQSxLQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixDQUZqQixDQUFBO0FBR0EsVUFBQSxJQUF1QyxjQUF2QzttQkFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLEVBQUEsR0FBRyxjQUFILEdBQW9CLEVBQUUsQ0FBQyxHQUE5QixFQUFBO1dBSnFCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsRUFuQmU7SUFBQSxDQS9GakIsQ0FBQTs7QUFBQSwrQkF3SEEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsWUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsa0JBQVgsQ0FBOEIsSUFBOUIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUhBLENBQUE7QUFLQSxNQUFBLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQURBLENBREY7T0FMQTtBQVFBLE1BQUEsSUFBRyxJQUFDLENBQUEsVUFBRCxJQUFnQixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQS9CO0FBQ0UsUUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVUsQ0FBQyxXQUF2QixDQUFtQyxJQUFDLENBQUEsVUFBcEMsQ0FBQSxDQURGO09BUkE7O2FBV1csQ0FBRSxTQUFiLENBQUE7T0FYQTtvREFZUyxDQUFFLE9BQVgsQ0FBQSxXQWJPO0lBQUEsQ0F4SFQsQ0FBQTs7QUFBQSwrQkF1SUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsR0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBbkMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFyQixDQUFBLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsTUFBakIsQ0FBQSxDQUgzQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLEVBQXJCLENBSkEsQ0FBQTtBQUFBLE1BS0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFzQixNQUF0QixDQUxOLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsQ0FOQSxDQUFBO0FBUUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFKO0FBQ0UsUUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxXQUFuQixFQUNyQjtBQUFBLFVBQUEsS0FBQSxFQUFPLFlBQVA7U0FEcUIsQ0FBdkIsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEMsQ0FGQSxDQUFBO0FBQUEsUUFHQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxVQUFmLENBSEEsQ0FBQTtBQUFBLFFBSUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0Isb0JBQWhCLENBQXFDLENBQUMsUUFBdEMsQ0FBK0Msa0JBQS9DLENBSkEsQ0FBQTtlQUtBLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFOZjtPQUFBLE1BQUE7QUFRRSxRQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO0FBQUEsVUFBQSxLQUFBLEVBQU8sUUFBUDtTQURxQixDQUF2QixDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFoQyxDQUZBLENBQUE7QUFBQSxRQUdBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLFNBQWYsQ0FIQSxDQUFBO0FBQUEsUUFJQSxHQUFHLENBQUMsV0FBSixDQUFnQixrQkFBaEIsQ0FBbUMsQ0FBQyxRQUFwQyxDQUE2QyxvQkFBN0MsQ0FKQSxDQUFBO2VBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQWJmO09BVFE7SUFBQSxDQXZJVixDQUFBOztBQUFBLCtCQStKQSxJQUFBLEdBQU0sU0FBQSxHQUFBOztRQUNKLG9CQUFxQixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVg7T0FBckI7QUFFQSxNQUFBLElBQUcsY0FBQSxJQUFtQixjQUFBLEtBQWtCLElBQXhDO0FBQ0UsUUFBQSxjQUFjLENBQUMsSUFBZixDQUFBLENBQUEsQ0FERjtPQUZBO0FBQUEsTUFJQSxjQUFBLEdBQWlCLElBSmpCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxTQUFTLENBQUMscUJBQVgsQ0FBaUMsSUFBakMsQ0FMQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQU5BLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixVQUFBLElBQUcsQ0FBQSxLQUFLLENBQUEsTUFBUjtBQUNFLFlBQUEsS0FBQyxDQUFBLE1BQUQsR0FBVSxJQUFWLENBQUE7bUJBQ0EsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUZGO1dBQUEsTUFBQTttQkFJRSxLQUFDLENBQUEsS0FBRCxDQUFBLEVBSkY7V0FEZTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLENBUkEsQ0FBQTtBQUFBLE1BZUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FmQSxDQUFBO0FBQUEsTUFnQkEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsQ0FBZCxDQWhCQSxDQUFBO0FBQUEsTUFpQkEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQWpCYixDQUFBO2FBa0JBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFpQixJQUFDLENBQUEsU0FBSixHQUFtQixJQUFDLENBQUEsU0FBcEIsR0FBbUMsSUFBQyxDQUFBLFVBQWxELEVBbkJJO0lBQUEsQ0EvSk4sQ0FBQTs7QUFBQSwrQkFvTEEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsS0FBQTs7YUFBUyxDQUFFLElBQVgsQ0FBQTtPQUFBO0FBQUEsTUFDQSxjQUFBLEdBQWlCLElBRGpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBWixDQUFBLENBRkEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNmLFVBQUEsS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxJQUFPLHNCQUFQO0FBQ0UsWUFBQSxJQUFHLHlCQUFIO0FBQ0UsY0FBQSxpQkFBaUIsQ0FBQyxLQUFsQixDQUFBLENBQUEsQ0FBQTtxQkFDQSxpQkFBQSxHQUFvQixLQUZ0QjthQURGO1dBRmU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQUpBLENBQUE7QUFBQSxNQVdBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFpQixJQUFDLENBQUEsU0FBSixHQUFtQixJQUFDLENBQUEsU0FBcEIsR0FBbUMsSUFBQyxDQUFBLFVBQWxELENBWEEsQ0FBQTtBQUFBLE1BWUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQVpiLENBQUE7YUFhQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFkLEVBZEk7SUFBQSxDQXBMTixDQUFBOztBQUFBLCtCQW9NQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFFQSxNQUFBLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxJQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBSEY7T0FITTtJQUFBLENBcE1SLENBQUE7O0FBQUEsK0JBNE1BLEtBQUEsR0FBTyxTQUFDLElBQUQsR0FBQTtBQUNMLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsSUFBQSxFQUFNLElBQXRCO09BQWpCLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUpLO0lBQUEsQ0E1TVAsQ0FBQTs7QUFBQSwrQkFrTkEsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTthQUNOLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQjtBQUFBLFFBQUMsS0FBQSxFQUFPLFFBQVI7QUFBQSxRQUFrQixNQUFBLElBQWxCO0FBQUEsUUFBd0IsTUFBQSxJQUF4QjtPQUFqQixFQURNO0lBQUEsQ0FsTlIsQ0FBQTs7QUFBQSwrQkFxTkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsaUJBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLENBQVIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQWdCLEtBQUssQ0FBQyxLQUF0QixDQUZBLENBQUE7QUFBQSxNQUlBLFVBQUEsR0FBYSxDQUFDLFdBQUQsQ0FKYixDQUFBO0FBS0EsTUFBQSxJQUEyQyxLQUFLLENBQUMsVUFBTixLQUFvQixFQUEvRDtBQUFBLFFBQUEsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsS0FBSyxDQUFDLFVBQXpCLENBQUEsQ0FBQTtPQUxBO0FBQUEsTUFNQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBeEIsR0FBcUMsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FOckMsQ0FBQTthQU9BLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUF4QixHQUFtQyxLQUFLLENBQUMsUUFBTixHQUFpQixLQVIxQztJQUFBLENBck5aLENBQUE7O0FBQUEsK0JBK05BLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixNQUFBLElBQUMsQ0FBQSxFQUFELENBQUksT0FBSixFQUFhLElBQUMsQ0FBQSxLQUFkLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxRQUFiLEVBQXVCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDckIsY0FBQSxnREFBQTtBQUFBLFVBQUEsS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixFQUF6QixDQUFBLENBQUE7QUFBQSxVQUNBLFNBQUEsR0FBWSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBRFosQ0FBQTtBQUFBLFVBRUEsV0FBQSxHQUFjLENBQUEsQ0FBRSw2QkFBRixDQUFpQyxDQUFBLENBQUEsQ0FGL0MsQ0FBQTtBQUFBLFVBR0EsUUFBQSxHQUFXLFdBQVcsQ0FBQyxZQUFaLEdBQTJCLFdBQVcsQ0FBQyxZQUhsRCxDQUFBO0FBQUEsVUFLQSxLQUFBLEdBQVEsU0FBQSxHQUFZLEtBQUMsQ0FBQSxZQUxyQixDQUFBO0FBQUEsVUFNQSxLQUFDLENBQUEsWUFBRCxHQUFnQixTQU5oQixDQUFBO0FBUUEsVUFBQSxJQUFHLEtBQUMsQ0FBQSxTQUFKO0FBQ0UsWUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFDLENBQUEsU0FBRCxHQUFhLEtBQXRCLEVBQTZCLEtBQUMsQ0FBQSxTQUE5QixDQUFWLENBQUE7QUFFQSxZQUFBLElBQXlCLEtBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQXpCO0FBQUEsY0FBQSxLQUFDLENBQUEsWUFBRCxDQUFjLE9BQWQsQ0FBQSxDQUFBO2FBRkE7QUFBQSxZQUdBLEtBQUMsQ0FBQSxTQUFELEdBQWEsT0FIYixDQUFBO0FBQUEsWUFLQSxLQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBQyxDQUFBLFVBQVYsRUFBc0IsS0FBQyxDQUFBLFNBQXZCLENBTGQsQ0FERjtXQUFBLE1BT0ssSUFBRyxRQUFBLEdBQVcsQ0FBZDtBQUNILFlBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBQyxDQUFBLFVBQUQsQ0FBWSxLQUFDLENBQUEsVUFBRCxHQUFjLEtBQTFCLENBQVQsRUFBMkMsS0FBQyxDQUFBLFNBQTVDLENBQVYsQ0FBQTtBQUVBLFlBQUEsSUFBeUIsS0FBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBekI7QUFBQSxjQUFBLEtBQUMsQ0FBQSxZQUFELENBQWMsT0FBZCxDQUFBLENBQUE7YUFGQTtBQUFBLFlBR0EsS0FBQyxDQUFBLFVBQUQsR0FBYyxPQUhkLENBREc7V0FmTDtBQUFBLFVBb0JBLEtBQUMsQ0FBQSxvQkFBRCxDQUFBLENBcEJBLENBQUE7aUJBcUJBLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBMEIsU0FBQSxHQUFRLENBQUMsSUFBQSxHQUFPLEtBQUMsQ0FBQSxjQUFULENBQVIsR0FBZ0MsVUFBMUQsRUF0QnFCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsQ0FEQSxDQUFBO2FBd0JBLElBQUMsQ0FBQSxZQUFZLENBQUMsRUFBZCxDQUFpQixXQUFqQixFQUE4QixJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsSUFBcEIsQ0FBOUIsRUF6QmtCO0lBQUEsQ0EvTnBCLENBQUE7O0FBQUEsK0JBMFBBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixNQUFBLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLElBQUMsQ0FBQSxLQUFmLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBYyxRQUFkLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixXQUFsQixFQUhrQjtJQUFBLENBMVBwQixDQUFBOztBQUFBLCtCQStQQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osTUFBQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBQyxDQUFBLG9CQUFvQixDQUFDLElBQXRCLENBQTJCLElBQTNCLENBQXhCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLElBQWxCLENBRGYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLElBQXBCLENBRmpCLENBQUE7YUFHQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxFQUpZO0lBQUEsQ0EvUGQsQ0FBQTs7QUFBQSwrQkFxUUEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLE1BQUEsSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxNQUFqQixDQUFBLENBRDNCLENBQUE7QUFBQSxNQUVBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsV0FBZixFQUE0QixJQUFDLENBQUEsV0FBN0IsQ0FGQSxDQUFBO0FBQUEsTUFHQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsSUFBQyxDQUFBLGFBQTNCLENBSEEsQ0FBQTthQUlBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsRUFBekIsRUFMYTtJQUFBLENBclFmLENBQUE7O0FBQUEsK0JBNFFBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixNQUFBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLFdBQWhCLEVBQTZCLElBQUMsQ0FBQSxXQUE5QixDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLFNBQWhCLEVBQTJCLElBQUMsQ0FBQSxhQUE1QixDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQTBCLFNBQUEsR0FBUSxDQUFDLElBQUEsR0FBTyxJQUFDLENBQUEsY0FBVCxDQUFSLEdBQWdDLFVBQTFELEVBSGE7SUFBQSxDQTVRZixDQUFBOztBQUFBLCtCQWlSQSxVQUFBLEdBQVksU0FBQyxLQUFELEdBQUE7QUFDVixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsY0FBTyxRQUFTLElBQUMsQ0FBQSxVQUFqQixDQUFBO0FBQ0EsYUFBTyxJQUFBLEdBQU8sSUFBQyxDQUFBLFNBQWYsQ0FGVTtJQUFBLENBalJaLENBQUE7O0FBQUEsK0JBcVJBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTtBQUNYLFVBQUEsc0JBQUE7QUFBQSxNQUFBLElBQStCLEtBQUssQ0FBQyxLQUFOLEtBQWUsQ0FBOUM7QUFBQSxlQUFPLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBUCxDQUFBO09BQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsS0FBSyxDQUFDLEtBRnBDLENBQUE7QUFBQSxNQUdBLEtBQUEsR0FBUSxNQUFBLEdBQVMsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsTUFBakMsQ0FBQSxDQUhqQixDQUFBO0FBSUEsTUFBQSxJQUFBLENBQUEsQ0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBQSxHQUFrQixDQUFDLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBYixHQUFpQixDQUFsQixDQUFoQyxDQUFBO0FBQUEsY0FBQSxDQUFBO09BSkE7QUFBQSxNQU1BLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUExQixDQUFULEVBQTJDLElBQUMsQ0FBQSxTQUE1QyxDQU5WLENBQUE7QUFPQSxNQUFBLElBQVUsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFyQjtBQUFBLGNBQUEsQ0FBQTtPQVBBO0FBQUEsTUFTQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxPQUFkLENBVEEsQ0FBQTtBQUFBLE1BVUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBWixDQUFvQixDQUFDLE1BQXJCLENBQTRCLE9BQTVCLENBVkEsQ0FBQTtBQUFBLE1BV0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQVhkLENBQUE7YUFhQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxFQWRXO0lBQUEsQ0FyUmIsQ0FBQTs7QUFBQSwrQkFxU0EsWUFBQSxHQUFjLFNBQUMsTUFBRCxHQUFBO0FBQ1osTUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxNQUFkLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxNQUFyQixDQUE0QixNQUE1QixFQUZZO0lBQUEsQ0FyU2QsQ0FBQTs7QUFBQSwrQkF5U0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsd0NBQUE7QUFBQSxNQUFBLElBQUksSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFkO0FBQ0UsUUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFWLENBQUEsQ0FBWCxDQUFBO0FBQUEsUUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQ0wsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFEZixFQUNtQixJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUR2QyxFQUVMLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBRmYsRUFFbUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFGdkMsQ0FEUCxDQURGO09BQUEsTUFBQTtBQU1FLFFBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQWxCLENBQUEsQ0FBZ0MsQ0FBQyxRQUFqQyxDQUFBLENBQVYsQ0FBQTtBQUFBLFFBQ0EsUUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFSLENBQWMsUUFBZCxDQURYLENBQUE7QUFBQSxRQUVBLEtBQUEsR0FBUSxRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsSUFBRCxHQUFBO2lCQUNuQixJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FBd0IsQ0FBQyxTQUF6QixDQUFBLEVBRG1CO1FBQUEsQ0FBYixDQUZSLENBQUE7QUFBQSxRQUlBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FKUCxDQU5GO09BQUE7YUFXQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBcUIsSUFBckIsRUFaSTtJQUFBLENBelNOLENBQUE7O0FBQUEsK0JBdVRBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsS0FBRCxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQVAsRUFESztJQUFBLENBdlRQLENBQUE7O0FBQUEsK0JBMFRBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSwrQkFBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLENBQWMsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBRyxTQUFBLEdBQVksTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUFmO0FBQ0UsUUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7QUFBQSxVQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsVUFBZ0IsSUFBQSxFQUFNLEVBQUEsR0FBRyxTQUFILEdBQWUsRUFBRSxDQUFDLEdBQXhDO1NBQWpCLEVBRkY7T0FBQSxNQUdLLElBQUcsTUFBQSxHQUFTLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVo7QUFDSCxRQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsTUFBTSxDQUFDLEdBQW5DLENBQVAsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7QUFBQSxVQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsVUFBZ0IsSUFBQSxFQUFNLEVBQUEsR0FBRyxJQUFILEdBQVUsRUFBRSxDQUFDLEdBQW5DO1NBQWpCLENBRkEsQ0FBQTtlQUdBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBSkc7T0FMVTtJQUFBLENBMVRqQixDQUFBOztBQUFBLCtCQXFVQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsTUFBQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FEQSxDQUFBO2FBRUEsMENBQUEsRUFISztJQUFBLENBclVQLENBQUE7O0FBQUEsK0JBMFVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQWxCLENBQUEsRUFGYTtJQUFBLENBMVVmLENBQUE7O0FBQUEsK0JBOFVBLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUNwQixVQUFBLGlCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFFQSxRQUFlLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZixFQUFDLGFBQUEsSUFBRCxFQUFPLGFBQUEsSUFGUCxDQUFBO0FBR0EsTUFBQSxJQUFBLENBQUEsQ0FBYyxJQUFBLEdBQU8sQ0FBUCxJQUFhLElBQUEsR0FBTyxDQUFsQyxDQUFBO0FBQUEsY0FBQSxDQUFBO09BSEE7QUFJQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsUUFBZjtBQUFBLGNBQUEsQ0FBQTtPQUpBO0FBS0EsTUFBQSxJQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixLQUFrQixJQUFsQixJQUEyQixJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsS0FBa0IsSUFBdkQ7QUFBQSxjQUFBLENBQUE7T0FMQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLEVBQWMsSUFBZCxDQVBBLENBQUE7YUFRQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBakIsRUFBdUIsSUFBdkIsRUFUb0I7SUFBQSxDQTlVdEIsQ0FBQTs7QUFBQSwrQkF5VkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsNEJBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsZ0NBQUYsQ0FBVixDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFKO0FBQ0UsUUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLFdBQU4sQ0FBa0IsQ0FBQyxNQUFuQixDQUEwQixPQUExQixDQUFBLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxPQUFPLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsS0FBbkIsQ0FBQSxDQUEyQixDQUFBLENBQUEsQ0FBRSxDQUFDLHFCQUE5QixDQUFBLENBRFYsQ0FBQTtBQUFBLFFBRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FBQSxHQUFpQixDQUFDLE9BQU8sQ0FBQyxLQUFSLElBQWlCLENBQWxCLENBQTVCLENBRlAsQ0FBQTtBQUFBLFFBR0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBQSxHQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFSLElBQWtCLEVBQW5CLENBQTdCLENBSFAsQ0FBQTtBQUFBLFFBSUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUMsTUFKckIsQ0FBQTtBQUFBLFFBS0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLEdBQXNCLE9BQU8sQ0FBQyxNQUw5QixDQUFBO0FBQUEsUUFNQSxPQUFPLENBQUMsTUFBUixDQUFBLENBTkEsQ0FERjtPQUFBLE1BQUE7QUFTRSxRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsQ0FBNUIsQ0FBUCxDQUFBO0FBQUEsUUFDQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFBLEdBQWtCLEVBQTdCLENBRFAsQ0FURjtPQUZBO2FBY0E7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sTUFBQSxJQUFQO1FBZmE7SUFBQSxDQXpWZixDQUFBOztBQUFBLCtCQTBXQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxHQUFBO2FBQ2YsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcscUJBQVgsRUFBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNoQyxVQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLFNBQUQsR0FBYSxNQUZtQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLEVBRGU7SUFBQSxDQTFXakIsQ0FBQTs7NEJBQUE7O0tBRDZCLEtBYi9CLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/pjim/.atom/packages/terminal-plus/lib/view.coffee
