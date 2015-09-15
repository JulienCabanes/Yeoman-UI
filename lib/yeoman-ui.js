var yeoman = require('yeoman-environment');
var SocketAdapter = require('./socket-adapter');
var fs = require('fs');
var path = require('path');
var _ = require('lodash-node');
var rimraf = require('rimraf');
var archiver = require('archiver');
var uuid = require('node-uuid');
var shortid = require('shortid');

module.exports = {
  init: init,
  run: run,
  list: list,
  adapter: SocketAdapter
};

function init(socket, onRun, onEnd) {
  // Clean dist folder
  var distFolderPath = path.join(__dirname, '../', 'dist/');
  if(fs.existsSync(distFolderPath)) {
    rimraf.sync(path.join(distFolderPath, '*'));
    rimraf.sync(path.join(distFolderPath, '.*'));
  } else {
    fs.mkdirSync(distFolderPath);
  }

  socket.on('yo:run', function(data) {
    // TODO : move dist preparation
    var distId = shortid.generate();
    var distName = data.namespace.replace(/(:|\/)/gi, '-');

    var distIdPath = path.join(distFolderPath, distId);
    var distPath = path.join(distFolderPath, distId, distName);
    fs.mkdirSync(distIdPath);
    fs.mkdirSync(distPath);
    fs.writeFileSync(path.join(distPath, '.yo-rc.json'), '{"id": "' + distId + '", "date": "' + new Date() + '"}', {
      flag: 'w'
    });

    // Temporary workaround about this : https://github.com/yeoman/generator/issues/861
    try {
      process.chdir(distPath);
      // console.log('New process.cwd: ' + process.cwd());
    }
    catch (err) {
      console.log('chdir: ' + err);
    }

    run(data.namespace, socket, {}, {
      'skip-install': true
    }, function() {

      // TODO : move dist archive
      var archive = archiver.create('zip', {});
      var output = fs.createWriteStream(path.join(distFolderPath, distId, distName + '.zip'));

      output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

        socket.emit('yo:end', {
          distId: distId,
          distName: distName
        });
      });

      archive.on('error', function(err) {
        socket.emit('yo:end', {
          distId: null
        });
        throw err;
      });

      archive.pipe(output);
      archive.directory(distPath, false);
      archive.finalize();
    });
  });

  socket.on('yo:list', function() {
    list(function(generatorList) {
      socket.emit('yo:list', generatorList);
    });
  });
}

function run(namespace, socket, envOptions, runOptions, cb) {
  var env = yeoman.createEnv([], envOptions, new SocketAdapter(socket));
  env.lookup(function () {
    env.run(namespace, runOptions, cb);
  });
}

function list(cb) {
  var env = yeoman.createEnv();
  env.lookup(function () {
    var generators = env.getGeneratorsMeta();
    var generatorsObj = {};
    var generatorsList = [];

    _.forEach(generators, function(gen) {
      var namespace = gen.namespace.split(':');
      var name = namespace[0];
      var subname = namespace[1];
      var generator = {
        name: name,
        namespace: namespace.join(':'),
        resolved: gen.resolved
      };

      if(!generatorsObj.hasOwnProperty(name)) {
        generator.subgenerators = [];
        generatorsObj[name] = generator;
        generatorsList.push(generator);
      }

      generatorsObj[name].subgenerators.push({
        name: subname,
        namespace: namespace.join(':')
      });
    });

    return cb(generatorsList);
  });
}
