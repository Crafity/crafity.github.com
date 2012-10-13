var http = require('http')
	, querystring = require('querystring')
	, urlParser = require('url')
	, request = require('request')
	, trustedOrigins = ['http://crafity.github.com', 'http://crafity.com', 'http://localhost:2020' ];

http.createServer(function (req, res) {
	var origin = req.headers.origin && req.headers.origin.toLowerCase();

	if (origin !== undefined && !~trustedOrigins.indexOf(origin)) {
		console.log("Untrusted request from Origin", origin, "with url", req.url);
		res.writeHead(403);
		res.end("Untrusted origin");
	} else {
		var urlParts = urlParser.parse(req.url, true)
			, query = urlParts.query
			, url = query.url;

		if (!url) {
			res.writeHead(404, {"Access-Control-Allow-Origin": req.headers.origin });
			res.end("No target url specified in the query string");
		} else {
			console.log("req.url", url);

			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					res.writeHead(200, {"Access-Control-Allow-Origin": req.headers.origin });
					res.end(body);
				}
			});
		}
	}

}).listen(2021);
