// utilities that spawn mimosa build processes

var exec = require('child_process').exec
  , spawn = require( 'child_process' ).spawn
  , utils = require( './utils' )
  ;

var _mimosaCommandTestWrapper = function( testOpts, runCommand ) {
  describe("", function() {
    var projectData;

    before(function(){
      projectData = utils.setupProjectData( testOpts.configFile );
      utils.cleanProject( projectData );
      utils.setupProject( projectData, testOpts.project );
    });

    after(function(){
      utils.cleanProject( projectData );
    })

    it(testOpts.testSpec, function(done){
      var cwd = process.cwd();
      process.chdir( projectData.projectDir );
      runCommand( projectData, function() {
        done();
        process.chdir(cwd);
      });
    });
  });
};

var spawnWatchTest = function( testOpts ) {
  var runCommand = function( projectData, cb ) {
    var data = ""
      , finished = false
      , mimosaProc = spawn( 'mimosa', ['watch'] );

    var killAndTest = function() {
      setTimeout( function() {
        mimosaProc.kill("SIGINT");
        testOpts.asserts( data, projectData, cb );
      }, 100);
    };

    mimosaProc.stdout.on( 'data', function ( _data ) {
      //console.log(_data)
      data += _data;
      var len = 0;
      var successes = data.match( /Success/g );
      if (successes) {
        len = successes.length;
      }

      // all the files processed, now what?
      if ( len === testOpts.fileSuccessCount && !finished) {
        if (testOpts.postWatch) {
          // post watch things need to be delayed
          // to allow build to transition to watch fully
          setTimeout( function() {
            testOpts.postWatch(projectData, killAndTest);
          }, 800);
        } else {
          killAndTest();
        }
        finished = true;
      }
    });
  };
  _mimosaCommandTestWrapper( testOpts, runCommand );
};

var spawnBuildTest = function(testOpts) {
  var runCommand = function( projectData, cb ) {
    exec( "mimosa build", function ( err, sout, serr ) {
      testOpts.asserts(sout, projectData, cb)
    });
  };
  _mimosaCommandTestWrapper( testOpts, runCommand );
};

var spawnBuildCleanTest = function( testOpts ) {
  var runCommand = function( projectData, cb ) {
    exec( "mimosa build", function ( err, sout, serr ) {
      exec( "mimosa clean", function ( err, sout, serr ) {
        testOpts.asserts(sout, projectData, cb);
      });
    });
  };
  _mimosaCommandTestWrapper( testOpts, runCommand );
};


module.exports = {
  spawnBuildTest: spawnBuildTest,
  spawnBuildCleanTest: spawnBuildCleanTest,
  spawnWatchTest: spawnWatchTest,
};