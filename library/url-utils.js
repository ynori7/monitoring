module.exports = {

    /**
     * Test if the given URL is available and returns a 2xx status
     * @param uri
     * @param port
     * @param callback
     */
    checkUrlExists:function (uri, port, callback) {
        return this.requestUrl(uri, port, 'HEAD', false, function(response, responseObj){
            callback((responseObj.statusCode >= 200 && responseObj.statusCode < 300), responseObj);
        })
    },

    /**
     * Request the given URL and sends the response text to the callback function
     * @param uri
     * @param port
     * @param method
     * @param auth
     * @param callback
     */
    requestUrl: function(uri, port, method, auth, callback) {
        var http = require('http'),
            url = require('url');
        var options = {
            method: method,
            host: url.parse(uri).host,
            port: port,
            path: url.parse(uri).pathname
        };

        if(auth !== false) {
            options.auth = auth.user + ":" + auth.password;
        }

        var req = http.request(options, function(response) {
            var str = '';

            //another chunk of data has been received, so append it to str
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been received, so we just print it out here
            response.on('end', function () {
                callback(str, response);
            });

            response.on('error', function() {
                callback(false, response);
            });
        });

        req.on('error', function(){
            callback(false, {
                statusCode: "Connection error",
                headers: {}
            })
        });

        req.setTimeout(6000, function(){
            req.abort(); //triggers the error handler
        }.bind(req));

        req.end();
    }
}

