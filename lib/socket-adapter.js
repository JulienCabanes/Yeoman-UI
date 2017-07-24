var yeoman = require('yeoman-environment');
var events = require('events');
var diff = require('diff');
var _ = require('lodash-node');
var striptags = require('striptags');
var Autolinker = require('autolinker');
var Convert = require('ansi-to-html');
var convert = new Convert();
var Promise = require('promise');

var SocketAdapter = module.exports = function(socket) {
  this.prompt = function(questions, done) {
    var promise = new Promise(function (fulfill, reject){
      var answers = {};
      var i = 0;

      askNextQuestion();

      function askNextQuestion() {
        if(i >= questions.length) {
          return fulfill(answers);
        } else {
          var question = questions[i];
          i++;
        }

        question = _.defaults(_.clone(question), {
          validate: function () { return true; },
          filter: function (val) { return val; },
          when: function () { return true; }
        });

        if(!question.when(answers)) {
          return askNextQuestion();
        }

        return prompt(question);
      }

      function prompt(question) {
        if (typeof question.message == "function") {
          question.message = question.message();
        }

        // TODO : default: (String|Number|Array|Function)
        // TODO : choices: (Array|Function)
        //        Values can also be a Separator

        question.message = convert.toHtml(question.message);
        question.message = striptags(question.message);
        question.message = Autolinker.link(question.message);

        socket.emit('yo:prompt', question);

        socket.once('yo:prompt', onPrompt);

        function onPrompt(data) {
          if(data.question.name !== question.name) {
            question.error = 'Mauvaise question...';
            return prompt(question);
          }

          if(question.validate(data.answer) !== true) {
            question.error = question.validate(data.answer) || 'Mauvaise réponse...';
            question.default = data.answer;
            return prompt(question);
          }

          answers[question.name] = question.filter(data.answer);
          return askNextQuestion();
        }
      }
    }.bind(this));

    if (done) {
      promise.then(done);
    }

    return promise;
  };

  this.diff = function(oldVersion, newVersion) {
    var differences = diff.diffLines(oldVersion, newVersion);
    socket.emit('yo:diff', differences);
  };

  this.log = function(str) {
    str = convert.toHtml(str + '');
    str = str.replace(/style="color:#000"/gi, 'style="color:#FFF"');
    socket.emit('yo:log', str);
  };

  _.extend(this.log, events.EventEmitter.prototype);

  ['write', 'writeln', 'ok', 'error', 'skip', 'force', 'create', 'invoke', 'conflict', 'identical', 'info', 'table']
  .forEach(function (methodName) {
    this.log[methodName] = function(str) {
      socket.emit('yo:log', convert.toHtml(str + ''));
    };
  }, this);
};
