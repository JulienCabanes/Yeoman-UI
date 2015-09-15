var yeoman = require('yeoman-environment');
var events = require('events');
var diff = require('diff');
var _ = require('lodash-node');
var striptags = require('striptags');
var Autolinker = require('autolinker');
var Convert = require('ansi-to-html');
var convert = new Convert();

var SocketAdapter = module.exports = function(socket) {
  this.prompt = function(questions, done) {
    var answers = {};
    var i = 0;

    askNextQuestion();

    function askNextQuestion() {
      var question = questions[i];
      i++;

      if(!question) {
        return done(answers);
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
      question.message = convert.toHtml(question.message);
      question.message = striptags(question.message);
      question.message = Autolinker.link(question.message);
      
      // TODO : message: (String|Function)
      // TODO : default: (String|Number|Array|Function)
      // TODO : choices: (Array|Function)
      //        Values can also be a Separator
      
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
  };

  this.diff = function(oldVersion, newVersion) {
    var differences = diff.diffLines(oldVersion, newVersion);
    socket.emit('yo:diff', differences);
  };

  this.log = function(str) {
    str = convert.toHtml(str + '');
    str = str.replace(/style="color:#FFF"/gi, 'style="color:#000"');
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