(function() {
  module.exports = {
    statusBar: null,
    activate: function() {
      return this.statusBar = new (require('./status-bar'))();
    },
    deactivate: function() {
      return this.statusBar.destroy();
    },
    config: {
      toggles: {
        type: 'object',
        order: 1,
        properties: {
          cursorBlink: {
            title: 'Cursor Blink',
            description: 'Should the cursor blink when the terminal is active?',
            type: 'boolean',
            "default": true
          },
          autoClose: {
            title: 'Close Terminal on Exit',
            description: 'Should the terminal close if the shell exits?',
            type: 'boolean',
            "default": false
          }
        }
      },
      core: {
        type: 'object',
        order: 2,
        properties: {
          autoRunCommand: {
            title: 'Auto Run Command',
            description: 'Command to run on terminal initialization.',
            type: 'string',
            "default": ''
          },
          scrollback: {
            title: 'Scroll Back',
            description: 'How many lines of history should be kept?',
            type: 'integer',
            "default": 1000
          },
          shell: {
            title: 'Shell Override',
            description: 'Override the default shell instance to launch.',
            type: 'string',
            "default": (function() {
              var path;
              if (process.platform === 'win32') {
                path = require('path');
                return path.resolve(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
              } else {
                return process.env.SHELL;
              }
            })()
          },
          shellArguments: {
            title: 'Shell Arguments',
            description: 'Specify some arguments to use when launching the shell.',
            type: 'string',
            "default": ''
          },
          workingDirectory: {
            title: 'Working Directory',
            description: 'Which directory should be the present working directory when a new terminal is made?',
            type: 'string',
            "default": 'Project',
            "enum": ['Home', 'Project', 'Active File']
          }
        }
      },
      style: {
        type: 'object',
        order: 3,
        properties: {
          animationSpeed: {
            title: 'Animation Speed',
            description: 'How fast should the window animate?',
            type: 'number',
            "default": '1',
            minimum: '0',
            maximum: '100'
          },
          fontFamily: {
            title: 'Font Family',
            description: 'Override the editor\'s default font family. **You must use a [monospaced font](https://en.wikipedia.org/wiki/List_of_typefaces#Monospace)!**',
            type: 'string',
            "default": 'monospace'
          },
          fontSize: {
            title: 'Font Size',
            description: 'Override the editor\'s default font size.',
            type: 'integer',
            "default": (function() {
              return atom.config.get('editor.fontSize');
            })(),
            minimum: 1,
            maximum: 100
          },
          defaultPanelHeight: {
            title: 'Default Panel Height',
            description: 'Default height of a terminal panel.',
            type: 'integer',
            "default": 300,
            minimum: 0
          },
          theme: {
            title: 'Theme',
            description: 'Select a theme for the terminal.',
            type: 'string',
            "default": 'standard',
            "enum": ['standard', 'inverse', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solid-colors']
          }
        }
      },
      colors: {
        type: 'object',
        order: 4,
        properties: {
          red: {
            title: 'Red',
            description: 'Red color used for status icon.',
            type: 'color',
            "default": 'red'
          },
          orange: {
            title: 'Orange',
            description: 'Orange color used for status icon.',
            type: 'color',
            "default": 'orange'
          },
          yellow: {
            title: 'Yellow',
            description: 'Yellow color used for status icon.',
            type: 'color',
            "default": 'yellow'
          },
          green: {
            title: 'Green',
            description: 'Green color used for status icon.',
            type: 'color',
            "default": 'green'
          },
          blue: {
            title: 'Blue',
            description: 'Blue color used for status icon.',
            type: 'color',
            "default": 'blue'
          },
          purple: {
            title: 'Purple',
            description: 'Purple color used for status icon.',
            type: 'color',
            "default": 'purple'
          },
          pink: {
            title: 'Pink',
            description: 'Pink color used for status icon.',
            type: 'color',
            "default": 'hotpink'
          },
          cyan: {
            title: 'Cyan',
            description: 'Cyan color used for status icon.',
            type: 'color',
            "default": 'cyan'
          },
          magenta: {
            title: 'Magenta',
            description: 'Magenta color used for status icon.',
            type: 'color',
            "default": 'magenta'
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvcGppbS8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi90ZXJtaW5hbC1wbHVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxTQUFBLEVBQVcsSUFBWDtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsQ0FBQyxPQUFBLENBQVEsY0FBUixDQUFELENBQUEsQ0FBQSxFQURUO0lBQUEsQ0FGVjtBQUFBLElBS0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFBLEVBRFU7SUFBQSxDQUxaO0FBQUEsSUFRQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLEtBQUEsRUFBTyxDQURQO0FBQUEsUUFFQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLFdBQUEsRUFDRTtBQUFBLFlBQUEsS0FBQSxFQUFPLGNBQVA7QUFBQSxZQUNBLFdBQUEsRUFBYSxzREFEYjtBQUFBLFlBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxZQUdBLFNBQUEsRUFBUyxJQUhUO1dBREY7QUFBQSxVQUtBLFNBQUEsRUFDRTtBQUFBLFlBQUEsS0FBQSxFQUFPLHdCQUFQO0FBQUEsWUFDQSxXQUFBLEVBQWEsK0NBRGI7QUFBQSxZQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsWUFHQSxTQUFBLEVBQVMsS0FIVDtXQU5GO1NBSEY7T0FERjtBQUFBLE1BY0EsSUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsS0FBQSxFQUFPLENBRFA7QUFBQSxRQUVBLFVBQUEsRUFDRTtBQUFBLFVBQUEsY0FB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

//# sourceURL=/home/pjim/.atom/packages/terminal-plus/lib/terminal-plus.coffee
