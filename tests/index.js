var fs = require('fs');

var App = function (httpServer, expressServer, sessionParser, request, response) {
	this._init(httpServer, expressServer, sessionParser, request, response);
};
App.prototype = {
	_httpServer: null,
	_expressServer: null,
	_init: function (httpServer, expressServer, sessionParser, request, response) {
		this._httpServer = httpServer;
		this._expressServer = expressServer;
		this._sessionParser = sessionParser;
	},
	httpRequestHandler: function (request, response, callback) {
		this._completeWholeRequestInfo(request, function (requestInfo) {
			var path = this._getPathWithoutQueryString(request.url);
			if (request.query && request.query.file) {
				(new TestingFile(request.query.file)).Process(function (content) {
					response.send(content);
					callback();
				});
			} else {
				this._getIndexContent(function(content){
					response.send(content);
					callback();
				});
			}
		}.bind(this));
	},
	_getIndexContent: function (cb) {
		fs.readdir(__dirname, function (err, items) {
			var content = '<!DOCTYPE HTML><html lang="en-US"><head><meta charset="UTF-8" /><title>Testing files</title></head><body><h1>Testing files</h1>',
				item = '';
			for (var i = 0, l = items.length; i < l; i += 1) {
				item = items[i];
				if (!item.toLowerCase().match(/\.html$/g)) continue;
				if (i > 0) content += '<br />';
				content += '<a href="/?file=' + item + '">' + item + '</a>';
			}
			content += '</body></html>';
			cb(content);
		});
	},
	_getPathWithoutQueryString: function (rawPath) {
		var questionMarkPos = rawPath.indexOf('?');
		if (questionMarkPos > -1) {
			return rawPath.substr(0, questionMarkPos);
		}
		return rawPath;
	},
	_completeWholeRequestInfo: function (request, callback) {
        var reqInfo = {
            url: request.url,
            method: request.method,
            headers: request.headers,
            statusCode: request.statusCode,
            textBody: ''
        };
        var bodyArr = [];
        request.on('error', function (err) {
            console.error(err);
        }).on('data', function (chunk) {
            bodyArr.push(chunk);
        }).on('end', function () {
            reqInfo.textBody = Buffer.concat(bodyArr).toString();
            reqInfo.request = request;
            callback(reqInfo);
        }.bind(this));
    }
};

var TestingFile = function (fileName) {
	this._currentDir = __dirname.replace(/\\/g, '/') + '/';
	this._fullPath = this._currentDir + fileName;
	this._content = '';
	this._beginPos = [0, 0];
	this._endPos = [0, 0];
};
TestingFile.prototype = {
	Process: function (cb) {
		this._cb = cb;
		this._checkIfFileExists(function () {
			this._loadFileContent(function (content) {
				this._processReplacements();
			}.bind(this));
		}.bind(this));
	},
	_checkIfFileExists: function (cb) {
		fs.stat(this._fullPath, function (err, stats) {
			if (err) {
				this._cb("File '" + this._fullPath + "' doesn't exist.");
			} else {
				cb();
			}
		}.bind(this));
	},
	_loadFileContent: function (cb) {
		fs.readFile(this._fullPath, 'utf8', function (err, data) {
			if (err) {
				this._cb("File '" + this._fullPath + "' is not possible to read.");
			} else {
				this._content = data;
				cb();
			}
		}.bind(this));
	},
	_processReplacements: function () {
		var beginPos = 0,
			endPos = 0,
			filePath = '';
		beginPos = this._content.indexOf('#script:');
		if (beginPos > -1) {
			this._beginPos = [beginPos, beginPos + 8];
			beginPos += 8;
			endPos = this._content.indexOf('#', beginPos + 8);
			if (endPos == -1) {
				return this._cb(this._content);
			} else {
				this._endPos = [endPos, endPos + 1];
				filePath = this._content.substr(beginPos, endPos - beginPos);
				return this._processReplacement(filePath, function () {
					this._processReplacements();
				}.bind(this));
			}
		}
		beginPos = this._content.indexOf('#style:');
		if (beginPos > -1) {
			this._beginPos = [beginPos, beginPos + 7];
			beginPos += 7;
			endPos = this._content.indexOf('#', beginPos + 7);
			if (endPos == -1) {
				return this._cb(this._content);
			} else {
				this._endPos = [endPos, endPos + 1];
				filePath = this._content.substr(beginPos, endPos - beginPos);
				return this._processReplacement(filePath, function () {
					this._processReplacements();
				}.bind(this));
			}
		}
		return this._cb(this._content);
	},
	_processReplacement: function (filePath, cb) {
		fs.readFile(this._currentDir + filePath, 'utf8', function (err, data) {
			if (err) {
				this._cb("File '" + this._currentDir + filePath + "' is not possible to read.");
			} else {
				this._content = this._content.substr(0, this._beginPos[0]) 
					+ data 
					+ this._content.substr(this._endPos[1]);
				cb();
			}
		}.bind(this));
	}
};

module.exports = App;