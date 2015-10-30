(function() {
  var InputView;

  InputView = require("./views/input");

  module.exports = {
    config: {
      replaceCharacters: {
        type: "string",
        "default": "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      }
    },
    start: function(bReverse) {
      var oInput;
      if (bReverse == null) {
        bReverse = false;
      }
      oInput = new InputView(atom.workspace.getActiveTextEditor());
      atom.workspace.addBottomPanel({
        item: oInput
      });
      oInput.resetWords();
      if (oInput.hasWords()) {
        return oInput.focus();
      } else {
        return oInput.remove();
      }
    },
    activate: function() {
      return atom.commands.add("atom-text-editor:not([mini])", {
        "easy-motion-redux:start": (function(_this) {
          return function() {
            return _this.start();
          };
        })(this)
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy9lYXN5LW1vdGlvbi1yZWR1eC9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsU0FBQTs7QUFBQSxFQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsZUFBUixDQUFaLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsNEJBRFQ7T0FERjtLQURGO0FBQUEsSUFLQSxLQUFBLEVBQU8sU0FBRSxRQUFGLEdBQUE7QUFDTCxVQUFBLE1BQUE7O1FBRE8sV0FBVztPQUNsQjtBQUFBLE1BQUEsTUFBQSxHQUFhLElBQUEsU0FBQSxDQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFWLENBQWIsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO0FBQUEsUUFBQSxJQUFBLEVBQU0sTUFBTjtPQUE5QixDQURBLENBQUE7QUFBQSxNQUdBLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FIQSxDQUFBO0FBS0EsTUFBQSxJQUFHLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBSDtlQUNFLE1BQU0sQ0FBQyxLQUFQLENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxNQUFNLENBQUMsTUFBUCxDQUFBLEVBSEY7T0FOSztJQUFBLENBTFA7QUFBQSxJQWdCQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLDhCQUFsQixFQUNFO0FBQUEsUUFBQSx5QkFBQSxFQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQjtPQURGLEVBRFE7SUFBQSxDQWhCVjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/pjim/.atom/packages/easy-motion-redux/lib/main.coffee
