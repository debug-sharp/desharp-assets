require('./bin/string.js');
var fs = require('fs'),
	path = require('path'),
	execSync = require('child_process').execSync;
	
/* configuration **************************************************************************/


// base MvcCoreForm javascript object name, it's filename and filed definitions directory
var sourceDir = '../src/';
var targetDir = '../../';

// for development:
var minimalize = true;
var advancedOptimizations = true;
var prettyPrint = false;

// java path for google closure compiller:
// if you have java in %path% variable - let javaPath as empty string: var javaPath = '';
// if not - complete javaPath variable including java.exe with standard slashes - not backslashes

// get java path stored by install script
var javaPath = fs.readFileSync(
	__dirname + path.sep + 'bin' + path.sep + 'java-home.json', 
	{encoding: 'utf-8', flag: 'r'}
).toString().trim('"');

var tmpSrcFile = 'tmp.src.js';
var tmpMinFile = 'tmp.min.js';
var buildDataFile = 'build-data.json';


/******************************************************************************************/

var currentDir = __dirname.replace(/\\/g, '/') + '/';
var isWin = process.platform.toLowerCase().indexOf('win') > -1;
sourceDir = path.resolve(sourceDir).replace(/\\/g, '/');
targetDir = path.resolve(targetDir).replace(/\\/g, '/');

