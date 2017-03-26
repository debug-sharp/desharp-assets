/*
 * This simply download the latest version of Google Closure Compiller (*.jar)
 * and store detected java path into temporary file.
 */
 

	
console.log(
	"\n\n" + 
	'Desharp - javascripts builder' + "\n" + 
	'============================='
);

const fs = require('fs');
const path = require('path');
const download = require('download');
const javaHome = require('find-java-home');
const targetDirRel = 'dev-tools/bin/compiler';

download(
	'http://dl.google.com/closure-compiler/compiler-latest.zip', 
	'dev-tools/bin/compiler',
	{extract: true}
).then((emptyObj, require, module, file, dir) => {
	var compillerDirFullPath = __dirname + path.sep + targetDirRel;
	var dirItems = fs.readdirSync(compillerDirFullPath, {});
	var dirItemExt = '';
	var dirItemFullPath = '';
	
	// let on filesystem from extracted google closure compiller zip file only JAR application
	for (var i = 0, l = dirItems.length; i < l; i += 1) {
		dirItemFullPath = compillerDirFullPath + path.sep + dirItems[i];
		dirItemExt = path.extname(dirItems[i]).toLowerCase();
		if (dirItemExt == '.jar') {
			var renameResult = fs.renameSync(dirItemFullPath, compillerDirFullPath + path.sep + 'compiler.jar');
		} else {
			try {
				fs.unlinkSync(dirItemFullPath);
			} catch (e) {}
		}
	}
	
	console.log(
		"\n\n" + 'Google Closure Compiler successfully downloaded and installed in:' + "\n" + 
		"\t" + '"' + __dirname + '/dev-tools/bin/compiler/compiler.jar' + "\n"
	);
	
	// check if java is installed
	javaHome(function(err, home) {
		if (err) {
			console.log(
				'Java path not found. Please add java path manualy as string into:' + "\n" + 
				"\t" + '"' + __dirname + '/dev-tools/bin/java-home.json' + '"',
				err
			);
		} else {
			console.log(
				'Java path found and stored in:' + "\n" + 
				"\t" + '"' + __dirname + '/dev-tools/bin/java-home.json' + '"'
			);
			fs.writeFileSync(__dirname + '/dev-tools/bin/java-home.json', '"'+home+'"');
		}
		
		console.log(
			"\n\n" + 'Now you are free to remove, change or add any javascript into "./src" directory' + "\n" + 
			'and build it by build scripts in "./dev-tools" directory (build.sh or build.cmd).' + "\n" + 
			'Watch configuration in "./dev-tools/build.js".' + "\n\n"
		);
	});

});