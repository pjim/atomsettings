(function() {
  var AllWhitespace, CurrentSelection, Motion, MotionError, MotionWithInput, MoveDown, MoveLeft, MoveRight, MoveToAbsoluteLine, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToLastCharacterOfLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLine, MoveToMiddleOfScreen, MoveToNextParagraph, MoveToNextSentence, MoveToNextWholeWord, MoveToNextWord, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToScreenLine, MoveToStartOfFile, MoveToTopOfScreen, MoveUp, Point, Range, ScrollFullDownKeepCursor, ScrollFullUpKeepCursor, ScrollHalfDownKeepCursor, ScrollHalfUpKeepCursor, ScrollKeepingCursor, WholeWordOrEmptyLineRegex, WholeWordRegex, settings, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  settings = require('../settings');

  WholeWordRegex = /\S+/;

  WholeWordOrEmptyLineRegex = /^\s*$|\S+/;

  AllWhitespace = /^\s$/;

  MotionError = (function() {
    function MotionError(message) {
      this.message = message;
      this.name = 'Motion Error';
    }

    return MotionError;

  })();

  Motion = (function() {
    Motion.prototype.operatesInclusively = false;

    Motion.prototype.operatesLinewise = false;

    function Motion(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
    }

    Motion.prototype.select = function(count, options) {
      var selection, value;
      value = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.editor.getSelections();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          selection = _ref1[_i];
          if (this.isLinewise()) {
            this.moveSelectionLinewise(selection, count, options);
          } else if (this.vimState.mode === 'visual') {
            this.moveSelectionVisual(selection, count, options);
          } else if (this.operatesInclusively) {
            this.moveSelectionInclusively(selection, count, options);
          } else {
            this.moveSelection(selection, count, options);
          }
          _results.push(!selection.isEmpty());
        }
        return _results;
      }).call(this);
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
      return value;
    };

    Motion.prototype.execute = function(count) {
      var cursor, _i, _len, _ref1;
      _ref1 = this.editor.getCursors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cursor = _ref1[_i];
        this.moveCursor(cursor, count);
      }
      return this.editor.mergeCursors();
    };

    Motion.prototype.moveSelectionLinewise = function(selection, count, options) {
      return selection.modifySelection((function(_this) {
        return function() {
          var isEmpty, isReversed, newEndRow, newStartRow, oldEndRow, oldStartRow, wasEmpty, wasReversed, _ref1, _ref2;
          _ref1 = selection.getBufferRowRange(), oldStartRow = _ref1[0], oldEndRow = _ref1[1];
          wasEmpty = selection.isEmpty();
          wasReversed = selection.isReversed();
          if (!(wasEmpty || wasReversed)) {
            selection.cursor.moveLeft();
          }
          _this.moveCursor(selection.cursor, count, options);
          isEmpty = selection.isEmpty();
          isReversed = selection.isReversed();
          if (!(isEmpty || isReversed)) {
            selection.cursor.moveRight();
          }
          _ref2 = selection.getBufferRowRange(), newStartRow = _ref2[0], newEndRow = _ref2[1];
          if (isReversed && !wasReversed) {
            newEndRow = Math.max(newEndRow, oldStartRow);
          }
          if (wasReversed && !isReversed) {
            newStartRow = Math.min(newStartRow, oldEndRow);
          }
          return selection.setBufferRange([[newStartRow, 0], [newEndRow + 1, 0]]);
        };
      })(this));
    };

    Motion.prototype.moveSelectionInclusively = function(selection, count, options) {
      if (!selection.isEmpty()) {
        return this.moveSelectionVisual(selection, count, options);
      }
      return selection.modifySelection((function(_this) {
        return function() {
          var end, start, _ref1;
          _this.moveCursor(selection.cursor, count, options);
          if (selection.isEmpty()) {
            return;
          }
          if (selection.isReversed()) {
            _ref1 = selection.getBufferRange(), start = _ref1.start, end = _ref1.end;
            return selection.setBufferRange([start, [end.row, end.column + 1]]);
          } else {
            return selection.cursor.moveRight();
          }
        };
      })(this));
    };

    Motion.prototype.moveSelectionVisual = function(selection, count, options) {
      return selection.modifySelection((function(_this) {
        return function() {
          var isEmpty, isReversed, newEnd, newStart, oldEnd, oldStart, range, wasEmpty, wasReversed, _ref1, _ref2, _ref3;
          range = selection.getBufferRange();
          _ref1 = [range.start, range.end], oldStart = _ref1[0], oldEnd = _ref1[1];
          wasEmpty = selection.isEmpty();
          wasReversed = selection.isReversed();
          if (!(wasEmpty || wasReversed)) {
            selection.cursor.moveLeft();
          }
          _this.moveCursor(selection.cursor, count, options);
          isEmpty = selection.isEmpty();
          isReversed = selection.isReversed();
          if (!(isEmpty || isReversed)) {
            selection.cursor.moveRight();
          }
          range = selection.getBufferRange();
          _ref2 = [range.start, range.end], newStart = _ref2[0], newEnd = _ref2[1];
          if ((isReversed || isEmpty) && !(wasReversed || wasEmpty)) {
            selection.setBufferRange([newStart, [newEnd.row, oldStart.column + 1]]);
          }
          if (wasReversed && !wasEmpty && !isReversed) {
            selection.setBufferRange([[oldEnd.row, oldEnd.column - 1], newEnd]);
          }
          range = selection.getBufferRange();
          _ref3 = [range.start, range.end], newStart = _ref3[0], newEnd = _ref3[1];
          if (selection.isReversed() && newStart.row === newEnd.row && newStart.column + 1 === newEnd.column) {
            return selection.setBufferRange(range, {
              reversed: false
            });
          }
        };
      })(this));
    };

    Motion.prototype.moveSelection = function(selection, count, options) {
      return selection.modifySelection((function(_this) {
        return function() {
          return _this.moveCursor(selection.cursor, count, options);
        };
      })(this));
    };

    Motion.prototype.isComplete = function() {
      return true;
    };

    Motion.prototype.isRecordable = function() {
      return false;
    };

    Motion.prototype.isLinewise = function() {
      var _ref1, _ref2;
      if (((_ref1 = this.vimState) != null ? _ref1.mode : void 0) === 'visual') {
        return ((_ref2 = this.vimState) != null ? _ref2.submode : void 0) === 'linewise';
      } else {
        return this.operatesLinewise;
      }
    };

    return Motion;

  })();

  CurrentSelection = (function(_super) {
    __extends(CurrentSelection, _super);

    function CurrentSelection(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      CurrentSelection.__super__.constructor.call(this, this.editor, this.vimState);
      this.lastSelectionRange = this.editor.getSelectedBufferRange();
      this.wasLinewise = this.isLinewise();
    }

    CurrentSelection.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return true;
      });
    };

    CurrentSelection.prototype.select = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.vimState.mode !== 'visual') {
        if (this.wasLinewise) {
          this.selectLines();
        } else {
          this.selectCharacters();
        }
      }
      return _.times(count, function() {
        return true;
      });
    };

    CurrentSelection.prototype.selectLines = function() {
      var cursor, lastSelectionExtent, selection, _i, _len, _ref1;
      lastSelectionExtent = this.lastSelectionRange.getExtent();
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        cursor = selection.cursor.getBufferPosition();
        selection.setBufferRange([[cursor.row, 0], [cursor.row + lastSelectionExtent.row, 0]]);
      }
    };

    CurrentSelection.prototype.selectCharacters = function() {
      var lastSelectionExtent, newEnd, selection, start, _i, _len, _ref1;
      lastSelectionExtent = this.lastSelectionRange.getExtent();
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        start = selection.getBufferRange().start;
        newEnd = start.traverse(lastSelectionExtent);
        selection.setBufferRange([start, newEnd]);
      }
    };

    return CurrentSelection;

  })(Motion);

  MotionWithInput = (function(_super) {
    __extends(MotionWithInput, _super);

    function MotionWithInput(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      MotionWithInput.__super__.constructor.call(this, this.editor, this.vimState);
      this.complete = false;
    }

    MotionWithInput.prototype.isComplete = function() {
      return this.complete;
    };

    MotionWithInput.prototype.canComposeWith = function(operation) {
      return operation.characters != null;
    };

    MotionWithInput.prototype.compose = function(input) {
      if (!input.characters) {
        throw new MotionError('Must compose with an Input');
      }
      this.input = input;
      return this.complete = true;
    };

    return MotionWithInput;

  })(Motion);

  MoveLeft = (function(_super) {
    __extends(MoveLeft, _super);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        if (!cursor.isAtBeginningOfLine() || settings.wrapLeftRightMotion()) {
          return cursor.moveLeft();
        }
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(_super) {
    __extends(MoveRight, _super);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var wrapToNextLine;
          wrapToNextLine = settings.wrapLeftRightMotion();
          if (_this.vimState.mode === 'operator-pending' && !cursor.isAtEndOfLine()) {
            wrapToNextLine = false;
          }
          if (!cursor.isAtEndOfLine()) {
            cursor.moveRight();
          }
          if (wrapToNextLine && cursor.isAtEndOfLine()) {
            return cursor.moveRight();
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveUp = (function(_super) {
    __extends(MoveUp, _super);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.prototype.operatesLinewise = true;

    MoveUp.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        if (cursor.getScreenRow() !== 0) {
          return cursor.moveUp();
        }
      });
    };

    return MoveUp;

  })(Motion);

  MoveDown = (function(_super) {
    __extends(MoveDown, _super);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.prototype.operatesLinewise = true;

    MoveDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          if (cursor.getScreenRow() !== _this.editor.getLastScreenRow()) {
            return cursor.moveDown();
          }
        };
      })(this));
    };

    return MoveDown;

  })(Motion);

  MoveToPreviousWord = (function(_super) {
    __extends(MoveToPreviousWord, _super);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfWord();
      });
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToPreviousWholeWord = (function(_super) {
    __extends(MoveToPreviousWholeWord, _super);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var _results;
          cursor.moveToBeginningOfWord();
          _results = [];
          while (!_this.isWholeWord(cursor) && !_this.isBeginningOfFile(cursor)) {
            _results.push(cursor.moveToBeginningOfWord());
          }
          return _results;
        };
      })(this));
    };

    MoveToPreviousWholeWord.prototype.isWholeWord = function(cursor) {
      var char;
      char = cursor.getCurrentWordPrefix().slice(-1);
      return AllWhitespace.test(char);
    };

    MoveToPreviousWholeWord.prototype.isBeginningOfFile = function(cursor) {
      var cur;
      cur = cursor.getBufferPosition();
      return !cur.row && !cur.column;
    };

    return MoveToPreviousWholeWord;

  })(Motion);

  MoveToNextWord = (function(_super) {
    __extends(MoveToNextWord, _super);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.moveCursor = function(cursor, count, options) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var current, next;
          current = cursor.getBufferPosition();
          next = (options != null ? options.excludeWhitespace : void 0) ? cursor.getEndOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          }) : cursor.getBeginningOfNextWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          if (_this.isEndOfFile(cursor)) {
            return;
          }
          if (cursor.isAtEndOfLine()) {
            cursor.moveDown();
            cursor.moveToBeginningOfLine();
            return cursor.skipLeadingWhitespace();
          } else if (current.row === next.row && current.column === next.column) {
            return cursor.moveToEndOfWord();
          } else {
            return cursor.setBufferPosition(next);
          }
        };
      })(this));
    };

    MoveToNextWord.prototype.isEndOfFile = function(cursor) {
      var cur, eof;
      cur = cursor.getBufferPosition();
      eof = this.editor.getEofBufferPosition();
      return cur.row === eof.row && cur.column === eof.column;
    };

    return MoveToNextWord;

  })(Motion);

  MoveToNextWholeWord = (function(_super) {
    __extends(MoveToNextWholeWord, _super);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.prototype.wordRegex = WholeWordOrEmptyLineRegex;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToEndOfWord = (function(_super) {
    __extends(MoveToEndOfWord, _super);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.prototype.operatesInclusively = true;

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var current, next;
          current = cursor.getBufferPosition();
          next = cursor.getEndOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          if (next.column > 0) {
            next.column--;
          }
          if (next.isEqual(current)) {
            cursor.moveRight();
            if (cursor.isAtEndOfLine()) {
              cursor.moveDown();
              cursor.moveToBeginningOfLine();
            }
            next = cursor.getEndOfCurrentWordBufferPosition({
              wordRegex: _this.wordRegex
            });
            if (next.column > 0) {
              next.column--;
            }
          }
          return cursor.setBufferPosition(next);
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToEndOfWholeWord = (function(_super) {
    __extends(MoveToEndOfWholeWord, _super);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.prototype.wordRegex = WholeWordRegex;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToNextSentence = (function(_super) {
    __extends(MoveToNextSentence, _super);

    function MoveToNextSentence() {
      return MoveToNextSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentence.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        var eof, scanRange, start;
        start = cursor.getBufferPosition().translate(new Point(0, 1));
        eof = cursor.editor.getBuffer().getEndPosition();
        scanRange = [start, eof];
        return cursor.editor.scanInBufferRange(/(^$)|(([\.!?] )|^[A-Za-z0-9])/, scanRange, function(_arg) {
          var adjustment, matchText, range, stop;
          matchText = _arg.matchText, range = _arg.range, stop = _arg.stop;
          adjustment = new Point(0, 0);
          if (matchText.match(/[\.!?]/)) {
            adjustment = new Point(0, 2);
          }
          cursor.setBufferPosition(range.start.translate(adjustment));
          return stop();
        });
      });
    };

    return MoveToNextSentence;

  })(Motion);

  MoveToPreviousSentence = (function(_super) {
    __extends(MoveToPreviousSentence, _super);

    function MoveToPreviousSentence() {
      return MoveToPreviousSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentence.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        var bof, end, scanRange;
        end = cursor.getBufferPosition().translate(new Point(0, -1));
        bof = cursor.editor.getBuffer().getFirstPosition();
        scanRange = [bof, end];
        return cursor.editor.backwardsScanInBufferRange(/(^$)|(([\.!?] )|^[A-Za-z0-9])/, scanRange, function(_arg) {
          var adjustment, matchText, range, stop;
          matchText = _arg.matchText, range = _arg.range, stop = _arg.stop;
          adjustment = new Point(0, 0);
          if (matchText.match(/[\.!?]/)) {
            adjustment = new Point(0, 2);
          }
          cursor.setBufferPosition(range.start.translate(adjustment));
          return stop();
        });
      });
    };

    return MoveToPreviousSentence;

  })(Motion);

  MoveToNextParagraph = (function(_super) {
    __extends(MoveToNextParagraph, _super);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfNextParagraph();
      });
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(_super) {
    __extends(MoveToPreviousParagraph, _super);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfPreviousParagraph();
      });
    };

    return MoveToPreviousParagraph;

  })(Motion);

  MoveToLine = (function(_super) {
    __extends(MoveToLine, _super);

    function MoveToLine() {
      return MoveToLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLine.prototype.operatesLinewise = true;

    MoveToLine.prototype.getDestinationRow = function(count) {
      if (count != null) {
        return count - 1;
      } else {
        return this.editor.getLineCount() - 1;
      }
    };

    return MoveToLine;

  })(Motion);

  MoveToAbsoluteLine = (function(_super) {
    __extends(MoveToAbsoluteLine, _super);

    function MoveToAbsoluteLine() {
      return MoveToAbsoluteLine.__super__.constructor.apply(this, arguments);
    }

    MoveToAbsoluteLine.prototype.moveCursor = function(cursor, count) {
      cursor.setBufferPosition([this.getDestinationRow(count), Infinity]);
      cursor.moveToFirstCharacterOfLine();
      if (cursor.getBufferColumn() === 0) {
        return cursor.moveToEndOfLine();
      }
    };

    return MoveToAbsoluteLine;

  })(MoveToLine);

  MoveToRelativeLine = (function(_super) {
    __extends(MoveToRelativeLine, _super);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.prototype.moveCursor = function(cursor, count) {
      var column, row, _ref1;
      if (count == null) {
        count = 1;
      }
      _ref1 = cursor.getBufferPosition(), row = _ref1.row, column = _ref1.column;
      return cursor.setBufferPosition([row + (count - 1), 0]);
    };

    return MoveToRelativeLine;

  })(MoveToLine);

  MoveToScreenLine = (function(_super) {
    __extends(MoveToScreenLine, _super);

    function MoveToScreenLine(editorElement, vimState, scrolloff) {
      this.editorElement = editorElement;
      this.vimState = vimState;
      this.scrolloff = scrolloff;
      this.scrolloff = 2;
      MoveToScreenLine.__super__.constructor.call(this, this.editorElement.getModel(), this.vimState);
    }

    MoveToScreenLine.prototype.moveCursor = function(cursor, count) {
      var column, row, _ref1;
      if (count == null) {
        count = 1;
      }
      _ref1 = cursor.getBufferPosition(), row = _ref1.row, column = _ref1.column;
      return cursor.setScreenPosition([this.getDestinationRow(count), 0]);
    };

    return MoveToScreenLine;

  })(MoveToLine);

  MoveToBeginningOfLine = (function(_super) {
    __extends(MoveToBeginningOfLine, _super);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfLine();
      });
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(_super) {
    __extends(MoveToFirstCharacterOfLine, _super);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        cursor.moveToBeginningOfLine();
        return cursor.moveToFirstCharacterOfLine();
      });
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineAndDown, _super);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.prototype.operatesLinewise = true;

    MoveToFirstCharacterOfLineAndDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count - 1, function() {
        return cursor.moveDown();
      });
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(Motion);

  MoveToLastCharacterOfLine = (function(_super) {
    __extends(MoveToLastCharacterOfLine, _super);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        cursor.moveToEndOfLine();
        return cursor.goalColumn = Infinity;
      });
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToLastNonblankCharacterOfLineAndDown, _super);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.prototype.operatesInclusively = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.skipTrailingWhitespace = function(cursor) {
      var position, scanRange, startOfTrailingWhitespace;
      position = cursor.getBufferPosition();
      scanRange = cursor.getCurrentLineBufferRange();
      startOfTrailingWhitespace = [scanRange.end.row, scanRange.end.column - 1];
      this.editor.scanInBufferRange(/[ \t]+$/, scanRange, function(_arg) {
        var range;
        range = _arg.range;
        startOfTrailingWhitespace = range.start;
        return startOfTrailingWhitespace.column -= 1;
      });
      return cursor.setBufferPosition(startOfTrailingWhitespace);
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count - 1, function() {
        return cursor.moveDown();
      });
      return this.skipTrailingWhitespace(cursor);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(_super) {
    __extends(MoveToFirstCharacterOfLineUp, _super);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.prototype.operatesLinewise = true;

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count, function() {
        return cursor.moveUp();
      });
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    };

    return MoveToFirstCharacterOfLineUp;

  })(Motion);

  MoveToFirstCharacterOfLineDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineDown, _super);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.prototype.operatesLinewise = true;

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count, function() {
        return cursor.moveDown();
      });
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    };

    return MoveToFirstCharacterOfLineDown;

  })(Motion);

  MoveToStartOfFile = (function(_super) {
    __extends(MoveToStartOfFile, _super);

    function MoveToStartOfFile() {
      return MoveToStartOfFile.__super__.constructor.apply(this, arguments);
    }

    MoveToStartOfFile.prototype.moveCursor = function(cursor, count) {
      var column, row, _ref1;
      if (count == null) {
        count = 1;
      }
      _ref1 = this.editor.getCursorBufferPosition(), row = _ref1.row, column = _ref1.column;
      cursor.setBufferPosition([this.getDestinationRow(count), 0]);
      if (!this.isLinewise()) {
        return cursor.moveToFirstCharacterOfLine();
      }
    };

    return MoveToStartOfFile;

  })(MoveToLine);

  MoveToTopOfScreen = (function(_super) {
    __extends(MoveToTopOfScreen, _super);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.prototype.getDestinationRow = function(count) {
      var firstScreenRow, offset;
      if (count == null) {
        count = 0;
      }
      firstScreenRow = this.editorElement.getFirstVisibleScreenRow();
      if (firstScreenRow > 0) {
        offset = Math.max(count - 1, this.scrolloff);
      } else {
        offset = count > 0 ? count - 1 : count;
      }
      return firstScreenRow + offset;
    };

    return MoveToTopOfScreen;

  })(MoveToScreenLine);

  MoveToBottomOfScreen = (function(_super) {
    __extends(MoveToBottomOfScreen, _super);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.prototype.getDestinationRow = function(count) {
      var lastRow, lastScreenRow, offset;
      if (count == null) {
        count = 0;
      }
      lastScreenRow = this.editorElement.getLastVisibleScreenRow();
      lastRow = this.editor.getBuffer().getLastRow();
      if (lastScreenRow !== lastRow) {
        offset = Math.max(count - 1, this.scrolloff);
      } else {
        offset = count > 0 ? count - 1 : count;
      }
      return lastScreenRow - offset;
    };

    return MoveToBottomOfScreen;

  })(MoveToScreenLine);

  MoveToMiddleOfScreen = (function(_super) {
    __extends(MoveToMiddleOfScreen, _super);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.prototype.getDestinationRow = function() {
      var firstScreenRow, height, lastScreenRow;
      firstScreenRow = this.editorElement.getFirstVisibleScreenRow();
      lastScreenRow = this.editorElement.getLastVisibleScreenRow();
      height = lastScreenRow - firstScreenRow;
      return Math.floor(firstScreenRow + (height / 2));
    };

    return MoveToMiddleOfScreen;

  })(MoveToScreenLine);

  ScrollKeepingCursor = (function(_super) {
    __extends(ScrollKeepingCursor, _super);

    ScrollKeepingCursor.prototype.previousFirstScreenRow = 0;

    ScrollKeepingCursor.prototype.currentFirstScreenRow = 0;

    function ScrollKeepingCursor(editorElement, vimState) {
      this.editorElement = editorElement;
      this.vimState = vimState;
      ScrollKeepingCursor.__super__.constructor.call(this, this.editorElement.getModel(), this.vimState);
    }

    ScrollKeepingCursor.prototype.select = function(count, options) {
      var finalDestination;
      finalDestination = this.scrollScreen(count);
      ScrollKeepingCursor.__super__.select.call(this, count, options);
      return this.editor.setScrollTop(finalDestination);
    };

    ScrollKeepingCursor.prototype.execute = function(count) {
      var finalDestination;
      finalDestination = this.scrollScreen(count);
      ScrollKeepingCursor.__super__.execute.call(this, count);
      return this.editor.setScrollTop(finalDestination);
    };

    ScrollKeepingCursor.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return cursor.setScreenPosition([this.getDestinationRow(count), 0]);
    };

    ScrollKeepingCursor.prototype.getDestinationRow = function(count) {
      var column, row, _ref1;
      _ref1 = this.editor.getCursorScreenPosition(), row = _ref1.row, column = _ref1.column;
      return this.currentFirstScreenRow - this.previousFirstScreenRow + row;
    };

    ScrollKeepingCursor.prototype.scrollScreen = function(count) {
      var destination;
      if (count == null) {
        count = 1;
      }
      this.previousFirstScreenRow = this.editorElement.getFirstVisibleScreenRow();
      destination = this.scrollDestination(count);
      this.editor.setScrollTop(destination);
      this.currentFirstScreenRow = this.editorElement.getFirstVisibleScreenRow();
      return destination;
    };

    return ScrollKeepingCursor;

  })(MoveToLine);

  ScrollHalfUpKeepCursor = (function(_super) {
    __extends(ScrollHalfUpKeepCursor, _super);

    function ScrollHalfUpKeepCursor() {
      return ScrollHalfUpKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfUpKeepCursor.prototype.scrollDestination = function(count) {
      var half;
      half = Math.floor(this.editor.getRowsPerPage() / 2) * this.editor.getLineHeightInPixels();
      return this.editor.getScrollTop() - count * half;
    };

    return ScrollHalfUpKeepCursor;

  })(ScrollKeepingCursor);

  ScrollFullUpKeepCursor = (function(_super) {
    __extends(ScrollFullUpKeepCursor, _super);

    function ScrollFullUpKeepCursor() {
      return ScrollFullUpKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollFullUpKeepCursor.prototype.scrollDestination = function(count) {
      return this.editor.getScrollTop() - (count * this.editor.getHeight());
    };

    return ScrollFullUpKeepCursor;

  })(ScrollKeepingCursor);

  ScrollHalfDownKeepCursor = (function(_super) {
    __extends(ScrollHalfDownKeepCursor, _super);

    function ScrollHalfDownKeepCursor() {
      return ScrollHalfDownKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfDownKeepCursor.prototype.scrollDestination = function(count) {
      var half;
      half = Math.floor(this.editor.getRowsPerPage() / 2) * this.editor.getLineHeightInPixels();
      return this.editor.getScrollTop() + count * half;
    };

    return ScrollHalfDownKeepCursor;

  })(ScrollKeepingCursor);

  ScrollFullDownKeepCursor = (function(_super) {
    __extends(ScrollFullDownKeepCursor, _super);

    function ScrollFullDownKeepCursor() {
      return ScrollFullDownKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollFullDownKeepCursor.prototype.scrollDestination = function(count) {
      return this.editor.getScrollTop() + (count * this.editor.getHeight());
    };

    return ScrollFullDownKeepCursor;

  })(ScrollKeepingCursor);

  module.exports = {
    Motion: Motion,
    MotionWithInput: MotionWithInput,
    CurrentSelection: CurrentSelection,
    MoveLeft: MoveLeft,
    MoveRight: MoveRight,
    MoveUp: MoveUp,
    MoveDown: MoveDown,
    MoveToPreviousWord: MoveToPreviousWord,
    MoveToPreviousWholeWord: MoveToPreviousWholeWord,
    MoveToNextWord: MoveToNextWord,
    MoveToNextWholeWord: MoveToNextWholeWord,
    MoveToEndOfWord: MoveToEndOfWord,
    MoveToNextSentence: MoveToNextSentence,
    MoveToPreviousSentence: MoveToPreviousSentence,
    MoveToNextParagraph: MoveToNextParagraph,
    MoveToPreviousParagraph: MoveToPreviousParagraph,
    MoveToAbsoluteLine: MoveToAbsoluteLine,
    MoveToRelativeLine: MoveToRelativeLine,
    MoveToBeginningOfLine: MoveToBeginningOfLine,
    MoveToFirstCharacterOfLineUp: MoveToFirstCharacterOfLineUp,
    MoveToFirstCharacterOfLineDown: MoveToFirstCharacterOfLineDown,
    MoveToFirstCharacterOfLine: MoveToFirstCharacterOfLine,
    MoveToFirstCharacterOfLineAndDown: MoveToFirstCharacterOfLineAndDown,
    MoveToLastCharacterOfLine: MoveToLastCharacterOfLine,
    MoveToLastNonblankCharacterOfLineAndDown: MoveToLastNonblankCharacterOfLineAndDown,
    MoveToStartOfFile: MoveToStartOfFile,
    MoveToTopOfScreen: MoveToTopOfScreen,
    MoveToBottomOfScreen: MoveToBottomOfScreen,
    MoveToMiddleOfScreen: MoveToMiddleOfScreen,
    MoveToEndOfWholeWord: MoveToEndOfWholeWord,
    MotionError: MotionError,
    ScrollHalfUpKeepCursor: ScrollHalfUpKeepCursor,
    ScrollFullUpKeepCursor: ScrollFullUpKeepCursor,
    ScrollHalfDownKeepCursor: ScrollHalfDownKeepCursor,
    ScrollFullDownKeepCursor: ScrollFullDownKeepCursor
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvbW90aW9ucy9nZW5lcmFsLW1vdGlvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHEzQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLGNBQUEsR0FBaUIsS0FKakIsQ0FBQTs7QUFBQSxFQUtBLHlCQUFBLEdBQTRCLFdBTDVCLENBQUE7O0FBQUEsRUFNQSxhQUFBLEdBQWdCLE1BTmhCLENBQUE7O0FBQUEsRUFRTTtBQUNTLElBQUEscUJBQUUsT0FBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsVUFBQSxPQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsY0FBUixDQURXO0lBQUEsQ0FBYjs7dUJBQUE7O01BVEYsQ0FBQTs7QUFBQSxFQVlNO0FBQ0oscUJBQUEsbUJBQUEsR0FBcUIsS0FBckIsQ0FBQTs7QUFBQSxxQkFDQSxnQkFBQSxHQUFrQixLQURsQixDQUFBOztBQUdhLElBQUEsZ0JBQUUsTUFBRixFQUFXLFFBQVgsR0FBQTtBQUFzQixNQUFyQixJQUFDLENBQUEsU0FBQSxNQUFvQixDQUFBO0FBQUEsTUFBWixJQUFDLENBQUEsV0FBQSxRQUFXLENBQXRCO0lBQUEsQ0FIYjs7QUFBQSxxQkFLQSxNQUFBLEdBQVEsU0FBQyxLQUFELEVBQVEsT0FBUixHQUFBO0FBQ04sVUFBQSxnQkFBQTtBQUFBLE1BQUEsS0FBQTs7QUFB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

//# sourceURL=/home/pjim/.atom/packages/vim-mode/lib/motions/general-motions.coffee
