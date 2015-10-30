(function() {
  var $, Letter, Markers,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require("atom-space-pen-views").$;

  Letter = require("./letter");

  module.exports = Markers = (function() {
    Markers.prototype.aMarkers = [];

    function Markers(oRefTextEditor, oRefTextEditorView) {
      this.oRefTextEditor = oRefTextEditor;
      this.oRefTextEditorView = oRefTextEditorView;
      this.clear = __bind(this.clear, this);
    }

    Markers.prototype.add = function(oRange, sLetter, oOptions) {
      var oDecoration, oMarker;
      oMarker = this.oRefTextEditor.markBufferRange(oRange);
      oDecoration = this.oRefTextEditor.decorateMarker(oMarker, {
        type: "overlay",
        item: new Letter(this.oRefTextEditor, this.oRefTextEditorView, oRange, sLetter, oOptions)
      });
      return this.aMarkers.push(oMarker);
    };

    Markers.prototype.clear = function() {
      var oMarker, _i, _len, _ref, _results;
      _ref = this.aMarkers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        oMarker = _ref[_i];
        _results.push(oMarker.destroy());
      }
      return _results;
    };

    return Markers;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy9lYXN5LW1vdGlvbi1yZWR1eC9saWIvdmlld3MvbWFya2Vycy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFFLElBQU0sT0FBQSxDQUFRLHNCQUFSLEVBQU4sQ0FBRixDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLHNCQUFBLFFBQUEsR0FBVSxFQUFWLENBQUE7O0FBRWEsSUFBQSxpQkFBRyxjQUFILEVBQW9CLGtCQUFwQixHQUFBO0FBQTBDLE1BQXhDLElBQUMsQ0FBQSxpQkFBQSxjQUF1QyxDQUFBO0FBQUEsTUFBdkIsSUFBQyxDQUFBLHFCQUFBLGtCQUFzQixDQUFBO0FBQUEsMkNBQUEsQ0FBMUM7SUFBQSxDQUZiOztBQUFBLHNCQUlBLEdBQUEsR0FBSyxTQUFFLE1BQUYsRUFBVSxPQUFWLEVBQW1CLFFBQW5CLEdBQUE7QUFDSCxVQUFBLG9CQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGNBQWMsQ0FBQyxlQUFoQixDQUFnQyxNQUFoQyxDQUFWLENBQUE7QUFBQSxNQUNBLFdBQUEsR0FBYyxJQUFDLENBQUEsY0FBYyxDQUFDLGNBQWhCLENBQStCLE9BQS9CLEVBQ1o7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxJQUFBLEVBQVUsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLGNBQVIsRUFBd0IsSUFBQyxDQUFBLGtCQUF6QixFQUE2QyxNQUE3QyxFQUFxRCxPQUFyRCxFQUE4RCxRQUE5RCxDQURWO09BRFksQ0FEZCxDQUFBO2FBSUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsT0FBZixFQUxHO0lBQUEsQ0FKTCxDQUFBOztBQUFBLHNCQVdBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxVQUFBLGlDQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBOzJCQUFBO0FBQUEsc0JBQUcsT0FBTyxDQUFDLE9BQVgsQ0FBQSxFQUFBLENBQUE7QUFBQTtzQkFESztJQUFBLENBWFAsQ0FBQTs7bUJBQUE7O01BTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/pjim/.atom/packages/easy-motion-redux/lib/views/markers.coffee
