// Copyright © 2014 Intel Corporation. All rights reserved.
// Use  of this  source  code is  governed by  an Apache v2
// license that can be found in the LICENSE-APACHE-V2 file.

var Path = require('path');

var ShellJS = require("shelljs");

var CommandParser = require("./CommandParser");
var IllegalAccessException = require("./util/exceptions").IllegalAccessException;
var InvalidPathException = require("./util/exceptions").InvalidPathException;

/**
 * Create Application object.
 * If packageId is not passed, the current working directory needs to be right
 * inside the project, so that the directory name is the packageId.
 * @constructor
 * @param {String} cwd Current working directory
 * @param {String} [packageId] Package ID in com.example.foo format, or null
 * @throws {InvalidPathException} If packageId not passed and current working dir not a project.
 * @protected
 */
function Application(cwd, packageId) {

    // cwd must be absolute and exist.
    if (!cwd ||
        Path.resolve(cwd) != Path.normalize(cwd)) {
        throw new InvalidPathException("Path not absolute: " + cwd);
    }
    if (!ShellJS.test("-d", cwd)) {
        throw new InvalidPathException("Path does not exist: " + cwd);        
    }
    
    // PackageId is only passed when a new project is created.
    if (packageId) {

        this._packageId = CommandParser.validatePackageId(packageId, this.output);

        initMembers.call(this, cwd);

        // Check that dir not already exists
        if (ShellJS.test("-d", this._rootPath)) {
            throw new InvalidPathException("Failed to create project, path already exists: " + this._rootPath);        
        }

        // Initialise project skeleton
        ShellJS.mkdir(this._rootPath);
        ShellJS.mkdir(this._appPath);
        ShellJS.mkdir(this._logPath);
        ShellJS.mkdir(this._pkgPath);
        ShellJS.mkdir(this._prjPath);

    } else {
        
        // Get packageId from current directory
        var basename = Path.basename(cwd);
        this._packageId = CommandParser.validatePackageId(basename, this.output);
        if (!this._packageId) {
            throw new InvalidPathException("Path does not seem to be a project toplevel: " + cwd);                    
        }

        initMembers.call(this, Path.dirname(cwd));

    }

    // Check all paths exist.
    if (!ShellJS.test("-d", this._rootPath)) {
        throw new InvalidPathException("Failed to load, invalid path: " + this._rootPath);        
    }
    if (!ShellJS.test("-d", this._appPath)) {
        throw new InvalidPathException("Failed to load, invalid path: " + this._appPath);        
    }
    if (!ShellJS.test("-d", this._logPath)) {
        throw new InvalidPathException("Failed to load, invalid path: " + this._logPath);        
    }
    if (!ShellJS.test("-d", this._pkgPath)) {
        throw new InvalidPathException("Failed to load, invalid path: " + this._pkgPath);        
    }
    if (!ShellJS.test("-d", this._prjPath)) {
        throw new InvalidPathException("Failed to load, invalid path: " + this._prjPath);        
    }
}

function initMembers(basePath) {

    this._rootPath = basePath + Path.sep + this._packageId;        

    this._appPath = this._rootPath + Path.sep + "app";

    this._logPath = this._rootPath + Path.sep + "log";

    this._pkgPath = this._rootPath + Path.sep + "pkg";

    this._prjPath = this._rootPath + Path.sep + "prj";
}

/**
 * Package identifier in reverse host format, i.e. com.example.foo.
 * @member {String} packageId
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "packageId", {
                      get: function() {
                                return this._packageId;
                           }
                      });

/**
 * Absolute path to directory where the html application is located.
 * @member {String} appPath
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "appPath", {
                      get: function() {
                                return this._appPath;
                            }
                      });

/**
 * Absolute path to directory where the build logfiles located.
 * @member {String} logPath
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "logPath", {
                      get: function() {
                                return this._logPath;
                            }
                      });

/**
 * Absolute path to directory where the built packaged need to be placed.
 * @member {String} pkgPath
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "pkgPath", {
                      get: function() {
                                return this._pkgPath;
                            }
                      });

/**
 * Absolute path to directory where the platform-specific project is located.
 * @member {String} prjPath
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "prjPath", {
                      get: function() {
                                return this._prjPath;
                            }
                      });

/**
 * Absolute path to the project's root directory.
 * @member {String} rootPath
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "rootPath", {
                      get: function() {
                                return this._rootPath;
                            }
                      });

/**
 * Path where downloads are cached. Might be null when not used.
 * @member {String} downloadsCachePath
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "downloadsCachePath", {
                      get: function() {
                                return process.env.CROSSWALK_APP_TOOLS_DOWNLOAD_DIR;
                            }
                      });

/**
 * Read-only {@link Config} object.
 * @member {Config} config
 * @throws {IllegalAccessException} If writing this property is attempted.
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "config", {
                      get: function() {
                                return require("./Config").getInstance();
                           },
                      set: function(config) {
                                throw new IllegalAccessException("Attempting to write read-only property Application.config");
                           }
                      });

/**
 * Read-only {@link TerminalOutput} object.
 * @member {TerminalOutput} output
 * @throws {IllegalAccessException} If writing this property is attempted.
 * @instance
 * @memberOf Application
 */
Object.defineProperty(Application.prototype, "output", {
                      get: function() {
                                return require("./TerminalOutput").getInstance();
                           },
                      set: function(output) {
                                throw new IllegalAccessException("Attempting to write read-only property Application.output");
                           }
                      });

module.exports = Application;
