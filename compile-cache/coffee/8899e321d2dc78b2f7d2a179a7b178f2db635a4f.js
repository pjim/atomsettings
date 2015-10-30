(function() {
  var LetterCoverView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("atom-space-pen-views").View;

  module.exports = LetterCoverView = (function(_super) {
    __extends(LetterCoverView, _super);

    function LetterCoverView() {
      return LetterCoverView.__super__.constructor.apply(this, arguments);
    }

    LetterCoverView.content = function() {
      return this.div({
        "class": "easy-motion-redux-letter"
      });
    };

    LetterCoverView.prototype.initialize = function(oTextEditor, oTextEditorView, oRange, sLetter, oOptions) {
      var iHeight, iLeft, iTop, iWidth, _ref;
      this.text(sLetter);
      _ref = oTextEditorView.pixelPositionForBufferPosition(oRange[0]), iTop = _ref.top, iLeft = _ref.left;
      iWidth = oTextEditorView.pixelPositionForBufferPosition(oRange[1]).left - iLeft;
      iHeight = oTextEditor.getLineHeightInPixels();
      this.addClass(oOptions.single ? "single" : "many");
      return this.css({
        position: "absolute",
        height: "" + iHeight + "px",
        top: "" + (iHeight * -1) + "px",
        left: "" + (iWidth * -1) + "px"
      });
    };

    return LetterCoverView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy9lYXN5LW1vdGlvbi1yZWR1eC9saWIvdmlld3MvbGV0dGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUUsT0FBUyxPQUFBLENBQVEsc0JBQVIsRUFBVCxJQUFGLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUVyQixzQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywwQkFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsOEJBR0EsVUFBQSxHQUFZLFNBQUUsV0FBRixFQUFlLGVBQWYsRUFBZ0MsTUFBaEMsRUFBd0MsT0FBeEMsRUFBaUQsUUFBakQsR0FBQTtBQUNWLFVBQUEsa0NBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxNQUVBLE9BQTZCLGVBQWUsQ0FBQyw4QkFBaEIsQ0FBK0MsTUFBUSxDQUFBLENBQUEsQ0FBdkQsQ0FBN0IsRUFBTyxZQUFMLEdBQUYsRUFBbUIsYUFBTixJQUZiLENBQUE7QUFBQSxNQUlBLE1BQUEsR0FBUyxlQUFlLENBQUMsOEJBQWhCLENBQWdELE1BQVEsQ0FBQSxDQUFBLENBQXhELENBQTZELENBQUMsSUFBOUQsR0FBcUUsS0FKOUUsQ0FBQTtBQUFBLE1BS0EsT0FBQSxHQUFVLFdBQVcsQ0FBQyxxQkFBWixDQUFBLENBTFYsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLFFBQUQsQ0FBYSxRQUFRLENBQUMsTUFBWixHQUF3QixRQUF4QixHQUFzQyxNQUFoRCxDQVBBLENBQUE7YUFTQSxJQUFDLENBQUEsR0FBRCxDQUNFO0FBQUEsUUFBQSxRQUFBLEVBQVUsVUFBVjtBQUFBLFFBQ0EsTUFBQSxFQUFRLEVBQUEsR0FBYixPQUFhLEdBQWEsSUFEckI7QUFBQSxRQUVBLEdBQUEsRUFBSyxFQUFBLEdBQUUsQ0FBWixPQUFBLEdBQVUsQ0FBQSxDQUFFLENBQUYsR0FBa0IsSUFGdkI7QUFBQSxRQUdBLElBQUEsRUFBTSxFQUFBLEdBQUUsQ0FBYixNQUFBLEdBQVMsQ0FBQSxDQUFJLENBQUYsR0FBaUIsSUFIdkI7T0FERixFQVZVO0lBQUEsQ0FIWixDQUFBOzsyQkFBQTs7S0FGNkMsS0FGL0MsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/pjim/.atom/packages/easy-motion-redux/lib/views/letter.coffee
