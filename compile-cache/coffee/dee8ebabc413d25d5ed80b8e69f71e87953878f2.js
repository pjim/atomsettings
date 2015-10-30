(function() {
  var $, CompositeDisposable, RenameDialog, StatusIcon,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = require('atom-space-pen-views').$;

  CompositeDisposable = require('atom').CompositeDisposable;

  RenameDialog = null;

  module.exports = StatusIcon = (function(_super) {
    __extends(StatusIcon, _super);

    function StatusIcon() {
      return StatusIcon.__super__.constructor.apply(this, arguments);
    }

    StatusIcon.prototype.active = false;

    StatusIcon.prototype.process = '';

    StatusIcon.prototype.initialize = function(terminalView) {
      var _ref;
      this.terminalView = terminalView;
      this.classList.add('status-icon');
      this.icon = document.createElement('i');
      this.icon.classList.add('icon', 'icon-terminal');
      this.appendChild(this.icon);
      this.name = document.createElement('span');
      this.name.classList.add('name');
      this.appendChild(this.name);
      this.dataset.type = (_ref = this.terminalView.constructor) != null ? _ref.name : void 0;
      return this.addEventListener('click', (function(_this) {
        return function(_arg) {
          var ctrlKey, which;
          which = _arg.which, ctrlKey = _arg.ctrlKey;
          if (which === 1) {
            _this.terminalView.toggle();
            return true;
          } else if (which === 2) {
            _this.terminalView.destroy();
            return false;
          }
        };
      })(this));
    };

    StatusIcon.prototype.updateTooltip = function(process) {
      if (process == null) {
        return;
      }
      this.process = process;
      return this.tooltip = atom.tooltips.add(this, {
        title: this.process,
        html: false,
        delay: {
          show: 500,
          hide: 250
        }
      });
    };

    StatusIcon.prototype.removeTooltip = function() {
      var _ref;
      return (_ref = this.tooltip) != null ? _ref.dispose() : void 0;
    };

    StatusIcon.prototype.close = function() {
      this.terminal.destroy();
      return this.destroy();
    };

    StatusIcon.prototype.destroy = function() {
      this.subscriptions.dispose();
      return this.remove();
    };

    StatusIcon.prototype.activate = function() {
      this.classList.add('active');
      return this.active = true;
    };

    StatusIcon.prototype.deactivate = function() {
      this.classList.remove('active');
      return this.active = false;
    };

    StatusIcon.prototype.toggle = function() {
      if (this.active) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
      return this.active = !this.active;
    };

    StatusIcon.prototype.isActive = function() {
      return this.active;
    };

    StatusIcon.prototype.rename = function() {
      var dialog;
      if (RenameDialog == null) {
        RenameDialog = require('./rename-dialog');
      }
      dialog = new RenameDialog(this);
      return dialog.attach();
    };

    StatusIcon.prototype.getName = function() {
      return this.name.textContent.substring(1);
    };

    StatusIcon.prototype.updateName = function(name) {
      if (name) {
        name = "&nbsp;" + name;
      }
      return this.name.innerHTML = name;
    };

    return StatusIcon;

  })(HTMLElement);

  module.exports = document.registerElement('status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi9zdGF0dXMtaWNvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLElBQUssT0FBQSxDQUFRLHNCQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsSUFIZixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxNQUFBLEdBQVEsS0FBUixDQUFBOztBQUFBLHlCQUNBLE9BQUEsR0FBUyxFQURULENBQUE7O0FBQUEseUJBR0EsVUFBQSxHQUFZLFNBQUUsWUFBRixHQUFBO0FBQ1YsVUFBQSxJQUFBO0FBQUEsTUFEVyxJQUFDLENBQUEsZUFBQSxZQUNaLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLGFBQWYsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBRlIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEIsRUFBNEIsZUFBNUIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxJQUFkLENBSkEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QixDQU5SLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFD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

//# sourceURL=/home/pjim/.atom/packages/terminal-plus/lib/status-icon.coffee
