# What is Yeoman UI?
If you don't know about it yet,[Yeoman](http://yeoman.io/) is a scaffolding tool for web developpers. It provides a generator ecosystem , you can usually run those generators with the `yo` CLI command.

Yeoman UI is **a work in progress** which allows you to access this ecosystem through a very light web app instead of the CLI. To tell the truth, I like CLI and I started this project not for making a CLI alternative but as need for a bigger project.

## Installation
```
# First install the app
npm install && bower install

# Then run it
node index.js

# or with nodemon...
nodemon
```

Then you should go to http://localhost:3000/

## How does it work?
Technically, Yeoman made this rather easy thanks to [its great documentation](http://yeoman.io/authoring/integrating-yeoman.html) and the [adapter](https://github.com/yeoman/environment/blob/master/lib/adapter.js) [pattern](https://en.wikipedia.org/wiki/Adapter_pattern). All the scaffolding part happens on the server side through Yeoman's API, not a shell execution. The client side is only doing the prompt interface which transit via WebSocket.

*For now*, once the project is scaffolded in a dist folder, it is compressed as a zip archive and send to the client. Also *for now*, no dependency (npm nor bower) is installed as npm should run on the final host system. Ideally, bower could be run but Yeoman doesn't expose distinct API between them.
