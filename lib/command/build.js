var Cleaner, Watcher, build, configurer, logger, register,
  _this = this;

logger = require('logmimosa');

configurer = require('../util/configurer');

Watcher = require('../util/watcher');

Cleaner = require('../util/cleaner');

build = function(opts, foo, bar, baz, what) {
  if (opts.debug) {
    logger.setDebug();
    process.env.DEBUG = true;
  }
  logger.info("Beginning build");
  opts.build = true;
  return configurer(opts, function(config, modules) {
    var doBuild;
    doBuild = function() {
      config.isClean = false;
      return new Watcher(config, modules, false, function() {
        logger.success("Finished build");
        return process.exit(0);
      });
    };
    config.isClean = true;
    return new Cleaner(config, modules, doBuild);
  });
};

register = function(program, callback) {
  return program.command('build').description("make a single pass through assets, compile them, and optionally package them").option("-o, --optimize", "run r.js optimization after building").option("-m, --minify", "minify each asset as it is compiled using uglify").option("-p, --package", "use modules that perform packaging").option("-i --install", "use modules that perform installation").option("-P, --profile <profileName>", "select a mimosa profile").option("-D, --debug", "run in debug mode").action(callback).on('--help', function() {
    logger.green('  The build command will make a single pass through your assets and bulid any that need building');
    logger.green('  and then exit.');
    logger.blue('\n    $ mimosa build\n');
    logger.green('  Pass an \'optimize\' flag and Mimosa will use requirejs to optimize your assets and provide you');
    logger.green('  with single files for the named requirejs modules. ');
    logger.blue('\n    $ mimosa build --optimize');
    logger.blue('    $ mimosa build -o\n');
    logger.green('  Pass an \'minify\' flag and Mimosa will use uglify to minify/compress your assets when they are compiled.');
    logger.green('  You can provide exclude, files you do not want to minify, in the mimosa-config.  If you run \'minify\' ');
    logger.green('  and \'optimize\' at the same time, optimize will not run the uglify portion of its processing which occurs as');
    logger.green('  a separate step after everything has compiled and does not allow control of what gets uglified. Use \'optimize\'');
    logger.green('  and \'minify\' together if you need to control which files get mangled by uglify (because sometimes uglify');
    logger.green('  can break them) but you still want everything together in a single file.');
    logger.blue('\n    $ mimosa watch --minify');
    logger.blue('    $ mimosa watch -m\n');
    logger.green('  Pass a \'package\' flag if you have installed a module (like mimosa-web-package) that is capable of');
    logger.green('  executing packaging functionality for you after the building of assets is complete.');
    logger.blue('\n    $ mimosa build --package');
    logger.blue('    $ mimosa build -p\n');
    logger.green('  Pass a \'install\' flag if you have installed a module that is capable of executing');
    logger.green('  installation functionality for you after the building/packaging of assets is complete.');
    logger.blue('\n    $ mimosa build --package');
    logger.blue('    $ mimosa build -p\n');
    logger.green('  Pass a \'profile\' flag and the name of a Mimosa profile to run with mimosa config overrides from a profile.');
    logger.blue('\n    $ mimosa build --profile build');
    return logger.blue('    $ mimosa build -P build');
  });
};

module.exports = function(program) {
  return register(program, build);
};
