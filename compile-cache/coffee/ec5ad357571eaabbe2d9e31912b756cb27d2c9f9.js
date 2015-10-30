(function() {
  var helpers;

  helpers = require('./spec-helper');

  describe("Motions", function() {
    var editor, editorElement, keydown, normalModeInputKeydown, submitNormalModeInputText, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2];
    beforeEach(function() {
      var vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      vimMode.activateResources();
      return helpers.getEditorElement(function(element) {
        editorElement = element;
        editor = editorElement.getModel();
        vimState = editorElement.vimState;
        vimState.activateNormalMode();
        return vimState.resetNormalMode();
      });
    });
    keydown = function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.element == null) {
        options.element = editorElement;
      }
      return helpers.keydown(key, options);
    };
    normalModeInputKeydown = function(key, opts) {
      var theEditor;
      if (opts == null) {
        opts = {};
      }
      theEditor = opts.editor || editor;
      return theEditor.normalModeInputView.editorElement.getModel().setText(key);
    };
    submitNormalModeInputText = function(text) {
      var inputEditor;
      inputEditor = editor.normalModeInputView.editorElement;
      inputEditor.getModel().setText(text);
      return atom.commands.dispatch(inputEditor, "core:confirm");
    };
    describe("simple motions", function() {
      beforeEach(function() {
        editor.setText("12345\nabcd\nABCDE");
        return editor.setCursorScreenPosition([1, 1]);
      });
      describe("the h keybinding", function() {
        describe("as a motion", function() {
          it("moves the cursor left, but not to the previous line", function() {
            keydown('h');
            expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            keydown('h');
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
          return it("moves the cursor to the previous line if wrapLeftRightMotion is true", function() {
            atom.config.set('vim-mode.wrapLeftRightMotion', true);
            keydown('h');
            keydown('h');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
          });
        });
        return describe("as a selection", function() {
          return it("selects the character to the left", function() {
            keydown('y');
            keydown('h');
            expect(vimState.getRegister('"').text).toBe('a');
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
      });
      describe("the j keybinding", function() {
        it("moves the cursor down, but not to the end of the last line", function() {
          keydown('j');
          expect(editor.getCursorScreenPosition()).toEqual([2, 1]);
          keydown('j');
          return expect(editor.getCursorScreenPosition()).toEqual([2, 1]);
        });
        it("moves the cursor to the end of the line, not past it", function() {
          editor.setCursorScreenPosition([0, 4]);
          keydown('j');
          return expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
        });
        it("remembers the position it column it was in after moving to shorter line", function() {
          editor.setCursorScreenPosition([0, 4]);
          keydown('j');
          expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
          keydown('j');
          return expect(editor.getCursorScreenPosition()).toEqual([2, 4]);
        });
        return describe("when visual mode", function() {
          beforeEach(function() {
            keydown('v');
            return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
          });
          it("moves the cursor down", function() {
            keydown('j');
            return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
          });
          it("doesn't go over after the last line", function() {
            keydown('j');
            return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
          });
          return it("selects the text while moving", function() {
            keydown('j');
            return expect(editor.getSelectedText()).toBe("bcd\nAB");
          });
        });
      });
      describe("the k keybinding", function() {
        return it("moves the cursor up, but not to the beginning of the first line", function() {
          keydown('k');
          expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          keydown('k');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
        });
      });
      return describe("the l keybinding", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([1, 2]);
        });
        it("moves the cursor right, but not to the next line", function() {
          keydown('l');
          expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
          keydown('l');
          return expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
        });
        it("moves the cursor to the next line if wrapLeftRightMotion is true", function() {
          atom.config.set('vim-mode.wrapLeftRightMotion', true);
          keydown('l');
          keydown('l');
          return expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
        });
        return describe("on a blank line", function() {
          return it("doesn't move the cursor", function() {
            editor.setText("\n\n\n");
            editor.setCursorBufferPosition([1, 0]);
            keydown('l');
            return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          });
        });
      });
    });
    describe("the w keybinding", function() {
      beforeEach(function() {
        return editor.setText("ab cde1+- \n xyz\n\nzip");
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 0]);
        });
        it("moves the cursor to the beginning of the next word", function() {
          keydown('w');
          expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
          keydown('w');
          expect(editor.getCursorScreenPosition()).toEqual([0, 7]);
          keydown('w');
          expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
          keydown('w');
          expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
          keydown('w');
          expect(editor.getCursorScreenPosition()).toEqual([3, 0]);
          keydown('w');
          expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
          keydown('w');
          return expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
        });
        return it("moves the cursor to the end of the word if last word in file", function() {
          editor.setText("abc");
          editor.setCursorScreenPosition([0, 0]);
          keydown('w');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('y');
            return keydown('w');
          });
          return it("selects to the end of the word", function() {
            return expect(vimState.getRegister('"').text).toBe('ab ');
          });
        });
        return describe("between words", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 2]);
            keydown('y');
            return keydown('w');
          });
          return it("selects the whitespace", function() {
            return expect(vimState.getRegister('"').text).toBe(' ');
          });
        });
      });
    });
    describe("the W keybinding", function() {
      beforeEach(function() {
        return editor.setText("cde1+- ab \n xyz\n\nzip");
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("moves the cursor to the beginning of the next word", function() {
          keydown('W', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([0, 7]);
          keydown('W', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
          keydown('W', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
          keydown('W', {
            shift: true
          });
          return expect(editor.getCursorScreenPosition()).toEqual([3, 0]);
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the whole word", function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('y');
            keydown('W', {
              shift: true
            });
            return expect(vimState.getRegister('"').text).toBe('cde1+- ');
          });
        });
        it("continues past blank lines", function() {
          editor.setCursorScreenPosition([2, 0]);
          keydown('d');
          keydown('W', {
            shift: true
          });
          expect(editor.getText()).toBe("cde1+- ab \n xyz\nzip");
          return expect(vimState.getRegister('"').text).toBe('\n');
        });
        return it("doesn't go past the end of the file", function() {
          editor.setCursorScreenPosition([3, 0]);
          keydown('d');
          keydown('W', {
            shift: true
          });
          expect(editor.getText()).toBe("cde1+- ab \n xyz\n\n");
          return expect(vimState.getRegister('"').text).toBe('zip');
        });
      });
    });
    describe("the e keybinding", function() {
      beforeEach(function() {
        return editor.setText("ab cde1+- \n xyz\n\nzip");
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("moves the cursor to the end of the current word", function() {
          keydown('e');
          expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          keydown('e');
          expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
          keydown('e');
          expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
          keydown('e');
          expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
          keydown('e');
          return expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('y');
            return keydown('e');
          });
          return it("selects to the end of the current word", function() {
            return expect(vimState.getRegister('"').text).toBe('ab');
          });
        });
        return describe("between words", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 2]);
            keydown('y');
            return keydown('e');
          });
          return it("selects to the end of the next word", function() {
            return expect(vimState.getRegister('"').text).toBe(' cde1');
          });
        });
      });
    });
    describe("the E keybinding", function() {
      beforeEach(function() {
        return editor.setText("ab  cde1+- \n xyz \n\nzip\n");
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("moves the cursor to the end of the current word", function() {
          keydown('E', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          keydown('E', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([0, 9]);
          keydown('E', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
          keydown('E', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
          keydown('E', {
            shift: true
          });
          return expect(editor.getCursorScreenPosition()).toEqual([4, 0]);
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('y');
            return keydown('E', {
              shift: true
            });
          });
          return it("selects to the end of the current word", function() {
            return expect(vimState.getRegister('"').text).toBe('ab');
          });
        });
        describe("between words", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 2]);
            keydown('y');
            return keydown('E', {
              shift: true
            });
          });
          return it("selects to the end of the next word", function() {
            return expect(vimState.getRegister('"').text).toBe('  cde1+-');
          });
        });
        return describe("press more than once", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('v');
            keydown('E', {
              shift: true
            });
            keydown('E', {
              shift: true
            });
            return keydown('y');
          });
          return it("selects to the end of the current word", function() {
            return expect(vimState.getRegister('"').text).toBe('ab  cde1+-');
          });
        });
      });
    });
    describe("the ) keybinding", function() {
      beforeEach(function() {
        editor.setText("This is a sentence. This is a second sentence.\nThis is a third sentence.\n\nThis sentence is past the paragraph boundary.");
        return editor.setCursorBufferPosition([0, 0]);
      });
      describe("as a motion", function() {
        return it("moves the cursor to the beginning of the next sentence", function() {
          keydown(')');
          expect(editor.getCursorBufferPosition()).toEqual([0, 20]);
          keydown(')');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          keydown(')');
          return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('y');
          return keydown(')');
        });
        return it('selects to the start of the next sentence', function() {
          return expect(vimState.getRegister('"').text).toBe("This is a sentence. ");
        });
      });
    });
    describe("the ( keybinding", function() {
      beforeEach(function() {
        editor.setText("This first sentence is in its own paragraph.\n\nThis is a sentence. This is a second sentence.\nThis is a third sentence");
        return editor.setCursorBufferPosition([3, 0]);
      });
      describe("as a motion", function() {
        return it("moves the cursor to the beginning of the previous sentence", function() {
          keydown('(');
          expect(editor.getCursorBufferPosition()).toEqual([2, 20]);
          keydown('(');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          keydown('(');
          return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('y');
          return keydown('(');
        });
        return it('selects to the end of the previous sentence', function() {
          return expect(vimState.getRegister('"').text).toBe("This is a second sentence.\n");
        });
      });
    });
    describe("the } keybinding", function() {
      beforeEach(function() {
        editor.setText("abcde\n\nfghij\nhijk\n  xyz  \n\nzip\n\n  \nthe end");
        return editor.setCursorScreenPosition([0, 0]);
      });
      describe("as a motion", function() {
        return it("moves the cursor to the end of the paragraph", function() {
          keydown('}');
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          keydown('}');
          expect(editor.getCursorScreenPosition()).toEqual([5, 0]);
          keydown('}');
          expect(editor.getCursorScreenPosition()).toEqual([7, 0]);
          keydown('}');
          return expect(editor.getCursorScreenPosition()).toEqual([9, 6]);
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('y');
          return keydown('}');
        });
        return it('selects to the end of the current paragraph', function() {
          return expect(vimState.getRegister('"').text).toBe("abcde\n");
        });
      });
    });
    describe("the { keybinding", function() {
      beforeEach(function() {
        editor.setText("abcde\n\nfghij\nhijk\n  xyz  \n\nzip\n\n  \nthe end");
        return editor.setCursorScreenPosition([9, 0]);
      });
      describe("as a motion", function() {
        return it("moves the cursor to the beginning of the paragraph", function() {
          keydown('{');
          expect(editor.getCursorScreenPosition()).toEqual([7, 0]);
          keydown('{');
          expect(editor.getCursorScreenPosition()).toEqual([5, 0]);
          keydown('{');
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          keydown('{');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([7, 0]);
          keydown('y');
          return keydown('{');
        });
        return it('selects to the beginning of the current paragraph', function() {
          return expect(vimState.getRegister('"').text).toBe("\nzip\n");
        });
      });
    });
    describe("the b keybinding", function() {
      beforeEach(function() {
        return editor.setText(" ab cde1+- \n xyz\n\nzip }\n last");
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([4, 1]);
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([3, 4]);
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([3, 0]);
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          keydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          keydown('b');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 2]);
            keydown('y');
            return keydown('b');
          });
          return it("selects to the beginning of the current word", function() {
            expect(vimState.getRegister('"').text).toBe('a');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          });
        });
        return describe("between words", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 4]);
            keydown('y');
            return keydown('b');
          });
          return it("selects to the beginning of the last word", function() {
            expect(vimState.getRegister('"').text).toBe('ab ');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          });
        });
      });
    });
    describe("the B keybinding", function() {
      beforeEach(function() {
        return editor.setText("cde1+- ab \n\t xyz-123\n\n zip");
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([4, 1]);
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          keydown('B', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([3, 1]);
          keydown('B', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
          keydown('B', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
          keydown('B', {
            shift: true
          });
          expect(editor.getCursorScreenPosition()).toEqual([0, 7]);
          keydown('B', {
            shift: true
          });
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
      return describe("as a selection", function() {
        it("selects to the beginning of the whole word", function() {
          editor.setCursorScreenPosition([1, 9]);
          keydown('y');
          keydown('B', {
            shift: true
          });
          return expect(vimState.getRegister('"').text).toBe('xyz-12');
        });
        return it("doesn't go past the beginning of the file", function() {
          editor.setCursorScreenPosition([0, 0]);
          vimState.setRegister('"', {
            text: 'abc'
          });
          keydown('y');
          keydown('B', {
            shift: true
          });
          return expect(vimState.getRegister('"').text).toBe('abc');
        });
      });
    });
    describe("the ^ keybinding", function() {
      beforeEach(function() {
        return editor.setText("  abcde");
      });
      describe("from the beginning of the line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 0]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('^');
          });
          return it("moves the cursor to the first character of the line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('^');
          });
          return it('selects to the first character of the line', function() {
            expect(editor.getText()).toBe('abcde');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          });
        });
      });
      describe("from the first character of the line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 2]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('^');
          });
          return it("stays put", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('^');
          });
          return it("does nothing", function() {
            expect(editor.getText()).toBe('  abcde');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
      });
      return describe("from the middle of a word", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 4]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('^');
          });
          return it("moves the cursor to the first character of the line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('^');
          });
          return it('selects to the first character of the line', function() {
            expect(editor.getText()).toBe('  cde');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        editor.setText("  abcde");
        return editor.setCursorScreenPosition([0, 4]);
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return keydown('0');
        });
        return it("moves the cursor to the first column", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('0');
        });
        return it('selects to the first column of the line', function() {
          expect(editor.getText()).toBe('cde');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
    });
    describe("the $ keybinding", function() {
      beforeEach(function() {
        editor.setText("  abcde\n\n1234567890");
        return editor.setCursorScreenPosition([0, 4]);
      });
      describe("as a motion from empty line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([1, 0]);
        });
        return it("moves the cursor to the end of the line", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return keydown('$');
        });
        it("moves the cursor to the end of the line", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
        });
        return it("should remain in the last column when moving down", function() {
          keydown('j');
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          keydown('j');
          return expect(editor.getCursorScreenPosition()).toEqual([2, 9]);
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('$');
        });
        return it("selects to the beginning of the lines", function() {
          expect(editor.getText()).toBe("  ab\n\n1234567890");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        editor.setText("  a\n");
        return editor.setCursorScreenPosition([0, 2]);
      });
      return describe("as a motion", function() {
        beforeEach(function() {
          return keydown('0');
        });
        return it("moves the cursor to the beginning of the line", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
    });
    describe("the - keybinding", function() {
      beforeEach(function() {
        return editor.setText("abcdefg\n  abc\n  abc\n");
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([1, 3]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('-');
          });
          return it("moves the cursor to the first character of the previous line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('-');
          });
          return it("deletes the current and previous line", function() {
            return expect(editor.getText()).toBe("  abc\n");
          });
        });
      });
      describe("from the first character of a line indented the same as the previous one", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([2, 2]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('-');
          });
          return it("moves to the first character of the previous line (directly above)", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('-');
          });
          return it("selects to the first character of the previous line (directly above)", function() {
            return expect(editor.getText()).toBe("abcdefg\n");
          });
        });
      });
      describe("from the beginning of a line preceded by an indented line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([2, 0]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('-');
          });
          return it("moves the cursor to the first character of the previous line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('-');
          });
          return it("selects to the first character of the previous line", function() {
            return expect(editor.getText()).toBe("abcdefg\n");
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          editor.setText("1\n2\n3\n4\n5\n6\n");
          return editor.setCursorScreenPosition([4, 0]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            keydown('3');
            return keydown('-');
          });
          return it("moves the cursor to the first character of that many lines previous", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            keydown('3');
            return keydown('-');
          });
          return it("deletes the current line plus that many previous lines", function() {
            expect(editor.getText()).toBe("1\n6\n");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
      });
    });
    describe("the + keybinding", function() {
      beforeEach(function() {
        return editor.setText("  abc\n  abc\nabcdefg\n");
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([1, 3]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('+');
          });
          return it("moves the cursor to the first character of the next line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('+');
          });
          return it("deletes the current and next line", function() {
            return expect(editor.getText()).toBe("  abc\n");
          });
        });
      });
      describe("from the first character of a line indented the same as the next one", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 2]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('+');
          });
          return it("moves to the first character of the next line (directly below)", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('+');
          });
          return it("selects to the first character of the next line (directly below)", function() {
            return expect(editor.getText()).toBe("abcdefg\n");
          });
        });
      });
      describe("from the beginning of a line followed by an indented line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 0]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('+');
          });
          return it("moves the cursor to the first character of the next line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('+');
          });
          return it("selects to the first character of the next line", function() {
            expect(editor.getText()).toBe("abcdefg\n");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          editor.setText("1\n2\n3\n4\n5\n6\n");
          return editor.setCursorScreenPosition([1, 0]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            keydown('3');
            return keydown('+');
          });
          return it("moves the cursor to the first character of that many lines following", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([4, 0]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            keydown('3');
            return keydown('+');
          });
          return it("deletes the current line plus that many following lines", function() {
            expect(editor.getText()).toBe("1\n6\n");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
      });
    });
    describe("the _ keybinding", function() {
      beforeEach(function() {
        return editor.setText("  abc\n  abc\nabcdefg\n");
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([1, 3]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            return keydown('_');
          });
          return it("moves the cursor to the first character of the current line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            return keydown('_');
          });
          return it("deletes the current line", function() {
            expect(editor.getText()).toBe("  abc\nabcdefg\n");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          editor.setText("1\n2\n3\n4\n5\n6\n");
          return editor.setCursorScreenPosition([1, 0]);
        });
        describe("as a motion", function() {
          beforeEach(function() {
            keydown('3');
            return keydown('_');
          });
          return it("moves the cursor to the first character of that many lines following", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([3, 0]);
          });
        });
        return describe("as a selection", function() {
          beforeEach(function() {
            keydown('d');
            keydown('3');
            return keydown('_');
          });
          return it("deletes the current line plus that many following lines", function() {
            expect(editor.getText()).toBe("1\n5\n6\n");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
      });
    });
    describe("the enter keybinding", function() {
      var keydownCodeForEnter, startingText;
      keydownCodeForEnter = '\r';
      startingText = "  abc\n  abc\nabcdefg\n";
      return describe("from the middle of a line", function() {
        var startingCursorPosition;
        startingCursorPosition = [1, 3];
        describe("as a motion", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition;
            editor.setText(startingText);
            editor.setCursorScreenPosition(startingCursorPosition);
            keydown('+');
            referenceCursorPosition = editor.getCursorScreenPosition();
            editor.setText(startingText);
            editor.setCursorScreenPosition(startingCursorPosition);
            keydown(keydownCodeForEnter);
            return expect(editor.getCursorScreenPosition()).toEqual(referenceCursorPosition);
          });
        });
        return describe("as a selection", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition, referenceText;
            editor.setText(startingText);
            editor.setCursorScreenPosition(startingCursorPosition);
            keydown('d');
            keydown('+');
            referenceText = editor.getText();
            referenceCursorPosition = editor.getCursorScreenPosition();
            editor.setText(startingText);
            editor.setCursorScreenPosition(startingCursorPosition);
            keydown('d');
            keydown(keydownCodeForEnter);
            expect(editor.getText()).toEqual(referenceText);
            return expect(editor.getCursorScreenPosition()).toEqual(referenceCursorPosition);
          });
        });
      });
    });
    describe("the gg keybinding", function() {
      beforeEach(function() {
        editor.setText(" 1abc\n 2\n3\n");
        return editor.setCursorScreenPosition([0, 2]);
      });
      describe("as a motion", function() {
        describe("in normal mode", function() {
          beforeEach(function() {
            keydown('g');
            return keydown('g');
          });
          return it("moves the cursor to the beginning of the first line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          });
        });
        describe("in linewise visual mode", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([1, 0]);
            vimState.activateVisualMode('linewise');
            keydown('g');
            return keydown('g');
          });
          it("selects to the first line in the file", function() {
            return expect(editor.getSelectedText()).toBe(" 1abc\n 2\n");
          });
          return it("moves the cursor to a specified line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
          });
        });
        return describe("in characterwise visual mode", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([1, 1]);
            vimState.activateVisualMode();
            keydown('g');
            return keydown('g');
          });
          it("selects to the first line in the file", function() {
            return expect(editor.getSelectedText()).toBe("1abc\n 2");
          });
          return it("moves the cursor to a specified line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          });
        });
      });
      return describe("as a repeated motion", function() {
        describe("in normal mode", function() {
          beforeEach(function() {
            keydown('2');
            keydown('g');
            return keydown('g');
          });
          return it("moves the cursor to a specified line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
        describe("in linewise visual motion", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([2, 0]);
            vimState.activateVisualMode('linewise');
            keydown('2');
            keydown('g');
            return keydown('g');
          });
          it("selects to a specified line", function() {
            return expect(editor.getSelectedText()).toBe(" 2\n3\n");
          });
          return it("moves the cursor to a specified line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
        return describe("in characterwise visual motion", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([2, 0]);
            vimState.activateVisualMode();
            keydown('2');
            keydown('g');
            return keydown('g');
          });
          it("selects to a first character of specified line", function() {
            return expect(editor.getSelectedText()).toBe("2\n3");
          });
          return it("moves the cursor to a specified line", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
          });
        });
      });
    });
    describe("the g_ keybinding", function() {
      beforeEach(function() {
        return editor.setText("1  \n    2  \n 3abc\n ");
      });
      describe("as a motion", function() {
        it("moves the cursor to the last nonblank character", function() {
          editor.setCursorScreenPosition([1, 0]);
          keydown('g');
          keydown('_');
          return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
        });
        return it("will move the cursor to the beginning of the line if necessary", function() {
          editor.setCursorScreenPosition([0, 2]);
          keydown('g');
          keydown('_');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor downward and outward", function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('2');
          keydown('g');
          keydown('_');
          return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
        });
      });
      return describe("as a selection", function() {
        return it("selects the current line excluding whitespace", function() {
          editor.setCursorScreenPosition([1, 2]);
          vimState.activateVisualMode();
          keydown('2');
          keydown('g');
          keydown('_');
          return expect(editor.getSelectedText()).toEqual("  2  \n 3abc");
        });
      });
    });
    describe("the G keybinding", function() {
      beforeEach(function() {
        editor.setText("1\n    2\n 3abc\n ");
        return editor.setCursorScreenPosition([0, 2]);
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return keydown('G', {
            shift: true
          });
        });
        return it("moves the cursor to the last line after whitespace", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([3, 0]);
        });
      });
      describe("as a repeated motion", function() {
        beforeEach(function() {
          keydown('2');
          return keydown('G', {
            shift: true
          });
        });
        return it("moves the cursor to a specified line", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([1, 0]);
          vimState.activateVisualMode();
          return keydown('G', {
            shift: true
          });
        });
        it("selects to the last line in the file", function() {
          return expect(editor.getSelectedText()).toBe("    2\n 3abc\n ");
        });
        return it("moves the cursor to the last line after whitespace", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([3, 1]);
        });
      });
    });
    describe("the / keybinding", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = {
          activate: jasmine.createSpy("activate")
        };
        spyOn(atom.workspace, 'getActivePane').andReturn(pane);
        editor.setText("abc\ndef\nabc\ndef\n");
        editor.setCursorBufferPosition([0, 0]);
        vimState.globalVimState.searchHistory = [];
        return vimState.globalVimState.currentSearch = {};
      });
      describe("as a motion", function() {
        it("beeps when repeating nonexistent last search", function() {
          keydown('/');
          submitNormalModeInputText('');
          expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
          return expect(atom.beep).toHaveBeenCalled();
        });
        it("moves the cursor to the specified search pattern", function() {
          keydown('/');
          submitNormalModeInputText('def');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          expect(pane.activate).toHaveBeenCalled();
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("loops back around", function() {
          editor.setCursorBufferPosition([3, 0]);
          keydown('/');
          submitNormalModeInputText('def');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("uses a valid regex as a regex", function() {
          keydown('/');
          submitNormalModeInputText('[abc]');
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("uses an invalid regex as a literal string", function() {
          editor.setText("abc\n[abc]\n");
          keydown('/');
          submitNormalModeInputText('[abc');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("uses ? as a literal string", function() {
          editor.setText("abc\n[a?c?\n");
          keydown('/');
          submitNormalModeInputText('?');
          expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([1, 4]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it('works with selection in visual mode', function() {
          editor.setText('one two three');
          keydown('v');
          keydown('/');
          submitNormalModeInputText('th');
          expect(editor.getCursorBufferPosition()).toEqual([0, 9]);
          keydown('d');
          expect(editor.getText()).toBe('hree');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it('extends selection when repeating search in visual mode', function() {
          var end, start, _ref1, _ref2;
          editor.setText('line1\nline2\nline3');
          keydown('v');
          keydown('/');
          submitNormalModeInputText('line');
          _ref1 = editor.getSelectedBufferRange(), start = _ref1.start, end = _ref1.end;
          expect(start.row).toEqual(0);
          expect(end.row).toEqual(1);
          keydown('n');
          _ref2 = editor.getSelectedBufferRange(), start = _ref2.start, end = _ref2.end;
          expect(start.row).toEqual(0);
          expect(end.row).toEqual(2);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        describe("case sensitivity", function() {
          beforeEach(function() {
            editor.setText("\nabc\nABC\n");
            editor.setCursorBufferPosition([0, 0]);
            return keydown('/');
          });
          it("works in case sensitive mode", function() {
            submitNormalModeInputText('ABC');
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            keydown('n');
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          it("works in case insensitive mode", function() {
            submitNormalModeInputText('\\cAbC');
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            keydown('n');
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          it("works in case insensitive mode wherever \\c is", function() {
            submitNormalModeInputText('AbC\\c');
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            keydown('n');
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          it("uses case insensitive search if useSmartcaseForSearch is true and searching lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            submitNormalModeInputText('abc');
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            keydown('n');
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          return it("uses case sensitive search if useSmartcaseForSearch is true and searching uppercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            submitNormalModeInputText('ABC');
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            keydown('n');
            expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
        });
        describe("repeating", function() {
          return it("does nothing with no search history", function() {
            editor.setCursorBufferPosition([0, 0]);
            keydown('n');
            expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
            expect(atom.beep).toHaveBeenCalled();
            editor.setCursorBufferPosition([1, 1]);
            keydown('n');
            expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
            return expect(atom.beep.callCount).toBe(2);
          });
        });
        describe("repeating with search history", function() {
          beforeEach(function() {
            keydown('/');
            return submitNormalModeInputText('def');
          });
          it("repeats previous search with /<enter>", function() {
            keydown('/');
            submitNormalModeInputText('');
            expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          it("repeats previous search with //", function() {
            keydown('/');
            submitNormalModeInputText('/');
            expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          describe("the n keybinding", function() {
            return it("repeats the last search", function() {
              keydown('n');
              expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
              return expect(atom.beep).not.toHaveBeenCalled();
            });
          });
          return describe("the N keybinding", function() {
            return it("repeats the last search backwards", function() {
              editor.setCursorBufferPosition([0, 0]);
              keydown('N', {
                shift: true
              });
              expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
              keydown('N', {
                shift: true
              });
              expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
              return expect(atom.beep).not.toHaveBeenCalled();
            });
          });
        });
        return describe("composing", function() {
          it("composes with operators", function() {
            keydown('d');
            keydown('/');
            submitNormalModeInputText('def');
            expect(editor.getText()).toEqual("def\nabc\ndef\n");
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          return it("repeats correctly with operators", function() {
            keydown('d');
            keydown('/');
            submitNormalModeInputText('def');
            keydown('.');
            expect(editor.getText()).toEqual("def\n");
            return expect(atom.beep).not.toHaveBeenCalled();
          });
        });
      });
      describe("when reversed as ?", function() {
        it("moves the cursor backwards to the specified search pattern", function() {
          keydown('?');
          submitNormalModeInputText('def');
          expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("accepts / as a literal search pattern", function() {
          editor.setText("abc\nd/f\nabc\nd/f\n");
          editor.setCursorBufferPosition([0, 0]);
          keydown('?');
          submitNormalModeInputText('/');
          expect(editor.getCursorBufferPosition()).toEqual([3, 1]);
          keydown('?');
          submitNormalModeInputText('/');
          expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        return describe("repeating", function() {
          beforeEach(function() {
            keydown('?');
            return submitNormalModeInputText('def');
          });
          it("repeats previous search as reversed with ?<enter>", function() {
            keydown('?');
            submitNormalModeInputText('');
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          it("repeats previous search as reversed with ??", function() {
            keydown('?');
            submitNormalModeInputText('?');
            expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
            return expect(atom.beep).not.toHaveBeenCalled();
          });
          describe('the n keybinding', function() {
            return it("repeats the last search backwards", function() {
              editor.setCursorBufferPosition([0, 0]);
              keydown('n');
              expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
              return expect(atom.beep).not.toHaveBeenCalled();
            });
          });
          return describe('the N keybinding', function() {
            return it("repeats the last search forwards", function() {
              editor.setCursorBufferPosition([0, 0]);
              keydown('N', {
                shift: true
              });
              expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
              return expect(atom.beep).not.toHaveBeenCalled();
            });
          });
        });
      });
      return describe("using search history", function() {
        var inputEditor;
        inputEditor = null;
        beforeEach(function() {
          keydown('/');
          submitNormalModeInputText('def');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          keydown('/');
          submitNormalModeInputText('abc');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          return inputEditor = editor.normalModeInputView.editorElement;
        });
        it("allows searching history in the search field", function() {
          keydown('/');
          atom.commands.dispatch(inputEditor, 'core:move-up');
          expect(inputEditor.getModel().getText()).toEqual('abc');
          atom.commands.dispatch(inputEditor, 'core:move-up');
          expect(inputEditor.getModel().getText()).toEqual('def');
          atom.commands.dispatch(inputEditor, 'core:move-up');
          expect(inputEditor.getModel().getText()).toEqual('def');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        return it("resets the search field to empty when scrolling back", function() {
          keydown('/');
          atom.commands.dispatch(inputEditor, 'core:move-up');
          expect(inputEditor.getModel().getText()).toEqual('abc');
          atom.commands.dispatch(inputEditor, 'core:move-up');
          expect(inputEditor.getModel().getText()).toEqual('def');
          atom.commands.dispatch(inputEditor, 'core:move-down');
          expect(inputEditor.getModel().getText()).toEqual('abc');
          atom.commands.dispatch(inputEditor, 'core:move-down');
          expect(inputEditor.getModel().getText()).toEqual('');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
      });
    });
    describe("the * keybinding", function() {
      beforeEach(function() {
        editor.setText("abd\n@def\nabd\ndef\n");
        return editor.setCursorBufferPosition([0, 0]);
      });
      return describe("as a motion", function() {
        it("moves cursor to next occurence of word under cursor", function() {
          keydown("*");
          return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        });
        it("repeats with the n key", function() {
          keydown("*");
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          keydown("n");
          return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        });
        it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
          editor.setText("abc\ndef\nghiabc\njkl\nabcdef");
          editor.setCursorBufferPosition([0, 0]);
          keydown("*");
          return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        });
        describe("with words that contain 'non-word' characters", function() {
          it("moves cursor to next occurence of word under cursor", function() {
            editor.setText("abc\n@def\nabc\n@def\n");
            editor.setCursorBufferPosition([1, 0]);
            keydown("*");
            return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          });
          it("doesn't move cursor unless next match has exact word ending", function() {
            editor.setText("abc\n@def\nabc\n@def1\n");
            editor.setCursorBufferPosition([1, 1]);
            keydown("*");
            return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          });
          return it("moves cursor to the start of valid word char", function() {
            editor.setText("abc\ndef\nabc\n@def\n");
            editor.setCursorBufferPosition([1, 0]);
            keydown("*");
            return expect(editor.getCursorBufferPosition()).toEqual([3, 1]);
          });
        });
        describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            editor.setText("abc\n@def\nabc\n@def\n");
            editor.setCursorBufferPosition([1, 0]);
            keydown("*");
            return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          });
        });
        describe("when cursor is not on a word", function() {
          return it("does a match with the next word", function() {
            editor.setText("abc\na  @def\n abc\n @def");
            editor.setCursorBufferPosition([1, 1]);
            keydown("*");
            return expect(editor.getCursorBufferPosition()).toEqual([3, 1]);
          });
        });
        return describe("when cursor is at EOF", function() {
          return it("doesn't try to do any match", function() {
            editor.setText("abc\n@def\nabc\n ");
            editor.setCursorBufferPosition([3, 0]);
            keydown("*");
            return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          });
        });
      });
    });
    describe("the hash keybinding", function() {
      return describe("as a motion", function() {
        it("moves cursor to previous occurence of word under cursor", function() {
          editor.setText("abc\n@def\nabc\ndef\n");
          editor.setCursorBufferPosition([2, 1]);
          keydown("#");
          return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        });
        it("repeats with n", function() {
          editor.setText("abc\n@def\nabc\ndef\nabc\n");
          editor.setCursorBufferPosition([2, 1]);
          keydown("#");
          expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
          keydown("n");
          expect(editor.getCursorBufferPosition()).toEqual([4, 0]);
          keydown("n");
          return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        });
        it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
          editor.setText("abc\ndef\nghiabc\njkl\nabcdef");
          editor.setCursorBufferPosition([0, 0]);
          keydown("#");
          return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        });
        describe("with words that containt 'non-word' characters", function() {
          it("moves cursor to next occurence of word under cursor", function() {
            editor.setText("abc\n@def\nabc\n@def\n");
            editor.setCursorBufferPosition([3, 0]);
            keydown("#");
            return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          });
          return it("moves cursor to the start of valid word char", function() {
            editor.setText("abc\n@def\nabc\ndef\n");
            editor.setCursorBufferPosition([3, 0]);
            keydown("#");
            return expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
          });
        });
        return describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            editor.setText("abc\n@def\nabc\n@def\n");
            editor.setCursorBufferPosition([1, 0]);
            keydown("*");
            return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          });
        });
      });
    });
    describe("the H keybinding", function() {
      beforeEach(function() {
        editor.setText("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n");
        editor.setCursorScreenPosition([8, 0]);
        return spyOn(editor.getLastCursor(), 'setScreenPosition');
      });
      it("moves the cursor to the first row if visible", function() {
        spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
        keydown('H', {
          shift: true
        });
        return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([0, 0]);
      });
      it("moves the cursor to the first visible row plus offset", function() {
        spyOn(editor, 'getFirstVisibleScreenRow').andReturn(2);
        keydown('H', {
          shift: true
        });
        return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([4, 0]);
      });
      return it("respects counts", function() {
        spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
        keydown('3');
        keydown('H', {
          shift: true
        });
        return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([2, 0]);
      });
    });
    describe("the L keybinding", function() {
      beforeEach(function() {
        editor.setText("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n");
        editor.setCursorScreenPosition([8, 0]);
        return spyOn(editor.getLastCursor(), 'setScreenPosition');
      });
      it("moves the cursor to the first row if visible", function() {
        spyOn(editor, 'getLastVisibleScreenRow').andReturn(10);
        keydown('L', {
          shift: true
        });
        return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([10, 0]);
      });
      it("moves the cursor to the first visible row plus offset", function() {
        spyOn(editor, 'getLastVisibleScreenRow').andReturn(6);
        keydown('L', {
          shift: true
        });
        return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([4, 0]);
      });
      return it("respects counts", function() {
        spyOn(editor, 'getLastVisibleScreenRow').andReturn(10);
        keydown('3');
        keydown('L', {
          shift: true
        });
        return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([8, 0]);
      });
    });
    describe("the M keybinding", function() {
      beforeEach(function() {
        editor.setText("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n");
        editor.setCursorScreenPosition([8, 0]);
        spyOn(editor.getLastCursor(), 'setScreenPosition');
        spyOn(editor, 'getLastVisibleScreenRow').andReturn(10);
        return spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
      });
      return it("moves the cursor to the first row if visible", function() {
        keydown('M', {
          shift: true
        });
        return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([5, 0]);
      });
    });
    describe('the mark keybindings', function() {
      beforeEach(function() {
        editor.setText('  12\n    34\n56\n');
        return editor.setCursorBufferPosition([0, 1]);
      });
      it('moves to the beginning of the line of a mark', function() {
        editor.setCursorBufferPosition([1, 1]);
        keydown('m');
        normalModeInputKeydown('a');
        editor.setCursorBufferPosition([0, 0]);
        keydown('\'');
        normalModeInputKeydown('a');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 4]);
      });
      it('moves literally to a mark', function() {
        editor.setCursorBufferPosition([1, 1]);
        keydown('m');
        normalModeInputKeydown('a');
        editor.setCursorBufferPosition([0, 0]);
        keydown('`');
        normalModeInputKeydown('a');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
      });
      it('deletes to a mark by line', function() {
        editor.setCursorBufferPosition([1, 5]);
        keydown('m');
        normalModeInputKeydown('a');
        editor.setCursorBufferPosition([0, 0]);
        keydown('d');
        keydown('\'');
        normalModeInputKeydown('a');
        return expect(editor.getText()).toEqual('56\n');
      });
      it('deletes before to a mark literally', function() {
        editor.setCursorBufferPosition([1, 5]);
        keydown('m');
        normalModeInputKeydown('a');
        editor.setCursorBufferPosition([0, 1]);
        keydown('d');
        keydown('`');
        normalModeInputKeydown('a');
        return expect(editor.getText()).toEqual(' 4\n56\n');
      });
      it('deletes after to a mark literally', function() {
        editor.setCursorBufferPosition([1, 5]);
        keydown('m');
        normalModeInputKeydown('a');
        editor.setCursorBufferPosition([2, 1]);
        keydown('d');
        keydown('`');
        normalModeInputKeydown('a');
        return expect(editor.getText()).toEqual('  12\n    36\n');
      });
      return it('moves back to previous', function() {
        editor.setCursorBufferPosition([1, 5]);
        keydown('`');
        normalModeInputKeydown('`');
        editor.setCursorBufferPosition([2, 1]);
        keydown('`');
        normalModeInputKeydown('`');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 5]);
      });
    });
    describe('the f/F keybindings', function() {
      beforeEach(function() {
        editor.setText("abcabcabcabc\n");
        return editor.setCursorScreenPosition([0, 0]);
      });
      it('moves to the first specified character it finds', function() {
        keydown('f');
        normalModeInputKeydown('c');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
      it('moves backwards to the first specified character it finds', function() {
        editor.setCursorScreenPosition([0, 2]);
        keydown('F', {
          shift: true
        });
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      });
      it('respects count forward', function() {
        keydown('2');
        keydown('f');
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
      });
      it('respects count backward', function() {
        editor.setCursorScreenPosition([0, 6]);
        keydown('2');
        keydown('F', {
          shift: true
        });
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      });
      it("doesn't move if the character specified isn't found", function() {
        keydown('f');
        normalModeInputKeydown('d');
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        keydown('1');
        keydown('0');
        keydown('f');
        normalModeInputKeydown('a');
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        keydown('1');
        keydown('1');
        keydown('f');
        normalModeInputKeydown('a');
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        editor.setCursorScreenPosition([0, 6]);
        keydown('1');
        keydown('0');
        keydown('F', {
          shift: true
        });
        normalModeInputKeydown('a');
        expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
        keydown('1');
        keydown('1');
        keydown('F', {
          shift: true
        });
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
      });
      it("composes with d", function() {
        editor.setCursorScreenPosition([0, 3]);
        keydown('d');
        keydown('2');
        keydown('f');
        normalModeInputKeydown('a');
        return expect(editor.getText()).toEqual('abcbc\n');
      });
      it("cancels c when no match found", function() {
        keydown('c');
        keydown('f');
        normalModeInputKeydown('d');
        expect(editor.getText()).toBe("abcabcabcabc\n");
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        return expect(vimState.mode).toBe("normal");
      });
      return describe('with accented characters', function() {
        var buildIMECompositionEvent, buildTextInputEvent;
        buildIMECompositionEvent = function(event, _arg) {
          var data, target, _ref1;
          _ref1 = _arg != null ? _arg : {}, data = _ref1.data, target = _ref1.target;
          event = new Event(event);
          event.data = data;
          Object.defineProperty(event, 'target', {
            get: function() {
              return target;
            }
          });
          return event;
        };
        buildTextInputEvent = function(_arg) {
          var data, event, target;
          data = _arg.data, target = _arg.target;
          event = new Event('textInput');
          event.data = data;
          Object.defineProperty(event, 'target', {
            get: function() {
              return target;
            }
          });
          return event;
        };
        beforeEach(function() {
          editor.setText("abcébcabcébc\n");
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it('works with IME composition', function() {
          var domNode, inputNode, normalModeEditor;
          keydown('f');
          normalModeEditor = editor.normalModeInputView.editorElement;
          jasmine.attachToDOM(normalModeEditor);
          domNode = normalModeEditor.component.domNode;
          inputNode = domNode.querySelector('.hidden-input');
          domNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
            target: inputNode
          }));
          domNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
            data: "´",
            target: inputNode
          }));
          expect(normalModeEditor.getModel().getText()).toEqual('´');
          domNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
            data: "é",
            target: inputNode
          }));
          domNode.dispatchEvent(buildTextInputEvent({
            data: 'é',
            target: inputNode
          }));
          return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
        });
      });
    });
    describe('the t/T keybindings', function() {
      beforeEach(function() {
        editor.setText("abcabcabcabc\n");
        return editor.setCursorScreenPosition([0, 0]);
      });
      it('moves to the character previous to the first specified character it finds', function() {
        keydown('t');
        normalModeInputKeydown('a');
        expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        keydown('t');
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        editor.setCursorScreenPosition([0, 2]);
        keydown('T', {
          shift: true
        });
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
      });
      it('respects count forward', function() {
        keydown('2');
        keydown('t');
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      });
      it('respects count backward', function() {
        editor.setCursorScreenPosition([0, 6]);
        keydown('2');
        keydown('T', {
          shift: true
        });
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
      });
      it("doesn't move if the character specified isn't found", function() {
        keydown('t');
        normalModeInputKeydown('d');
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        keydown('1');
        keydown('0');
        keydown('t');
        normalModeInputKeydown('a');
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        keydown('1');
        keydown('1');
        keydown('t');
        normalModeInputKeydown('a');
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        editor.setCursorScreenPosition([0, 6]);
        keydown('1');
        keydown('0');
        keydown('T', {
          shift: true
        });
        normalModeInputKeydown('a');
        expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
        keydown('1');
        keydown('1');
        keydown('T', {
          shift: true
        });
        normalModeInputKeydown('a');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
      });
      it("composes with d", function() {
        editor.setCursorScreenPosition([0, 3]);
        keydown('d');
        keydown('2');
        keydown('t');
        normalModeInputKeydown('b');
        return expect(editor.getText()).toBe('abcbcabc\n');
      });
      return it("selects character under cursor even when no movement happens", function() {
        editor.setCursorBufferPosition([0, 0]);
        keydown('d');
        keydown('t');
        normalModeInputKeydown('b');
        return expect(editor.getText()).toBe('bcabcabcabc\n');
      });
    });
    describe('the v keybinding', function() {
      beforeEach(function() {
        editor.setText("01\n002\n0003\n00004\n000005\n");
        return editor.setCursorScreenPosition([1, 1]);
      });
      it("selects down a line", function() {
        keydown('v');
        keydown('j');
        keydown('j');
        expect(editor.getSelectedText()).toBe("02\n0003\n00");
        return expect(editor.getSelectedBufferRange().isSingleLine()).toBeFalsy();
      });
      return it("selects right", function() {
        keydown('v');
        keydown('l');
        expect(editor.getSelectedText()).toBe("02");
        return expect(editor.getSelectedBufferRange().isSingleLine()).toBeTruthy();
      });
    });
    describe('the V keybinding', function() {
      beforeEach(function() {
        editor.setText("01\n002\n0003\n00004\n000005\n");
        return editor.setCursorScreenPosition([1, 1]);
      });
      it("selects down a line", function() {
        keydown('V', {
          shift: true
        });
        expect(editor.getSelectedBufferRange().isSingleLine()).toBeFalsy();
        keydown('j');
        keydown('j');
        expect(editor.getSelectedText()).toBe("002\n0003\n00004\n");
        return expect(editor.getSelectedBufferRange().isSingleLine()).toBeFalsy();
      });
      return it("selects up a line", function() {
        keydown('V', {
          shift: true
        });
        keydown('k');
        return expect(editor.getSelectedText()).toBe("01\n002\n");
      });
    });
    describe('the ; and , keybindings', function() {
      beforeEach(function() {
        editor.setText("abcabcabcabc\n");
        return editor.setCursorScreenPosition([0, 0]);
      });
      it("repeat f in same direction", function() {
        keydown('f');
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        keydown(';');
        expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
        keydown(';');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      });
      it("repeat F in same direction", function() {
        editor.setCursorScreenPosition([0, 10]);
        keydown('F', {
          shift: true
        });
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
        keydown(';');
        expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
        keydown(';');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
      it("repeat f in opposite direction", function() {
        editor.setCursorScreenPosition([0, 6]);
        keydown('f');
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
        keydown(',');
        expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
        keydown(',');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
      it("repeat F in opposite direction", function() {
        editor.setCursorScreenPosition([0, 4]);
        keydown('F', {
          shift: true
        });
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        keydown(',');
        expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
        keydown(',');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      });
      it("alternate repeat f in same direction and reverse", function() {
        keydown('f');
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        keydown(';');
        expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
        keydown(',');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
      it("alternate repeat F in same direction and reverse", function() {
        editor.setCursorScreenPosition([0, 10]);
        keydown('F', {
          shift: true
        });
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
        keydown(';');
        expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
        keydown(',');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      });
      it("repeat t in same direction", function() {
        keydown('t');
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
        keydown(';');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
      });
      it("repeat T in same direction", function() {
        editor.setCursorScreenPosition([0, 10]);
        keydown('T', {
          shift: true
        });
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 9]);
        keydown(';');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
      });
      it("repeat t in opposite direction first, and then reverse", function() {
        editor.setCursorScreenPosition([0, 3]);
        keydown('t');
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
        keydown(',');
        expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
        keydown(';');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
      });
      it("repeat T in opposite direction first, and then reverse", function() {
        editor.setCursorScreenPosition([0, 4]);
        keydown('T', {
          shift: true
        });
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
        keydown(',');
        expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
        keydown(';');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
      });
      it("repeat with count in same direction", function() {
        editor.setCursorScreenPosition([0, 0]);
        keydown('f');
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        keydown('2');
        keydown(';');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      });
      it("repeat with count in reverse direction", function() {
        editor.setCursorScreenPosition([0, 6]);
        keydown('f');
        normalModeInputKeydown('c');
        expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
        keydown('2');
        keydown(',');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
      return it("shares the most recent find/till command with other editors", function() {
        return helpers.getEditorElement(function(otherEditorElement) {
          var otherEditor;
          otherEditor = otherEditorElement.getModel();
          editor.setText("a baz bar\n");
          editor.setCursorScreenPosition([0, 0]);
          otherEditor.setText("foo bar baz");
          otherEditor.setCursorScreenPosition([0, 0]);
          keydown('f');
          normalModeInputKeydown('b');
          expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          expect(otherEditor.getCursorScreenPosition()).toEqual([0, 0]);
          keydown(';', {
            element: otherEditorElement
          });
          expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          expect(otherEditor.getCursorScreenPosition()).toEqual([0, 4]);
          keydown('t', {
            element: otherEditorElement
          });
          normalModeInputKeydown('r', {
            editor: otherEditor
          });
          expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          expect(otherEditor.getCursorScreenPosition()).toEqual([0, 5]);
          keydown(';');
          expect(editor.getCursorScreenPosition()).toEqual([0, 7]);
          expect(otherEditor.getCursorScreenPosition()).toEqual([0, 5]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
      });
    });
    describe('the % motion', function() {
      beforeEach(function() {
        editor.setText("( ( ) )--{ text in here; and a function call(with parameters) }\n");
        return editor.setCursorScreenPosition([0, 0]);
      });
      it('matches the correct parenthesis', function() {
        keydown('%');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
      });
      it('matches the correct brace', function() {
        editor.setCursorScreenPosition([0, 9]);
        keydown('%');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 62]);
      });
      it('composes correctly with d', function() {
        editor.setCursorScreenPosition([0, 9]);
        keydown('d');
        keydown('%');
        return expect(editor.getText()).toEqual("( ( ) )--\n");
      });
      it('moves correctly when composed with v going forward', function() {
        keydown('v');
        keydown('h');
        keydown('%');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 7]);
      });
      it('moves correctly when composed with v going backward', function() {
        editor.setCursorScreenPosition([0, 5]);
        keydown('v');
        keydown('%');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      });
      it('it moves appropriately to find the nearest matching action', function() {
        editor.setCursorScreenPosition([0, 3]);
        keydown('%');
        expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        return expect(editor.getText()).toEqual("( ( ) )--{ text in here; and a function call(with parameters) }\n");
      });
      it('it moves appropriately to find the nearest matching action', function() {
        editor.setCursorScreenPosition([0, 26]);
        keydown('%');
        expect(editor.getCursorScreenPosition()).toEqual([0, 60]);
        return expect(editor.getText()).toEqual("( ( ) )--{ text in here; and a function call(with parameters) }\n");
      });
      it("finds matches across multiple lines", function() {
        editor.setText("...(\n...)");
        editor.setCursorScreenPosition([0, 0]);
        keydown("%");
        return expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
      });
      return it("does not affect search history", function() {
        keydown('/');
        submitNormalModeInputText('func');
        expect(editor.getCursorBufferPosition()).toEqual([0, 31]);
        keydown('%');
        expect(editor.getCursorBufferPosition()).toEqual([0, 60]);
        keydown('n');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 31]);
      });
    });
    return describe("scrolling screen and keeping cursor in the same screen position", function() {
      beforeEach(function() {
        var _i, _results;
        editor.setText((function() {
          _results = [];
          for (_i = 0; _i < 80; _i++){ _results.push(_i); }
          return _results;
        }).apply(this).join("\n"));
        editor.setHeight(20 * 10);
        editor.setLineHeightInPixels(10);
        editor.setScrollTop(40 * 10);
        return editor.setCursorBufferPosition([42, 0]);
      });
      describe("the ctrl-u keybinding", function() {
        it("moves the screen up by half screen size and keeps cursor onscreen", function() {
          keydown('u', {
            ctrl: true
          });
          expect(editor.getScrollTop()).toEqual(300);
          return expect(editor.getCursorBufferPosition()).toEqual([32, 0]);
        });
        it("selects on visual mode", function() {
          editor.setCursorBufferPosition([42, 1]);
          vimState.activateVisualMode();
          keydown('u', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n"));
        });
        return it("selects on linewise mode", function() {
          vimState.activateVisualMode('linewise');
          keydown('u', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n").concat("\n"));
        });
      });
      describe("the ctrl-b keybinding", function() {
        it("moves screen up one page", function() {
          keydown('b', {
            ctrl: true
          });
          expect(editor.getScrollTop()).toEqual(200);
          return expect(editor.getCursorScreenPosition()).toEqual([22, 0]);
        });
        it("selects on visual mode", function() {
          editor.setCursorBufferPosition([42, 1]);
          vimState.activateVisualMode();
          keydown('b', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n"));
        });
        return it("selects on linewise mode", function() {
          vimState.activateVisualMode('linewise');
          keydown('b', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n").concat("\n"));
        });
      });
      describe("the ctrl-d keybinding", function() {
        it("moves the screen down by half screen size and keeps cursor onscreen", function() {
          keydown('d', {
            ctrl: true
          });
          expect(editor.getScrollTop()).toEqual(500);
          return expect(editor.getCursorBufferPosition()).toEqual([52, 0]);
        });
        it("selects on visual mode", function() {
          editor.setCursorBufferPosition([42, 1]);
          vimState.activateVisualMode();
          keydown('d', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52].join("\n").slice(1, -1));
        });
        return it("selects on linewise mode", function() {
          vimState.activateVisualMode('linewise');
          keydown('d', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52].join("\n").concat("\n"));
        });
      });
      return describe("the ctrl-f keybinding", function() {
        it("moves screen down one page", function() {
          keydown('f', {
            ctrl: true
          });
          expect(editor.getScrollTop()).toEqual(600);
          return expect(editor.getCursorScreenPosition()).toEqual([62, 0]);
        });
        it("selects on visual mode", function() {
          editor.setCursorBufferPosition([42, 1]);
          vimState.activateVisualMode();
          keydown('f', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62].join("\n").slice(1, -1));
        });
        return it("selects on linewise mode", function() {
          vimState.activateVisualMode('linewise');
          keydown('f', {
            ctrl: true
          });
          return expect(editor.getSelectedText()).toEqual([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62].join("\n").concat("\n"));
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9zcGVjL21vdGlvbnMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsT0FBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUixDQUFWLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSxpR0FBQTtBQUFBLElBQUEsT0FBb0MsRUFBcEMsRUFBQyxnQkFBRCxFQUFTLHVCQUFULEVBQXdCLGtCQUF4QixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFVBQTFCLENBQVYsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FEQSxDQUFBO2FBR0EsT0FBTyxDQUFDLGdCQUFSLENBQXlCLFNBQUMsT0FBRCxHQUFBO0FBQ3ZCLFFBQUEsYUFBQSxHQUFnQixPQUFoQixDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsYUFBYSxDQUFDLFFBQWQsQ0FBQSxDQURULENBQUE7QUFBQSxRQUVBLFFBQUEsR0FBVyxhQUFhLENBQUMsUUFGekIsQ0FBQTtBQUFBLFFBR0EsUUFBUSxDQUFDLGtCQUFULENBQUEsQ0FIQSxDQUFBO2VBSUEsUUFBUSxDQUFDLGVBQVQsQ0FBQSxFQUx1QjtNQUFBLENBQXpCLEVBSlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBYUEsT0FBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLE9BQU4sR0FBQTs7UUFBTSxVQUFRO09BQ3RCOztRQUFBLE9BQU8sQ0FBQyxVQUFXO09BQW5CO2FBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsR0FB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

//# sourceURL=/home/pjim/.atom/packages/vim-mode/spec/motions-spec.coffee
