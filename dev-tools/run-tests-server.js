var WebDevServer = require("web-dev-server");
var devServerInstance = (new WebDevServer())
	.SetDocumentRoot(__dirname + '/../tests') // required
	// .SetPort(80)             // optional, 8000 by default
	.Run();