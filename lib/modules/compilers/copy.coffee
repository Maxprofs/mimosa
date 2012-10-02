module.exports = class CopyCompiler

  constructor: (config) ->
    @extensions = config.copy.extensions

  lifecycleRegistration: (config, register) ->
    register ['add','update','startupFile'], 'compile', @compile, [@extensions...]

  compile: (config, options, next) ->
    return next(false) unless options.files?.length > 0
    options.files.forEach (file) =>
      file.outputFileText = file.inputFileText

    next()