var packJsWithGoogleClosure = function (sourceCode) {
	var result = '',
		compileCmdFileName = '',
		compileCmdFullPath = '',
		tmpSourceFileFullPath = currentDir + tmpSrcFile,
		tmpTargetFileFullPath = currentDir + tmpMinFile,
		cmd = "cd \"%javaPath%\"\njava -jar bin/compiler/compiler.jar --compilation_level %optimalizationMode% --env BROWSER --formatting PRETTY_PRINT --js \"%inputFile%\" --hide_warnings_for \"%inputFile%\" --js_output_file \"%outputFile%\" --output_wrapper \"window.%output%\""
			.replace(/%optimalizationMode%/g, advancedOptimizations ? 'ADVANCED_OPTIMIZATIONS' : 'SIMPLE_OPTIMIZATIONS')
			.replace(/%inputFile%/g, tmpSourceFileFullPath)
			.replace(/%outputFile%/g, tmpTargetFileFullPath)
			.replace('%javaPath%', javaPath)
			.replace('bin/compiler/compiler.jar', '"' + currentDir + 'bin/compiler/compiler.jar"'),
		opts = {
			//cwd: '', // Current working directory of the child process
			input: '', // The value which will be passed as stdin to the spawned process supplying this value will override stdio[0]
			stdio: [], // Child's stdio configuration. (Default: 'pipe') stderr by default will be output to the parent process' stderr unless stdio is specified
			//env: {}, // Environment key-value pairs
			//shell: '', // Shell to execute the command with (Default: '/bin/sh' on UNIX, 'cmd.exe' on Windows, The shell should understand the -c switch on UNIX or /s /c on Windows. On Windows, command line parsing should be compatible with cmd.exe.)
			//uid: 0, // Sets the user identity of the process. (See setuid(2).)
			//gid: 0, // Sets the group identity of the process. (See setgid(2).)
			//timeout: undefined, // In milliseconds the maximum amount of time the process is allowed to run. (Default: undefined)
			//killSignal: 'SIGTERM', // The signal value to be used when the spawned process will be killed. (Default: 'SIGTERM')
			//maxBuffer: 0 // largest amount of data (in bytes) allowed on stdout or stderr - if exceeded child process is killed encoding
		};
	if (!prettyPrint) cmd = cmd.replace(' --formatting PRETTY_PRINT', '');
	if (isWin) {
		cmd = cmd.replace('%output%', '%%output%%');
		compileCmdFileName = 'compile.bat';
	} else {
		compileCmdFileName = 'compile.sh';
	}
	compileCmdFullPath = currentDir + compileCmdFileName;

	if (fs.existsSync(tmpSourceFileFullPath)) fs.unlinkSync(tmpSourceFileFullPath);
	if (fs.existsSync(tmpTargetFileFullPath)) fs.unlinkSync(tmpTargetFileFullPath);
	fs.writeFileSync(tmpSourceFileFullPath, sourceCode);
	
	if (fs.existsSync(compileCmdFullPath)) fs.unlinkSync(compileCmdFullPath);
	fs.writeFileSync(compileCmdFullPath, cmd);
	
	execSync(compileCmdFileName, opts);
	
	fs.unlinkSync(compileCmdFileName);
	fs.unlinkSync(tmpSourceFileFullPath);
	
	result = fs.readFileSync(tmpTargetFileFullPath, 'utf8');
	fs.unlinkSync(tmpTargetFileFullPath);
	
	return result;
};
var packJsWithEval = function (code) {
	var sourceParts = 'function\\(|this|var |return|\\\\'.split('|');
	var targetParts = '#%@`~'.split('');
	var codeBegin = '(function(a,b,c){a.map(function(d,e){c=c.replace(new RegExp(d,\'g\'),b[e])});new Function(c)()})(\'#%@`~\'.split(\'\'),\'function(|this|var |return|\\\\\'.split(\'|\'),\'';
	var codeEnd = "');";
	var r;
	code = code.replace(/[\r\n]/g,'');
	for (var i = 0, l = sourceParts.length; i < l; i += 1) {
		r = new RegExp(sourceParts[i], 'g');
		code = code.replace(r, targetParts[i]);
	}
	code = codeBegin + code + codeEnd;
	return code;
};
var buildSourceFiles = function (fileNames) {
	var fileName = '',
		fileExt = '',
		code = '';
	for (var i = 0, l = fileNames.length; i < l; i += 1) {

		fileName = fileNames[i];
		fileExt = path.extname(fileName).toLowerCase();
		code = fs.readFileSync(sourceDir + '/' + fileName, 'utf8');

		if (fileExt == '.js') {
			if (minimalize) {
				code = packJsWithGoogleClosure(code);
				code = packJsWithEval(code); // another 11% shorter but read comment bellow
			}
			// If you encode all higher characters in your source code into \uXXXX JSON string
			// and if you dont't use any characters in source code like: '#%@`~ 
			// Then javascript result code after all packing is defined only by characters 
			// with encoding indexes from 32 to 126 - by top most compatible characters (https://cs.wikipedia.org/wiki/ASCII)
			// and then you can use the source code as HTML page encoding compatible for any page encoding.
		} else if (fileExt == '.css') {
			code = code.replace(/[\r\n]/g, '');
		}

		fs.writeFileSync(targetDir + '/' + fileName, code);
	}
};
var loadBuildData = function () {
	var result = {
			settings: [minimalize ? 1 : 0, advancedOptimizations ? 1 : 0, prettyPrint ? 1 : 0],
			files: {}
		},
		fileStats = {},
		fullPath = currentDir + '/' + buildDataFile,
		rawData = '';
	try {
		rawData = fs.readFileSync(fullPath, 'utf8');
		if (rawData) {
			result = JSON.parse(rawData);
		}
	} catch (e) {}
	return result;
};
var getChangedSourceFilesAndNewBuildData = function (buildData) {
	var fileNames = fs.readdirSync(sourceDir),
		fullPath = '',
		fileName = '',
		fileExt = '',
		fileStats = {},
		result = [],
		currentSettings = [minimalize ? 1 : 0, advancedOptimizations ? 1 : 0, prettyPrint ? 1 : 0],
		settingsChanged = false;
	if (currentSettings.join(',') !== buildData.settings.join(',')) {
		settingsChanged = true;
		buildData.settings = currentSettings;
	}
	for (var i = 0, l = fileNames.length; i < l; i += 1) {
		fileName = fileNames[i];
		fileExt = path.extname(fileName).toLowerCase();
		if (fileExt != '.js' && fileExt != '.css') continue;
		fullPath = sourceDir + '/' + fileName;
		fileStats = fs.statSync(fullPath);
		previousBuildDate = typeof (buildData.files[fileName]) != 'undefined' ? buildData.files[fileName] : null;
		fileStatsMtimeSecs = Math.round(fileStats.mtime.getTime() / 1000);
		if (fileStatsMtimeSecs > previousBuildDate || !previousBuildDate || settingsChanged) {
			result.push(fileName);
		}
		buildData.files[fileName] = fileStatsMtimeSecs;
	}
	return [result, buildData];
};
var buildChangedSourceFiles = function () {
	var buildData = loadBuildData();
	var filesChangedAndBuildData = getChangedSourceFilesAndNewBuildData(buildData);
	changedFiles = filesChangedAndBuildData[0];
	buildData = filesChangedAndBuildData[1];
	fs.writeFileSync(currentDir + '/' + buildDataFile, JSON.stringify(buildData));
	if (changedFiles.length > 0) {
		buildSourceFiles(changedFiles);
		return true;
	}
	return false;
}

if (buildChangedSourceFiles()) {
	if (minimalize) {
		console.log("Javascript and css source files minimalized.");
	} else {
		console.log("Javascript and css source files copied.");
	}
} else {
	console.log("No source files changed.");
}