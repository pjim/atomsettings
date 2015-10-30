(function() {
  var $, CompositeDisposable, StatusBar, StatusIcon, TerminalPlusView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-space-pen-views'), $ = _ref.$, View = _ref.View;

  TerminalPlusView = require('./view');

  StatusIcon = require('./status-icon');

  module.exports = StatusBar = (function(_super) {
    __extends(StatusBar, _super);

    function StatusBar() {
      this.moveTerminalView = __bind(this.moveTerminalView, this);
      this.onDrop = __bind(this.onDrop, this);
      this.onDragOver = __bind(this.onDragOver, this);
      this.onDragEnd = __bind(this.onDragEnd, this);
      this.onDragLeave = __bind(this.onDragLeave, this);
      this.onDragStart = __bind(this.onDragStart, this);
      this.closeAll = __bind(this.closeAll, this);
      return StatusBar.__super__.constructor.apply(this, arguments);
    }

    StatusBar.prototype.terminalViews = [];

    StatusBar.prototype.activeIndex = 0;

    StatusBar.content = function() {
      return this.div({
        "class": 'terminal-plus status-bar',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.i({
            "class": "icon icon-plus",
            click: 'newTerminalView',
            outlet: 'plusBtn'
          });
          _this.ul({
            "class": "list-inline status-container",
            tabindex: '-1',
            outlet: 'statusContainer',
            is: 'space-pen-ul'
          });
          return _this.i({
            "class": "icon icon-x",
            click: 'closeAll',
            outlet: 'closeBtn'
          });
        };
      })(this));
    };

    StatusBar.prototype.initialize = function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'terminal-plus:new': (function(_this) {
          return function() {
            return _this.newTerminalView();
          };
        })(this),
        'terminal-plus:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'terminal-plus:next': (function(_this) {
          return function() {
            return _this.activeNextTerminalView();
          };
        })(this),
        'terminal-plus:prev': (function(_this) {
          return function() {
            return _this.activePrevTerminalView();
          };
        })(this),
        'terminal-plus:close': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.destroy();
            });
          };
        })(this),
        'terminal-plus:insert-selected-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection();
            });
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.xterm', {
        'terminal-plus:paste': (function(_this) {
          return function() {
            return _this.runInOpenView(function(i) {
              return i.paste();
            });
          };
        })(this),
        'terminal-plus:copy': (function(_this) {
          return function() {
            return _this.runInOpenView(function(i) {
              return i.copy();
            });
          };
        })(this)
      }));
      this.registerCommands();
      this.subscriptions.add(atom.tooltips.add(this.plusBtn, {
        title: 'New Terminal'
      }));
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close All'
      }));
      this.statusContainer.on('dblclick', (function(_this) {
        return function(event) {
          if (event.target === event.delegateTarget) {
            return _this.newTerminalView();
          }
        };
      })(this));
      this.statusContainer.on('dragstart', '.status-icon', this.onDragStart);
      this.statusContainer.on('dragend', '.status-icon', this.onDragEnd);
      this.statusContainer.on('dragleave', this.onDragLeave);
      this.statusContainer.on('dragover', this.onDragOver);
      this.statusContainer.on('drop', this.onDrop);
      return this.attach();
    };

    StatusBar.prototype.registerCommands = function() {
      return this.subscriptions.add(atom.commands.add('.terminal-plus', {
        'terminal-plus:status-red': this.setStatusColor,
        'terminal-plus:status-orange': this.setStatusColor,
        'terminal-plus:status-yellow': this.setStatusColor,
        'terminal-plus:status-green': this.setStatusColor,
        'terminal-plus:status-blue': this.setStatusColor,
        'terminal-plus:status-purple': this.setStatusColor,
        'terminal-plus:status-pink': this.setStatusColor,
        'terminal-plus:status-cyan': this.setStatusColor,
        'terminal-plus:status-magenta': this.setStatusColor,
        'terminal-plus:status-default': this.clearStatusColor,
        'terminal-plus:context-close': function(event) {
          return $(event.target).closest('.status-icon')[0].terminalView.destroy();
        },
        'terminal-plus:context-hide': function(event) {
          var statusIcon;
          statusIcon = $(event.target).closest('.status-icon')[0];
          if (statusIcon.isActive()) {
            return statusIcon.terminalView.hide();
          }
        },
        'terminal-plus:context-rename': function(event) {
          return $(event.target).closest('.status-icon')[0].rename();
        },
        'terminal-plus:close-all': this.closeAll
      }));
    };

    StatusBar.prototype.createTerminalView = function() {
      var statusIcon, terminalPlusView;
      statusIcon = new StatusIcon();
      terminalPlusView = new TerminalPlusView();
      statusIcon.initialize(terminalPlusView);
      terminalPlusView.statusBar = this;
      terminalPlusView.statusIcon = statusIcon;
      terminalPlusView.panel = atom.workspace.addBottomPanel({
        item: terminalPlusView,
        visible: false
      });
      this.terminalViews.push(terminalPlusView);
      this.statusContainer.append(statusIcon);
      return terminalPlusView;
    };

    StatusBar.prototype.activeNextTerminalView = function() {
      return this.activeTerminalView(this.activeIndex + 1);
    };

    StatusBar.prototype.activePrevTerminalView = function() {
      return this.activeTerminalView(this.activeIndex - 1);
    };

    StatusBar.prototype.activeTerminalView = function(index) {
      if (!(this.terminalViews.length > 1)) {
        return;
      }
      if (index >= this.terminalViews.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.terminalViews.length - 1;
      }
      return this.terminalViews[index].open();
    };

    StatusBar.prototype.getActiveTerminalView = function() {
      return this.terminalViews[this.activeIndex];
    };

    StatusBar.prototype.runInActiveView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if (view != null) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.runInOpenView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if ((view != null) && view.panel.isVisible()) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.setActiveTerminalView = function(terminalView) {
      return this.activeIndex = this.terminalViews.indexOf(terminalView);
    };

    StatusBar.prototype.removeTerminalView = function(terminalView) {
      var index;
      index = this.terminalViews.indexOf(terminalView);
      if (index < 0) {
        return;
      }
      this.terminalViews.splice(index, 1);
      if (index <= this.activeIndex && this.activeIndex > 0) {
        return this.activeIndex--;
      }
    };

    StatusBar.prototype.newTerminalView = function() {
      return this.createTerminalView().toggle();
    };

    StatusBar.prototype.attach = function() {
      return atom.workspace.addBottomPanel({
        item: this,
        priority: 100
      });
    };

    StatusBar.prototype.destroyActiveTerm = function() {
      if (this.terminalViews[this.activeIndex] != null) {
        return this.terminalViews[this.activeIndex].destroy();
      }
    };

    StatusBar.prototype.closeAll = function() {
      var index, o, _i, _ref1;
      for (index = _i = _ref1 = this.terminalViews.length; _ref1 <= 0 ? _i <= 0 : _i >= 0; index = _ref1 <= 0 ? ++_i : --_i) {
        o = this.terminalViews[index];
        if (o != null) {
          o.destroy();
        }
      }
      return this.activeIndex = 0;
    };

    StatusBar.prototype.destroy = function() {
      var view, _i, _len, _ref1;
      this.subscriptions.dispose();
      _ref1 = this.terminalViews;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.ptyProcess.terminate();
        view.terminal.destroy();
      }
      return this.detach();
    };

    StatusBar.prototype.toggle = function() {
      if (this.terminalViews[this.activeIndex] == null) {
        this.createTerminalView();
      }
      return this.terminalViews[this.activeIndex].toggle();
    };

    StatusBar.prototype.setStatusColor = function(event) {
      var color;
      color = event.type.match(/\w+$/)[0];
      color = atom.config.get("terminal-plus.colors." + color).toRGBAString();
      return $(event.target).closest('.status-icon').css('color', color);
    };

    StatusBar.prototype.clearStatusColor = function(event) {
      return $(event.target).closest('.status-icon').css('color', '');
    };

    StatusBar.prototype.onDragStart = function(event) {
      var element;
      event.originalEvent.dataTransfer.setData('terminal-plus', 'true');
      element = $(event.target).closest('.status-icon');
      element.addClass('is-dragging');
      return event.originalEvent.dataTransfer.setData('from-index', element.index());
    };

    StatusBar.prototype.onDragLeave = function(event) {
      return this.removePlaceholder();
    };

    StatusBar.prototype.onDragEnd = function(event) {
      return this.clearDropTarget();
    };

    StatusBar.prototype.onDragOver = function(event) {
      var element, newDropTargetIndex, statusIcons;
      event.preventDefault();
      event.stopPropagation();
      if (event.originalEvent.dataTransfer.getData('terminal-plus') !== 'true') {
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      this.removeDropTargetClasses();
      statusIcons = this.statusContainer.children('.status-icon');
      if (newDropTargetIndex < statusIcons.length) {
        element = statusIcons.eq(newDropTargetIndex).addClass('is-drop-target');
        return this.getPlaceholder().insertBefore(element);
      } else {
        element = statusIcons.eq(newDropTargetIndex - 1).addClass('drop-target-is-after');
        return this.getPlaceholder().insertAfter(element);
      }
    };

    StatusBar.prototype.onDrop = function(event) {
      var dataTransfer, fromIndex, toIndex;
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('terminal-plus') !== 'true') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      fromIndex = parseInt(dataTransfer.getData('from-index'));
      toIndex = this.getDropTargetIndex(event);
      this.clearDropTarget();
      return this.updateOrder(fromIndex, toIndex);
    };

    StatusBar.prototype.clearDropTarget = function() {
      var element;
      element = this.find('.is-dragging');
      element.removeClass('is-dragging');
      this.removeDropTargetClasses();
      return this.removePlaceholder();
    };

    StatusBar.prototype.removeDropTargetClasses = function() {
      this.statusContainer.find('.is-drop-target').removeClass('is-drop-target');
      return this.statusContainer.find('.drop-target-is-after').removeClass('drop-target-is-after');
    };

    StatusBar.prototype.getDropTargetIndex = function(event) {
      var element, elementCenter, statusIcons, target;
      target = $(event.target);
      if (this.isPlaceholder(target)) {
        return;
      }
      statusIcons = this.statusContainer.children('.status-icon');
      element = target.closest('.status-icon');
      if (element.length === 0) {
        element = statusIcons.last();
      }
      if (!element.length) {
        return 0;
      }
      elementCenter = element.offset().left + element.width() / 2;
      if (event.originalEvent.pageX < elementCenter) {
        return statusIcons.index(element);
      } else if (element.next('.status-icon').length > 0) {
        return statusIcons.index(element.next('.status-icon'));
      } else {
        return statusIcons.index(element) + 1;
      }
    };

    StatusBar.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li class="placeholder"></li>');
    };

    StatusBar.prototype.removePlaceholder = function() {
      var _ref1;
      if ((_ref1 = this.placeholderEl) != null) {
        _ref1.remove();
      }
      return this.placeholderEl = null;
    };

    StatusBar.prototype.isPlaceholder = function(element) {
      return element.is('.placeholder');
    };

    StatusBar.prototype.iconAtIndex = function(index) {
      return this.getStatusIcons().eq(index);
    };

    StatusBar.prototype.getStatusIcons = function() {
      return this.statusContainer.children('.status-icon');
    };

    StatusBar.prototype.moveIconToIndex = function(icon, toIndex) {
      var container, followingIcon;
      followingIcon = this.getStatusIcons()[toIndex];
      container = this.statusContainer[0];
      if (followingIcon != null) {
        return container.insertBefore(icon, followingIcon);
      } else {
        return container.appendChild(icon);
      }
    };

    StatusBar.prototype.moveTerminalView = function(fromIndex, toIndex) {
      var activeTerminal, view;
      activeTerminal = this.getActiveTerminalView();
      view = this.terminalViews.splice(fromIndex, 1)[0];
      this.terminalViews.splice(toIndex, 0, view);
      return this.setActiveTerminalView(activeTerminal);
    };

    StatusBar.prototype.updateOrder = function(fromIndex, toIndex) {
      var icon;
      if (fromIndex === toIndex) {
        return;
      }
      if (fromIndex < toIndex) {
        toIndex--;
      }
      icon = this.getStatusIcons().eq(fromIndex).detach();
      this.moveIconToIndex(icon.get(0), toIndex);
      this.moveTerminalView(fromIndex, toIndex);
      icon.addClass('inserted');
      return icon.one('webkitAnimationEnd', function() {
        return icon.removeClass('inserted');
      });
    };

    return StatusBar;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi9zdGF0dXMtYmFyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyRUFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFESixDQUFBOztBQUFBLEVBR0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLFFBQVIsQ0FIbkIsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUpiLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osZ0NBQUEsQ0FBQTs7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSx3QkFBQSxhQUFBLEdBQWUsRUFBZixDQUFBOztBQUFBLHdCQUNBLFdBQUEsR0FBYSxDQURiLENBQUE7O0FBQUEsSUFHQSxTQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywwQkFBUDtBQUFBLFFBQW1DLFFBQUEsRUFBVSxDQUFBLENBQTdDO09BQUwsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwRCxVQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxZQUFBLE9BQUEsRUFBTyxnQkFBUDtBQUFBLFlBQXlCLEtBQUEsRUFBTyxpQkFBaEM7QUFBQSxZQUFtRCxNQUFBLEVBQVEsU0FBM0Q7V0FBSCxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxZQUFBLE9BQUEsRUFBTyw4QkFBUDtBQUFBLFlBQXVDLFFBQUEsRUFBVSxJQUFqRDtBQUFBLFlBQXVELE1BQUEsRUFBUSxpQkFBL0Q7QUFBQSxZQUFrRixFQUFBLEVBQUksY0FBdEY7V0FBSixDQURBLENBQUE7aUJBRUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLGFBQVA7QUFBQSxZQUFzQixLQUFBLEVBQU8sVUFBN0I7QUFBQSxZQUF5QyxNQUFBLEVBQVEsVUFBakQ7V0FBSCxFQUhvRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELEVBRFE7SUFBQSxDQUhWLENBQUE7O0FBQUEsd0JBU0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNqQjtBQUFBLFFBQUEsbUJBQUEsRUFBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7QUFBQSxRQUNBLHNCQUFBLEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRHhCO0FBQUEsUUFFQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsc0JBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGdEI7QUFBQSxRQUdBLG9CQUFBLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxzQkFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUh0QjtBQUFBLFFBSUEscUJBQUEsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsU0FBQyxDQUFELEdBQUE7cUJBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBQSxFQUFQO1lBQUEsQ0FBakIsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSnZCO0FBQUEsUUFLQSxvQ0FBQSxFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFpQixTQUFDLENBQUQsR0FBQTtxQkFBTyxDQUFDLENBQUMsZUFBRixDQUFBLEVBQVA7WUFBQSxDQUFqQixFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMdEM7T0FEaUIsQ0FBbkIsQ0FGQSxDQUFBO0FBQUEsTUFVQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLFFBQWxCLEVBQ2pCO0FBQUEsUUFBQSxxQkFBQSxFQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFlLFNBQUMsQ0FBRCxHQUFBO3FCQUFPLENBQUMsQ0FBQyxLQUFGLENBQUEsRUFBUDtZQUFBLENBQWYsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0FBQUEsUUFDQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFlLFNBQUMsQ0FBRCxHQUFBO3FCQUFPLENBQUMsQ0FBQyxJQUFGLENBQUEsRUFBUDtZQUFBLENBQWYsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRHRCO09BRGlCLENBQW5CLENBVkEsQ0FBQTtBQUFBLE1BY0EsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FkQSxDQUFBO0FBQUEsTUFnQkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxjQUFQO09BQTVCLENBQW5CLENBaEJBLENBQUE7QUFBQSxNQWlCQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxRQUFuQixFQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLFdBQVA7T0FBN0IsQ0FBbkIsQ0FqQkEsQ0FBQTtBQUFBLE1BbUJBLElBQUMsQ0FBQSxlQUFlLENBQUMsRUFBakIsQ0FBb0IsVUFBcEIsRUFBZ0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQzlCLFVBQUEsSUFBMEIsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsS0FBSyxDQUFDLGNBQWhEO21CQUFBLEtBQUMsQ0FBQSxlQUFELENBQUEsRUFBQTtXQUQ4QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDLENBbkJBLENBQUE7QUFBQSxNQXNCQSxJQUFDLENBQUEsZUFBZSxDQUFDLEVBQWpCLENBQW9CLFdBQXBCLEVBQWlDLGNBQWpDLEVBQWlELElBQUMsQ0FBQSxXQUFsRCxDQXRCQSxDQUFBO0FBQUEsTUF1QkEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxFQUFqQixDQUFvQixTQUFwQixFQUErQixjQUEvQixFQUErQyxJQUFDLENBQUEsU0FBaEQsQ0F2QkEsQ0FBQTtBQUFBLE1Bd0JBLElBQUMsQ0FBQSxlQUFlLENBQUMsRUFBakIsQ0FBb0IsV0FBcEIsRUFBaUMsSUFBQyxDQUFBLFdBQWxDLENBeEJBLENBQUE7QUFBQSxNQXlCQSxJQUFDLENBQUEsZUFBZSxDQUFDLEVBQWpCLENBQW9CLFVBQXBCLEVBQWdDLElBQUMsQ0FBQSxVQUFqQyxDQXpCQSxDQUFBO0FBQUEsTUEwQkEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxFQUFqQixDQUFvQixNQUFwQixFQUE0QixJQUFDLENBQUEsTUFBN0IsQ0ExQkEsQ0FBQTthQTRCQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBN0JVO0lBQUEsQ0FUWixDQUFBOztBQUFBLHdCQXdDQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7YUFDaEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7QUFBQSxRQUFBLDBCQUFBLEVBQTRCLElBQUMsQ0FBQSxjQUE3QjtBQUFBLFFBQ0EsNkJBQUEsRUFBK0IsSUFBQyxDQUFBLGNBRGhDO0FBQUEsUUFFQSw2QkFBQSxFQUErQixJQUFDLENBQUEsY0FGaEM7QUFBQSxRQUdBLDRCQUFBLEVBQThCLElBQUMsQ0FBQSxjQUgvQjtBQUFBLFFBSUEsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLGNBSjlCO0FBQUEsUUFLQSw2QkFBQSxFQUErQixJQUFDLENBQUEsY0FMaEM7QUFBQSxRQU1BLDJCQUFBLEVBQTZCLElBQUMsQ0FBQSxjQU45QjtBQUFBLFFBT0EsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLGNBUDlCO0FBQUEsUUFRQSw4QkFBQSxFQUFnQyxJQUFDLENBQUEsY0FSakM7QUFBQSxRQVNBLDhCQUFBLEVBQWdDLElBQUMsQ0FBQSxnQkFUakM7QUFBQSxRQVVBLDZCQUFBLEVBQStCLFNBQUMsS0FBRCxHQUFBO2lCQUM3QixDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVIsQ0FBZSxDQUFDLE9BQWhCLENBQXdCLGNBQXhCLENBQXdDLENBQUEsQ0FBQSxDQUFFLENBQUMsWUFBWSxDQUFDLE9BQXhELENBQUEsRUFENkI7UUFBQSxDQVYvQjtBQUFBLFFBWUEsNEJBQUEsRUFBOEIsU0FBQyxLQUFELEdBQUE7QUFDNUIsY0FBQSxVQUFBO0FBQUEsVUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxPQUFoQixDQUF3QixjQUF4QixDQUF3QyxDQUFBLENBQUEsQ0FBckQsQ0FBQTtBQUNBLFVBQUEsSUFBa0MsVUFBVSxDQUFDLFFBQVgsQ0FBQSxDQUFsQzttQkFBQSxVQUFVLENBQUMsWUFBWSxDQUFDLElBQXhCLENBQUEsRUFBQTtXQUY0QjtRQUFBLENBWjlCO0FBQUEsUUFlQSw4QkFBQSxFQUFnQyxTQUFDLEtBQUQsR0FBQTtpQkFDOUIsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxPQUFoQixDQUF3QixjQUF4QixDQUF3QyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQTNDLENBQUEsRUFEOEI7UUFBQSxDQWZoQztBQUFBLFFBaUJBLHlCQUFBLEVBQTJCLElBQUMsQ0FBQSxRQWpCNUI7T0FEaUIsQ0FBbkIsRUFEZ0I7SUFBQSxDQXhDbEIsQ0FBQTs7QUFBQSx3QkE2REEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLFVBQUEsNEJBQUE7QUFBQSxNQUFBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQUEsQ0FBakIsQ0FBQTtBQUFBLE1BRUEsZ0JBQUEsR0FBdUIsSUFBQSxnQkFBQSxDQUFBLENBRnZCLENBQUE7QUFBQSxNQUdBLFVBQVUsQ0FBQyxVQUFYLENBQXNCLGdCQUF0QixDQUhBLENBQUE7QUFBQSxNQUtBLGdCQUFnQixDQUFDLFNBQWpCLEdBQTZCLElBTDdCLENBQUE7QUFBQSxNQU1BLGdCQUFnQixDQUFDLFVBQWpCLEdBQThCLFVBTjlCLENBQUE7QUFBQSxNQU9BLGdCQUFnQixDQUFDLEtBQWpCLEdBQXlCLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtBQUFBLFFBQUEsSUFBQSxFQUFNLGdCQUFOO0FBQUEsUUFBd0IsT0FBQSxFQUFTLEtBQWpDO09BQTlCLENBUHpCLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixnQkFBcEIsQ0FUQSxDQUFBO0FBQUEsTUFVQSxJQUFDLENBQUEsZUFBZSxDQUFDLE1BQWpCLENBQXdCLFVBQXhCLENBVkEsQ0FBQTtBQVdBLGFBQU8sZ0JBQVAsQ0Faa0I7SUFBQSxDQTdEcEIsQ0FBQTs7QUFBQSx3QkEyRUEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO2FBQ3RCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFDLENBQUEsV0FBRCxHQUFlLENBQW5DLEVBRHNCO0lBQUEsQ0EzRXhCLENBQUE7O0FBQUEsd0JBOEVBLHNCQUFBLEdBQXdCLFNBQUEsR0FBQTthQUN0QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFuQyxFQURzQjtJQUFBLENBOUV4QixDQUFBOztBQUFBLHdCQWlGQSxrQkFBQSxHQUFvQixTQUFDLEtBQUQsR0FBQTtBQUNsQixNQUFBLElBQUEsQ0FBQSxDQUFjLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixDQUF0QyxDQUFBO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFFQSxNQUFBLElBQUcsS0FBQSxJQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBM0I7QUFDRSxRQUFBLEtBQUEsR0FBUSxDQUFSLENBREY7T0FGQTtBQUlBLE1BQUEsSUFBRyxLQUFBLEdBQVEsQ0FBWDtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixDQUFoQyxDQURGO09BSkE7YUFPQSxJQUFDLENBQUEsYUFBYyxDQUFBLEtBQUEsQ0FBTSxDQUFDLElBQXRCLENBQUEsRUFSa0I7SUFBQSxDQWpGcEIsQ0FBQTs7QUFBQSx3QkEyRkEscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLGFBQU8sSUFBQyxDQUFBLGFBQWMsQ0FBQSxJQUFDLENBQUEsV0FBRCxDQUF0QixDQURxQjtJQUFBLENBM0Z2QixDQUFBOztBQUFBLHdCQThGQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxHQUFBO0FBQ2YsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBUCxDQUFBO0FBQ0EsTUFBQSxJQUFHLFlBQUg7QUFDRSxlQUFPLFFBQUEsQ0FBUyxJQUFULENBQVAsQ0FERjtPQURBO0FBR0EsYUFBTyxJQUFQLENBSmU7SUFBQSxDQTlGakIsQ0FBQTs7QUFBQSx3QkFvR0EsYUFBQSxHQUFlLFNBQUMsUUFBRCxHQUFBO0FBQ2IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBUCxDQUFBO0FBQ0EsTUFBQSxJQUFHLGNBQUEsSUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQSxDQUFiO0FBQ0UsZUFBTyxRQUFBLENBQVMsSUFBVCxDQUFQLENBREY7T0FEQTtBQUdBLGFBQU8sSUFBUCxDQUphO0lBQUEsQ0FwR2YsQ0FBQTs7QUFBQSx3QkEwR0EscUJBQUEsR0FBdUIsU0FBQyxZQUFELEdBQUE7YUFDckIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsWUFBdkIsRUFETTtJQUFBLENBMUd2QixDQUFBOztBQUFBLHdCQTZHQSxrQkFBQSxHQUFvQixTQUFDLFlBQUQsR0FBQTtBQUNsQixVQUFBLEtBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsWUFBdkIsQ0FBUixDQUFBO0FBQ0EsTUFBQSxJQUFVLEtBQUEsR0FBUSxDQUFsQjtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsS0FBdEIsRUFBNkIsQ0FBN0IsQ0FGQSxDQUFBO0FBR0EsTUFBQSxJQUFrQixLQUFBLElBQVMsSUFBQyxDQUFBLFdBQVYsSUFBMEIsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUEzRDtlQUFBLElBQUMsQ0FBQSxXQUFELEdBQUE7T0FKa0I7SUFBQSxDQTdHcEIsQ0FBQTs7QUFBQSx3QkFtSEEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDZixJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFxQixDQUFDLE1BQXRCLENBQUEsRUFEZTtJQUFBLENBbkhqQixDQUFBOztBQUFBLHdCQXNIQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFFBQVksUUFBQSxFQUFVLEdBQXRCO09BQTlCLEVBRE07SUFBQSxDQXRIUixDQUFBOztBQUFBLHdCQXlIQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDakIsTUFBQSxJQUEwQyw0Q0FBMUM7ZUFBQSxJQUFDLENBQUEsYUFBYyxDQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBQyxPQUE3QixDQUFBLEVBQUE7T0FEaUI7SUFBQSxDQXpIbkIsQ0FBQTs7QUFBQSx3QkE0SEEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsbUJBQUE7QUFBQSxXQUFhLGdIQUFiLEdBQUE7QUFDRSxRQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsYUFBYyxDQUFBLEtBQUEsQ0FBbkIsQ0FBQTtBQUNBLFFBQUEsSUFBRyxTQUFIO0FBQ0UsVUFBQSxDQUFDLENBQUMsT0FBRixDQUFBLENBQUEsQ0FERjtTQUZGO0FBQUEsT0FBQTthQUlBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFMUDtJQUFBLENBNUhWLENBQUE7O0FBQUEsd0JBbUlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHFCQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUFBLFdBQUEsNENBQUE7eUJBQUE7QUFDRSxRQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBaEIsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBZCxDQUFBLENBREEsQ0FERjtBQUFBLE9BREE7YUFJQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBTE87SUFBQSxDQW5JVCxDQUFBOztBQUFBLHdCQTBJQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUE2Qiw0Q0FBN0I7QUFBQSxRQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBQUEsQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQWMsQ0FBQSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQUMsTUFBN0IsQ0FBQSxFQUZNO0lBQUEsQ0ExSVIsQ0FBQTs7QUFBQSx3QkE4SUEsY0FBQSxHQUFnQixTQUFDLEtBQUQsR0FBQTtBQUNkLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBWCxDQUFpQixNQUFqQixDQUF5QixDQUFBLENBQUEsQ0FBakMsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQix1QkFBQSxHQUF1QixLQUF4QyxDQUFnRCxDQUFDLFlBQWpELENBQUEsQ0FEUixDQUFBO2FBRUEsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxPQUFoQixDQUF3QixjQUF4QixDQUF1QyxDQUFDLEdBQXhDLENBQTRDLE9BQTVDLEVBQXFELEtBQXJELEVBSGM7SUFBQSxDQTlJaEIsQ0FBQTs7QUFBQSx3QkFtSkEsZ0JBQUEsR0FBa0IsU0FBQyxLQUFELEdBQUE7YUFDaEIsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxPQUFoQixDQUF3QixjQUF4QixDQUF1QyxDQUFDLEdBQXhDLENBQTRDLE9BQTVDLEVBQXFELEVBQXJELEVBRGdCO0lBQUEsQ0FuSmxCLENBQUE7O0FBQUEsd0JBc0pBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTtBQUNYLFVBQUEsT0FBQTtBQUFBLE1BQUEsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBakMsQ0FBeUMsZUFBekMsRUFBMEQsTUFBMUQsQ0FBQSxDQUFBO0FBQUEsTUFFQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxPQUFoQixDQUF3QixjQUF4QixDQUZWLENBQUE7QUFBQSxNQUdBLE9BQU8sQ0FBQyxRQUFSLENBQWlCLGFBQWpCLENBSEEsQ0FBQTthQUlBLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQWpDLENBQXlDLFlBQXpDLEVBQXVELE9BQU8sQ0FBQyxLQUFSLENBQUEsQ0FBdkQsRUFMVztJQUFBLENBdEpiLENBQUE7O0FBQUEsd0JBNkpBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTthQUNYLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBRFc7SUFBQSxDQTdKYixDQUFBOztBQUFBLHdCQWdLQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7YUFDVCxJQUFDLENBQUEsZUFBRCxDQUFBLEVBRFM7SUFBQSxDQWhLWCxDQUFBOztBQUFBLHdCQW1LQSxVQUFBLEdBQVksU0FBQyxLQUFELEdBQUE7QUFDVixVQUFBLHdDQUFBO0FBQUEsTUFBQSxLQUFLLENBQUMsY0FBTixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsS0FBSyxDQUFDLGVBQU4sQ0FBQSxDQURBLENBQUE7QUFFQSxNQUFBLElBQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBakMsQ0FBeUMsZUFBekMsQ0FBQSxLQUE2RCxNQUFwRTtBQUNFLGNBQUEsQ0FERjtPQUZBO0FBQUEsTUFLQSxrQkFBQSxHQUFxQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBcEIsQ0FMckIsQ0FBQTtBQU1BLE1BQUEsSUFBYywwQkFBZDtBQUFBLGNBQUEsQ0FBQTtPQU5BO0FBQUEsTUFPQSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQVBBLENBQUE7QUFBQSxNQVFBLFdBQUEsR0FBYyxJQUFDLENBQUEsZUFBZSxDQUFDLFFBQWpCLENBQTBCLGNBQTFCLENBUmQsQ0FBQTtBQVVBLE1BQUEsSUFBRyxrQkFBQSxHQUFxQixXQUFXLENBQUMsTUFBcEM7QUFDRSxRQUFBLE9BQUEsR0FBVSxXQUFXLENBQUMsRUFBWixDQUFlLGtCQUFmLENBQWtDLENBQUMsUUFBbkMsQ0FBNEMsZ0JBQTVDLENBQVYsQ0FBQTtlQUNBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBaUIsQ0FBQyxZQUFsQixDQUErQixPQUEvQixFQUZGO09BQUEsTUFBQTtBQUlFLFFBQUEsT0FBQSxHQUFVLFdBQVcsQ0FBQyxFQUFaLENBQWUsa0JBQUEsR0FBcUIsQ0FBcEMsQ0FBc0MsQ0FBQyxRQUF2QyxDQUFnRCxzQkFBaEQsQ0FBVixDQUFBO2VBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFpQixDQUFDLFdBQWxCLENBQThCLE9BQTlCLEVBTEY7T0FYVTtJQUFBLENBbktaLENBQUE7O0FBQUEsd0JBcUxBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNOLFVBQUEsZ0NBQUE7QUFBQSxNQUFDLGVBQWdCLEtBQUssQ0FBQyxjQUF0QixZQUFELENBQUE7QUFDQSxNQUFBLElBQWMsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsZUFBckIsQ0FBQSxLQUF5QyxNQUF2RDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxLQUFLLENBQUMsY0FBTixDQUFBLENBRkEsQ0FBQTtBQUFBLE1BR0EsS0FBSyxDQUFDLGVBQU4sQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUtBLFNBQUEsR0FBWSxRQUFBLENBQVMsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsWUFBckIsQ0FBVCxDQUxaLENBQUE7QUFBQSxNQU1BLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBcEIsQ0FOVixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBUEEsQ0FBQTthQVNBLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBYixFQUF3QixPQUF4QixFQVZNO0lBQUEsQ0FyTFIsQ0FBQTs7QUFBQSx3QkFpTUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sQ0FBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBSmU7SUFBQSxDQWpNakIsQ0FBQTs7QUFBQSx3QkF1TUEsdUJBQUEsR0FBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixpQkFBdEIsQ0FBd0MsQ0FBQyxXQUF6QyxDQUFxRCxnQkFBckQsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQix1QkFBdEIsQ0FBOEMsQ0FBQyxXQUEvQyxDQUEyRCxzQkFBM0QsRUFGdUI7SUFBQSxDQXZNekIsQ0FBQTs7QUFBQSx3QkEyTUEsa0JBQUEsR0FBb0IsU0FBQyxLQUFELEdBQUE7QUFDbEIsVUFBQSwyQ0FBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFULENBQUE7QUFDQSxNQUFBLElBQVUsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLENBQVY7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUFBLE1BR0EsV0FBQSxHQUFjLElBQUMsQ0FBQSxlQUFlLENBQUMsUUFBakIsQ0FBMEIsY0FBMUIsQ0FIZCxDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBZSxjQUFmLENBSlYsQ0FBQTtBQUtBLE1BQUEsSUFBZ0MsT0FBTyxDQUFDLE1BQVIsS0FBa0IsQ0FBbEQ7QUFBQSxRQUFBLE9BQUEsR0FBVSxXQUFXLENBQUMsSUFBWixDQUFBLENBQVYsQ0FBQTtPQUxBO0FBT0EsTUFBQSxJQUFBLENBQUEsT0FBdUIsQ0FBQyxNQUF4QjtBQUFBLGVBQU8sQ0FBUCxDQUFBO09BUEE7QUFBQSxNQVNBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFnQixDQUFDLElBQWpCLEdBQXdCLE9BQU8sQ0FBQyxLQUFSLENBQUEsQ0FBQSxHQUFrQixDQVQxRCxDQUFBO0FBV0EsTUFBQSxJQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBcEIsR0FBNEIsYUFBL0I7ZUFDRSxXQUFXLENBQUMsS0FBWixDQUFrQixPQUFsQixFQURGO09BQUEsTUFFSyxJQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsY0FBYixDQUE0QixDQUFDLE1BQTdCLEdBQXNDLENBQXpDO2VBQ0gsV0FBVyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLElBQVIsQ0FBYSxjQUFiLENBQWxCLEVBREc7T0FBQSxNQUFBO2VBR0gsV0FBVyxDQUFDLEtBQVosQ0FBa0IsT0FBbEIsQ0FBQSxHQUE2QixFQUgxQjtPQWRhO0lBQUEsQ0EzTXBCLENBQUE7O0FBQUEsd0JBOE5BLGNBQUEsR0FBZ0IsU0FBQSxHQUFBOzBDQUNkLElBQUMsQ0FBQSxnQkFBRCxJQUFDLENBQUEsZ0JBQWlCLENBQUEsQ0FBRSwrQkFBRixFQURKO0lBQUEsQ0E5TmhCLENBQUE7O0FBQUEsd0JBaU9BLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixVQUFBLEtBQUE7O2FBQWMsQ0FBRSxNQUFoQixDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixLQUZBO0lBQUEsQ0FqT25CLENBQUE7O0FBQUEsd0JBcU9BLGFBQUEsR0FBZSxTQUFDLE9BQUQsR0FBQTthQUNiLE9BQU8sQ0FBQyxFQUFSLENBQVcsY0FBWCxFQURhO0lBQUEsQ0FyT2YsQ0FBQTs7QUFBQSx3QkF3T0EsV0FBQSxHQUFhLFNBQUMsS0FBRCxHQUFBO2FBQ1gsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFpQixDQUFDLEVBQWxCLENBQXFCLEtBQXJCLEVBRFc7SUFBQSxDQXhPYixDQUFBOztBQUFBLHdCQTJPQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTthQUNkLElBQUMsQ0FBQSxlQUFlLENBQUMsUUFBakIsQ0FBMEIsY0FBMUIsRUFEYztJQUFBLENBM09oQixDQUFBOztBQUFBLHdCQThPQSxlQUFBLEdBQWlCLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUNmLFVBQUEsd0JBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFrQixDQUFBLE9BQUEsQ0FBbEMsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUEsQ0FEN0IsQ0FBQTtBQUVBLE1BQUEsSUFBRyxxQkFBSDtlQUNFLFNBQVMsQ0FBQyxZQUFWLENBQXVCLElBQXZCLEVBQTZCLGFBQTdCLEVBREY7T0FBQSxNQUFBO2VBR0UsU0FBUyxDQUFDLFdBQVYsQ0FBc0IsSUFBdEIsRUFIRjtPQUhlO0lBQUEsQ0E5T2pCLENBQUE7O0FBQUEsd0JBc1BBLGdCQUFBLEdBQWtCLFNBQUMsU0FBRCxFQUFZLE9BQVosR0FBQTtBQUNoQixVQUFBLG9CQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQWpCLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsU0FBdEIsRUFBaUMsQ0FBakMsQ0FBb0MsQ0FBQSxDQUFBLENBRDNDLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixPQUF0QixFQUErQixDQUEvQixFQUFrQyxJQUFsQyxDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsY0FBdkIsRUFKZ0I7SUFBQSxDQXRQbEIsQ0FBQTs7QUFBQSx3QkE0UEEsV0FBQSxHQUFhLFNBQUMsU0FBRCxFQUFZLE9BQVosR0FBQTtBQUNYLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBVSxTQUFBLEtBQWEsT0FBdkI7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBYSxTQUFBLEdBQVksT0FBekI7QUFBQSxRQUFBLE9BQUEsRUFBQSxDQUFBO09BREE7QUFBQSxNQUdBLElBQUEsR0FBTyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsRUFBbEIsQ0FBcUIsU0FBckIsQ0FBK0IsQ0FBQyxNQUFoQyxDQUFBLENBSFAsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULENBQWpCLEVBQThCLE9BQTlCLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCLEVBQTZCLE9BQTdCLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxVQUFkLENBTkEsQ0FBQTthQU9BLElBQUksQ0FBQyxHQUFMLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsVUFBakIsRUFBSDtNQUFBLENBQS9CLEVBUlc7SUFBQSxDQTVQYixDQUFBOztxQkFBQTs7S0FEc0IsS0FQeEIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/pjim/.atom/packages/terminal-plus/lib/status-bar.coffee
