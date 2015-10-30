(function() {
  var $, CompositeDisposable, InputView, Markers, TextEditorView, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("atom-space-pen-views"), View = _ref.View, TextEditorView = _ref.TextEditorView, $ = _ref.$;

  CompositeDisposable = require("atom").CompositeDisposable;

  _ = require("underscore-plus");

  Markers = require("./markers");

  module.exports = InputView = (function(_super) {
    __extends(InputView, _super);

    function InputView() {
      this.notFolded = __bind(this.notFolded, this);
      this.wordRegExp = __bind(this.wordRegExp, this);
      this.getColumnRangeForRow = __bind(this.getColumnRangeForRow, this);
      this.getRowRanges = __bind(this.getRowRanges, this);
      this.loadWords = __bind(this.loadWords, this);
      this.groupWords = __bind(this.groupWords, this);
      this.goBack = __bind(this.goBack, this);
      this.confirm = __bind(this.confirm, this);
      this.remove = __bind(this.remove, this);
      this.autosubmit = __bind(this.autosubmit, this);
      this.hasWords = __bind(this.hasWords, this);
      this.resetWords = __bind(this.resetWords, this);
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.prototype.aWordStarts = [];

    InputView.content = function() {
      return this.div({
        "class": "easy-motion-redux-input"
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "editor-container",
            outlet: "editorContainer"
          });
          return _this.subview("editorInput", new TextEditorView({
            mini: true,
            placeholderText: "EasyMotion"
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(oRefTextEditor, oOptions) {
      this.oRefTextEditor = oRefTextEditor;
      if (oOptions == null) {
        oOptions = {};
      }
      this.subscriptions = new CompositeDisposable;
      this.oRefTextEditorView = atom.views.getView(this.oRefTextEditor);
      this.markers = new Markers(this.oRefTextEditor, this.oRefTextEditorView);
      this.oRefTextEditorView.classList.add("easy-motion-redux-editor");
      return this.handleEvents(oOptions);
    };

    InputView.prototype.handleEvents = function(oOptions) {
      if (oOptions == null) {
        oOptions = {};
      }
      this.editorInput.element.addEventListener("keypress", this.autosubmit);
      this.editorInput.element.addEventListener("blur", this.remove);
      this.subscriptions.add(atom.commands.add(this.editorInput.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.goBack();
          };
        })(this),
        "core:page-up": (function(_this) {
          return function() {
            return _this.oRefTextEditor.trigger("core:page-up");
          };
        })(this),
        "core:page-down": (function(_this) {
          return function() {
            return _this.oRefTextEditor.trigger("core:page-down");
          };
        })(this)
      }));
      return this.subscriptions.add(this.oRefTextEditor.onDidChangeScrollTop(this.goBack));
    };

    InputView.prototype.resetWords = function() {
      this.markers.clear();
      this.loadWords();
      return this.groupWords();
    };

    InputView.prototype.hasWords = function() {
      return this.aWordStarts.length > 0;
    };

    InputView.prototype.autosubmit = function(oEvent) {
      this.pickWords(String.fromCharCode(oEvent.charCode));
      if (this.aWordStarts.length > 1) {
        this.groupWords();
      } else {
        this.confirm();
      }
      return false;
    };

    InputView.prototype.remove = function() {
      this.subscriptions.dispose();
      this.markers.clear();
      this.oRefTextEditorView.classList.remove("easy-motion-redux-editor");
      return InputView.__super__.remove.call(this);
    };

    InputView.prototype.confirm = function() {
      this.oRefTextEditor.setCursorBufferPosition(this.aWordStarts[0][0]);
      return this.goBack();
    };

    InputView.prototype.goBack = function() {
      this.oRefTextEditorView.focus();
      return this.remove();
    };

    InputView.prototype.focus = function() {
      return this.editorInput.focus();
    };

    InputView.prototype.groupWords = function() {
      var bSingle, i, iCharsAmount, iCount, iLast, iRemains, iTake, j, k, oBuffer, oWordStart, sReplaceCharacters, sReplacement, _i, _j, _len, _ref1, _ref2, _results;
      iCount = this.aWordStarts.length;
      sReplaceCharacters = atom.config.get("easy-motion-redux.replaceCharacters");
      oBuffer = this.oRefTextEditor.getBuffer();
      iLast = 0;
      this.oGroupedWordStarts = {};
      _results = [];
      for (i = _i = 0, _ref1 = sReplaceCharacters.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        iTake = Math.floor(iCount / sReplaceCharacters.length);
        if (i < iCount % sReplaceCharacters.length) {
          iTake += 1;
        }
        this.oGroupedWordStarts[sReplaceCharacters[i]] = [];
        _ref2 = this.aWordStarts.slice(iLast, iLast + iTake);
        for (j = _j = 0, _len = _ref2.length; _j < _len; j = ++_j) {
          oWordStart = _ref2[j];
          bSingle = iTake === 1;
          sReplacement = bSingle ? sReplaceCharacters[i] : (iCharsAmount = sReplaceCharacters.length, iRemains = iTake % iCharsAmount, k = iTake <= iCharsAmount ? j % iTake : iTake < 2 * iCharsAmount && j >= iRemains * 2 ? j - iRemains : -1, sReplaceCharacters[i] + (sReplaceCharacters[k] || "•"));
          this.oGroupedWordStarts[sReplaceCharacters[i]].push(oWordStart);
          this.markers.add(oWordStart, sReplacement, {
            single: bSingle
          });
        }
        _results.push(iLast += iTake);
      }
      return _results;
    };

    InputView.prototype.pickWords = function(sCharacter) {
      this.markers.clear();
      if (sCharacter in this.oGroupedWordStarts && this.oGroupedWordStarts[sCharacter].length) {
        this.aWordStarts = this.oGroupedWordStarts[sCharacter];
        return;
      }
      if (sCharacter !== sCharacter.toLowerCase()) {
        sCharacter = sCharacter.toLowerCase();
      } else if (sCharacter !== sCharacter.toUpperCase()) {
        sCharacter = sCharacter.toUpperCase();
      } else {
        return;
      }
      if (sCharacter in this.oGroupedWordStarts && this.oGroupedWordStarts[sCharacter].length) {
        return this.aWordStarts = this.oGroupedWordStarts[sCharacter];
      }
    };

    InputView.prototype.loadWords = function() {
      var aWordStarts, aWords, fMarkBeginning, oBuffer, oRowRange, _i, _len, _ref1;
      aWords = [];
      oBuffer = this.oRefTextEditor.getBuffer();
      aWordStarts = [];
      fMarkBeginning = function(oObj) {
        var iBeginWord, iBeginWordEnd, _ref1;
        _ref1 = [null, null], iBeginWord = _ref1[0], iBeginWordEnd = _ref1[1];
        if (!this.bReverseMatch) {
          iBeginWord = oObj.range.start;
          iBeginWordEnd = [iBeginWord.row, iBeginWord.column + 1];
        } else {
          iBeginWordEnd = oObj.range.end;
          iBeginWord = [iBeginWordEnd.row, iBeginWordEnd.column - 1];
        }
        return aWordStarts.push([iBeginWord, iBeginWordEnd]);
      };
      _ref1 = this.getRowRanges();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        oRowRange = _ref1[_i];
        oBuffer.scanInRange(this.wordRegExp(), oRowRange, fMarkBeginning);
      }
      return this.aWordStarts = aWordStarts;
    };

    InputView.prototype.getRowRanges = function() {
      var iBeginRow, iBottom, iEndRow, iRow, iTop, oBuffer;
      oBuffer = this.oRefTextEditor.getBuffer();
      iTop = this.oRefTextEditor.getScrollTop();
      iBottom = iTop + this.oRefTextEditor.getHeight();
      iBeginRow = this.binarySearch(oBuffer.getLineCount(), (function(_this) {
        return function(iRow) {
          return _this.oRefTextEditorView.pixelPositionForBufferPosition([iRow, 0]).top < iTop;
        };
      })(this));
      iBeginRow += 1;
      iEndRow = this.binarySearch(oBuffer.getLineCount(), (function(_this) {
        return function(iRow) {
          var iHeight, iPosition;
          iPosition = _this.oRefTextEditorView.pixelPositionForBufferPosition([iRow, 0]).top;
          iHeight = _this.oRefTextEditor.getLineHeightInPixels();
          return iPosition + iHeight <= iBottom;
        };
      })(this));
      return ((function() {
        var _i, _results;
        _results = [];
        for (iRow = _i = iBeginRow; iBeginRow <= iEndRow ? _i <= iEndRow : _i >= iEndRow; iRow = iBeginRow <= iEndRow ? ++_i : --_i) {
          if (this.notFolded(iRow)) {
            _results.push(iRow);
          }
        }
        return _results;
      }).call(this)).map((function(_this) {
        return function(iRow) {
          return _this.getColumnRangeForRow(iRow);
        };
      })(this));
    };

    InputView.prototype.getColumnRangeForRow = function(iRow) {
      var iBeginColumn, iColumns, iEndColumn, iLeft, iRight, oBuffer, oColumns;
      oBuffer = this.oRefTextEditor.getBuffer();
      iLeft = this.oRefTextEditor.getScrollLeft();
      iRight = iLeft + this.oRefTextEditor.getWidth();
      oColumns = this.oRefTextEditor.clipBufferPosition([iRow, Infinity]);
      iColumns = oColumns.column + 1;
      iBeginColumn = this.binarySearch(iColumns, (function(_this) {
        return function(iColumn) {
          return _this.oRefTextEditorView.pixelPositionForBufferPosition([iRow, iColumn]).left < iLeft;
        };
      })(this));
      iBeginColumn += 1;
      iEndColumn = this.binarySearch(iColumns, (function(_this) {
        return function(iColumn) {
          return _this.oRefTextEditorView.pixelPositionForBufferPosition([iRow, iColumn]).left <= iRight;
        };
      })(this));
      return [[iRow, iBeginColumn], [iRow, iEndColumn]];
    };

    InputView.prototype.wordRegExp = function() {
      var sNonWordCharacters;
      sNonWordCharacters = atom.config.get("editor.nonWordCharacters");
      return new RegExp("[^\\s" + (_.escapeRegExp(sNonWordCharacters)) + "]+", "g");
    };

    InputView.prototype.notFolded = function(iRow) {
      return iRow === 0 || !this.oRefTextEditor.isFoldedAtBufferRow(iRow) || !this.oRefTextEditor.isFoldedAtBufferRow(iRow - 1);
    };

    InputView.prototype.binarySearch = function(iMaxValue, fCompare) {
      var iAnswer, iStep;
      iStep = 1;
      while (iStep < iMaxValue) {
        iStep *= 2;
      }
      iAnswer = -1;
      while (iStep > 0) {
        if (iAnswer + iStep >= iMaxValue) {
          iStep = iStep >> 1;
          continue;
        }
        if (fCompare(iAnswer + iStep)) {
          iAnswer += iStep;
        }
        iStep = iStep >> 1;
      }
      return iAnswer;
    };

    return InputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy9lYXN5LW1vdGlvbi1yZWR1eC9saWIvdmlld3MvaW5wdXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlFQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBOEIsT0FBQSxDQUFRLHNCQUFSLENBQTlCLEVBQUUsWUFBQSxJQUFGLEVBQVEsc0JBQUEsY0FBUixFQUF3QixTQUFBLENBQXhCLENBQUE7O0FBQUEsRUFDRSxzQkFBd0IsT0FBQSxDQUFRLE1BQVIsRUFBeEIsbUJBREYsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBSlYsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLGdDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSx3QkFBQSxXQUFBLEdBQWEsRUFBYixDQUFBOztBQUFBLElBRUEsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8seUJBQVA7T0FBTCxFQUF1QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3JDLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGtCQUFQO0FBQUEsWUFBMkIsTUFBQSxFQUFRLGlCQUFuQztXQUFMLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBNEIsSUFBQSxjQUFBLENBQWU7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFBVyxlQUFBLEVBQWlCLFlBQTVCO1dBQWYsQ0FBNUIsRUFGcUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QyxFQURRO0lBQUEsQ0FGVixDQUFBOztBQUFBLHdCQU9BLFVBQUEsR0FBWSxTQUFHLGNBQUgsRUFBbUIsUUFBbkIsR0FBQTtBQUNWLE1BRFksSUFBQyxDQUFBLGlCQUFBLGNBQ2IsQ0FBQTs7UUFENkIsV0FBVztPQUN4QztBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxjQUFwQixDQUZ0QixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsT0FBQSxDQUFRLElBQUMsQ0FBQSxjQUFULEVBQXlCLElBQUMsQ0FBQSxrQkFBMUIsQ0FIZixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQTlCLENBQWtDLDBCQUFsQyxDQUxBLENBQUE7YUFPQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFSVTtJQUFBLENBUFosQ0FBQTs7QUFBQSx3QkFpQkEsWUFBQSxHQUFjLFNBQUUsUUFBRixHQUFBOztRQUFFLFdBQVc7T0FDekI7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFyQixDQUFzQyxVQUF0QyxFQUFrRCxJQUFDLENBQUEsVUFBbkQsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxnQkFBckIsQ0FBc0MsTUFBdEMsRUFBOEMsSUFBQyxDQUFBLE1BQS9DLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQS9CLEVBQ2pCO0FBQUEsUUFBQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO0FBQUEsUUFDQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEZjtBQUFBLFFBRUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsY0FBYyxDQUFDLE9BQWhCLENBQXdCLGNBQXhCLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZoQjtBQUFBLFFBR0EsZ0JBQUEsRUFBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGNBQWMsQ0FBQyxPQUFoQixDQUF3QixnQkFBeEIsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSGxCO09BRGlCLENBQW5CLENBRkEsQ0FBQTthQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsY0FBYyxDQUFDLG9CQUFoQixDQUFxQyxJQUFDLENBQUEsTUFBdEMsQ0FBbkIsRUFSWTtJQUFBLENBakJkLENBQUE7O0FBQUEsd0JBMkJBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBWixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBSFU7SUFBQSxDQTNCWixDQUFBOztBQUFBLHdCQWdDQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEdBQXNCLEVBQXpCO0lBQUEsQ0FoQ1YsQ0FBQTs7QUFBQSx3QkFrQ0EsVUFBQSxHQUFZLFNBQUUsTUFBRixHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQU0sQ0FBQyxZQUFQLENBQW9CLE1BQU0sQ0FBQyxRQUEzQixDQUFYLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsR0FBc0IsQ0FBekI7QUFDRSxRQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLENBSEY7T0FEQTthQUtBLE1BTlU7SUFBQSxDQWxDWixDQUFBOztBQUFBLHdCQTBDQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxNQUE5QixDQUFxQywwQkFBckMsQ0FGQSxDQUFBO2FBR0Esb0NBQUEsRUFKTTtJQUFBLENBMUNSLENBQUE7O0FBQUEsd0JBZ0RBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxjQUFjLENBQUMsdUJBQWhCLENBQXdDLElBQUMsQ0FBQSxXQUFhLENBQUEsQ0FBQSxDQUFLLENBQUEsQ0FBQSxDQUEzRCxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRk87SUFBQSxDQWhEVCxDQUFBOztBQUFBLHdCQW9EQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsS0FBcEIsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRk07SUFBQSxDQXBEUixDQUFBOztBQUFBLHdCQXdEQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQUEsRUFESztJQUFBLENBeERQLENBQUE7O0FBQUEsd0JBMkRBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixVQUFBLDJKQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUF0QixDQUFBO0FBQUEsTUFDQSxrQkFBQSxHQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLENBRHJCLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsY0FBYyxDQUFDLFNBQWhCLENBQUEsQ0FGVixDQUFBO0FBQUEsTUFJQSxLQUFBLEdBQVEsQ0FKUixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsRUFOdEIsQ0FBQTtBQVFBO1dBQVMsaUhBQVQsR0FBQTtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBQSxHQUFTLGtCQUFrQixDQUFDLE1BQXZDLENBQVIsQ0FBQTtBQUNBLFFBQUEsSUFBYyxDQUFBLEdBQUksTUFBQSxHQUFTLGtCQUFrQixDQUFDLE1BQTlDO0FBQUEsVUFBQSxLQUFBLElBQVMsQ0FBVCxDQUFBO1NBREE7QUFBQSxRQUdBLElBQUMsQ0FBQSxrQkFBb0IsQ0FBQSxrQkFBb0IsQ0FBQSxDQUFBLENBQXBCLENBQXJCLEdBQWlELEVBSGpELENBQUE7QUFJQTtBQUFBLGFBQUEsb0RBQUE7Z0NBQUE7QUFDRSxVQUFBLE9BQUEsR0FBVSxLQUFBLEtBQVMsQ0FBbkIsQ0FBQTtBQUFBLFVBQ0EsWUFBQSxHQUFrQixPQUFILEdBQ2Isa0JBQW9CLENBQUEsQ0FBQSxDQURQLEdBR2IsQ0FBQSxZQUFBLEdBQWUsa0JBQWtCLENBQUMsTUFBbEMsRUFDQSxRQUFBLEdBQVcsS0FBQSxHQUFRLFlBRG5CLEVBRUEsQ0FBQSxHQUFPLEtBQUEsSUFBUyxZQUFaLEdBQ0YsQ0FBQSxHQUFJLEtBREYsR0FFSSxLQUFBLEdBQVEsQ0FBQSxHQUFJLFlBQVosSUFBNkIsQ0FBQSxJQUFLLFFBQUEsR0FBVyxDQUFoRCxHQUNILENBQUEsR0FBSSxRQURELEdBR0gsQ0FBQSxDQVBGLEVBUUEsa0JBQW9CLENBQUEsQ0FBQSxDQUFwQixHQUEwQixDQUFFLGtCQUFvQixDQUFBLENBQUEsQ0FBcEIsSUFBMkIsR0FBN0IsQ0FSMUIsQ0FKRixDQUFBO0FBQUEsVUFhQSxJQUFDLENBQUEsa0JBQW9CLENBQUEsa0JBQW9CLENBQUEsQ0FBQSxDQUFwQixDQUF5QixDQUFDLElBQS9DLENBQW9ELFVBQXBELENBYkEsQ0FBQTtBQUFBLFVBY0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsVUFBYixFQUF5QixZQUF6QixFQUNFO0FBQUEsWUFBQSxNQUFBLEVBQVEsT0FBUjtXQURGLENBZEEsQ0FERjtBQUFBLFNBSkE7QUFBQSxzQkFzQkEsS0FBQSxJQUFTLE1BdEJULENBREY7QUFBQTtzQkFUVTtJQUFBLENBM0RaLENBQUE7O0FBQUEsd0JBNkZBLFNBQUEsR0FBVyxTQUFFLFVBQUYsR0FBQTtBQUNULE1BQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFaLENBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFHLFVBQUEsSUFBYyxJQUFDLENBQUEsa0JBQWYsSUFBc0MsSUFBQyxDQUFBLGtCQUFvQixDQUFBLFVBQUEsQ0FBWSxDQUFDLE1BQTNFO0FBQ0UsUUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxrQkFBb0IsQ0FBQSxVQUFBLENBQXBDLENBQUE7QUFDQSxjQUFBLENBRkY7T0FEQTtBQU1BLE1BQUEsSUFBRyxVQUFBLEtBQWdCLFVBQVUsQ0FBQyxXQUFYLENBQUEsQ0FBbkI7QUFDRSxRQUFBLFVBQUEsR0FBYSxVQUFVLENBQUMsV0FBWCxDQUFBLENBQWIsQ0FERjtPQUFBLE1BRUssSUFBRyxVQUFBLEtBQWdCLFVBQVUsQ0FBQyxXQUFYLENBQUEsQ0FBbkI7QUFDSCxRQUFBLFVBQUEsR0FBYSxVQUFVLENBQUMsV0FBWCxDQUFBLENBQWIsQ0FERztPQUFBLE1BQUE7QUFHSCxjQUFBLENBSEc7T0FSTDtBQWFBLE1BQUEsSUFBRyxVQUFBLElBQWMsSUFBQyxDQUFBLGtCQUFmLElBQXNDLElBQUMsQ0FBQSxrQkFBb0IsQ0FBQSxVQUFBLENBQVksQ0FBQyxNQUEzRTtlQUNFLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLGtCQUFvQixDQUFBLFVBQUEsRUFEdEM7T0FkUztJQUFBLENBN0ZYLENBQUE7O0FBQUEsd0JBOEdBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLHdFQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsRUFBVCxDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGNBQWMsQ0FBQyxTQUFoQixDQUFBLENBRFYsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUFBLE1BS0EsY0FBQSxHQUFpQixTQUFFLElBQUYsR0FBQTtBQUNmLFlBQUEsZ0NBQUE7QUFBQSxRQUFBLFFBQWdDLENBQUUsSUFBRixFQUFRLElBQVIsQ0FBaEMsRUFBRSxxQkFBRixFQUFjLHdCQUFkLENBQUE7QUFFQSxRQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsYUFBUjtBQUNFLFVBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBeEIsQ0FBQTtBQUFBLFVBQ0EsYUFBQSxHQUFnQixDQUFFLFVBQVUsQ0FBQyxHQUFiLEVBQWtCLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQXRDLENBRGhCLENBREY7U0FBQSxNQUFBO0FBSUUsVUFBQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBM0IsQ0FBQTtBQUFBLFVBQ0EsVUFBQSxHQUFhLENBQUUsYUFBYSxDQUFDLEdBQWhCLEVBQXFCLGFBQWEsQ0FBQyxNQUFkLEdBQXVCLENBQTVDLENBRGIsQ0FKRjtTQUZBO2VBU0EsV0FBVyxDQUFDLElBQVosQ0FBaUIsQ0FBRSxVQUFGLEVBQWMsYUFBZCxDQUFqQixFQVZlO01BQUEsQ0FMakIsQ0FBQTtBQWlCQTtBQUFBLFdBQUEsNENBQUE7OEJBQUE7QUFDRSxRQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBcEIsRUFBbUMsU0FBbkMsRUFBOEMsY0FBOUMsQ0FBQSxDQURGO0FBQUEsT0FqQkE7YUFvQkEsSUFBQyxDQUFBLFdBQUQsR0FBZSxZQXJCTjtJQUFBLENBOUdYLENBQUE7O0FBQUEsd0JBcUlBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLGdEQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGNBQWMsQ0FBQyxTQUFoQixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFjLENBQUMsWUFBaEIsQ0FBQSxDQURQLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQWMsQ0FBQyxTQUFoQixDQUFBLENBRmpCLENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBWSxJQUFDLENBQUEsWUFBRCxDQUFjLE9BQU8sQ0FBQyxZQUFSLENBQUEsQ0FBZCxFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxJQUFGLEdBQUE7aUJBQ2hELEtBQUMsQ0FBQSxrQkFBa0IsQ0FBQyw4QkFBcEIsQ0FBb0QsQ0FBRSxJQUFGLEVBQVEsQ0FBUixDQUFwRCxDQUFpRSxDQUFDLEdBQWxFLEdBQXdFLEtBRHhCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsQ0FKWixDQUFBO0FBQUEsTUFPQSxTQUFBLElBQWEsQ0FQYixDQUFBO0FBQUEsTUFTQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFlBQUQsQ0FBYyxPQUFPLENBQUMsWUFBUixDQUFBLENBQWQsRUFBc0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsSUFBRixHQUFBO0FBQzlDLGNBQUEsa0JBQUE7QUFBQSxVQUFBLFNBQUEsR0FBWSxLQUFDLENBQUEsa0JBQWtCLENBQUMsOEJBQXBCLENBQW9ELENBQUUsSUFBRixFQUFRLENBQVIsQ0FBcEQsQ0FBaUUsQ0FBQyxHQUE5RSxDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsS0FBQyxDQUFBLGNBQWMsQ0FBQyxxQkFBaEIsQ0FBQSxDQURWLENBQUE7aUJBRUEsU0FBQSxHQUFZLE9BQVosSUFBdUIsUUFIdUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QyxDQVRWLENBQUE7YUFjQTs7QUFBRTthQUFpQixzSEFBakIsR0FBQTtjQUE2QyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVg7QUFBN0MsMEJBQUEsS0FBQTtXQUFBO0FBQUE7O21CQUFGLENBQWdFLENBQUMsR0FBakUsQ0FBcUUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsSUFBRixHQUFBO2lCQUNuRSxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsSUFBdEIsRUFEbUU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRSxFQWZZO0lBQUEsQ0FySWQsQ0FBQTs7QUFBQSx3QkF1SkEsb0JBQUEsR0FBc0IsU0FBRSxJQUFGLEdBQUE7QUFDcEIsVUFBQSxvRUFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxjQUFjLENBQUMsU0FBaEIsQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsY0FBYyxDQUFDLGFBQWhCLENBQUEsQ0FEUixDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsS0FBQSxHQUFRLElBQUMsQ0FBQSxjQUFjLENBQUMsUUFBaEIsQ0FBQSxDQUZqQixDQUFBO0FBQUEsTUFJQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGNBQWMsQ0FBQyxrQkFBaEIsQ0FBbUMsQ0FBRSxJQUFGLEVBQVEsUUFBUixDQUFuQyxDQUpYLENBQUE7QUFBQSxNQUtBLFFBQUEsR0FBVyxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUw3QixDQUFBO0FBQUEsTUFPQSxZQUFBLEdBQWUsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFFLE9BQUYsR0FBQTtpQkFDckMsS0FBQyxDQUFBLGtCQUFrQixDQUFDLDhCQUFwQixDQUFvRCxDQUFFLElBQUYsRUFBUSxPQUFSLENBQXBELENBQXVFLENBQUMsSUFBeEUsR0FBK0UsTUFEMUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixDQVBmLENBQUE7QUFBQSxNQVVBLFlBQUEsSUFBZ0IsQ0FWaEIsQ0FBQTtBQUFBLE1BWUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxZQUFELENBQWMsUUFBZCxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxPQUFGLEdBQUE7aUJBQ25DLEtBQUMsQ0FBQSxrQkFBa0IsQ0FBQyw4QkFBcEIsQ0FBb0QsQ0FBRSxJQUFGLEVBQVEsT0FBUixDQUFwRCxDQUF1RSxDQUFDLElBQXhFLElBQWdGLE9BRDdDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsQ0FaYixDQUFBO2FBZUEsQ0FBRSxDQUFFLElBQUYsRUFBUSxZQUFSLENBQUYsRUFBMEIsQ0FBRSxJQUFGLEVBQVEsVUFBUixDQUExQixFQWhCb0I7SUFBQSxDQXZKdEIsQ0FBQTs7QUFBQSx3QkF5S0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsa0JBQUE7QUFBQSxNQUFBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsQ0FBckIsQ0FBQTthQUNJLElBQUEsTUFBQSxDQUFPLE9BQUEsR0FBVSxDQUFFLENBQUMsQ0FBQyxZQUFGLENBQWUsa0JBQWYsQ0FBRixDQUFWLEdBQWtELElBQXpELEVBQStELEdBQS9ELEVBRk07SUFBQSxDQXpLWixDQUFBOztBQUFBLHdCQTZLQSxTQUFBLEdBQVcsU0FBRSxJQUFGLEdBQUE7YUFDVCxJQUFBLEtBQVEsQ0FBUixJQUFhLENBQUEsSUFBSyxDQUFBLGNBQWMsQ0FBQyxtQkFBaEIsQ0FBcUMsSUFBckMsQ0FBakIsSUFBZ0UsQ0FBQSxJQUFLLENBQUEsY0FBYyxDQUFDLG1CQUFoQixDQUFxQyxJQUFBLEdBQU8sQ0FBNUMsRUFEM0Q7SUFBQSxDQTdLWCxDQUFBOztBQUFBLHdCQWdMQSxZQUFBLEdBQWMsU0FBRSxTQUFGLEVBQWEsUUFBYixHQUFBO0FBQ1osVUFBQSxjQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsQ0FBUixDQUFBO0FBQ0EsYUFBTSxLQUFBLEdBQVEsU0FBZCxHQUFBO0FBQ0UsUUFBQSxLQUFBLElBQVMsQ0FBVCxDQURGO01BQUEsQ0FEQTtBQUFBLE1BSUEsT0FBQSxHQUFVLENBQUEsQ0FKVixDQUFBO0FBS0EsYUFBTSxLQUFBLEdBQVEsQ0FBZCxHQUFBO0FBQ0UsUUFBQSxJQUFHLE9BQUEsR0FBVSxLQUFWLElBQW1CLFNBQXRCO0FBQ0UsVUFBQSxLQUFBLEdBQVEsS0FBQSxJQUFTLENBQWpCLENBQUE7QUFDQSxtQkFGRjtTQUFBO0FBSUEsUUFBQSxJQUFvQixRQUFBLENBQVMsT0FBQSxHQUFVLEtBQW5CLENBQXBCO0FBQUEsVUFBQSxPQUFBLElBQVcsS0FBWCxDQUFBO1NBSkE7QUFBQSxRQU1BLEtBQUEsR0FBUSxLQUFBLElBQVMsQ0FOakIsQ0FERjtNQUFBLENBTEE7YUFjQSxRQWZZO0lBQUEsQ0FoTGQsQ0FBQTs7cUJBQUE7O0tBRHVDLEtBTnpDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/pjim/.atom/packages/easy-motion-redux/lib/views/input.coffee
