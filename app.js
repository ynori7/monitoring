var async = require('async'),
    fs = require('fs'),
    urlUtils = require('./library/url-utils'),
    alertingUtils = require('./library/alerting-utils'),
    rabbitmqUtils = require('./library/rabbitmq-utils');

require('console-stamp')(console, '[yyyy-dd-mm HH:MM:ss]');

var config = {},
    loggedIssues = [];


config.endpoints = JSON.parse( fs.readFileSync('config/endpoints.json') );
config.rabbitmq = JSON.parse( fs.readFileSync('config/rabbitmq.json') );
config.emailAlerts = JSON.parse( fs.readFileSync('config/email-alerts.json') );


async.parallel([
    /**
     * Test the endpoints to see if they're up
     */
    function(callback){
        async.forEach(config.endpoints, function(element, cb){
            urlUtils.checkUrlExists(element.url, element.port, function(exists, response){
                var statusMessage = "";
                if(exists){
                    statusMessage = element.name + ": OK";
                } else {
                    statusMessage = element.name + ": Error";
                    loggedIssues.push({name: element.name + " Error", message: "There was an error while checking " + element.url + "\nStatusCode: " +
                        response.statusCode + "\nHeaders:\n" +
                        JSON.stringify(response.headers) + "\n"});
                }

                console.log("[" + Date.now() + "] " + statusMessage);
                cb()
            });
        }, callback);
    },
    /**
     * Test the RabbitMQ queues to see if they're full
     */
    function(callback){
        async.forEach(config.rabbitmq, function(element, cb){
            urlUtils.requestUrl(element.host + rabbitmqUtils.apiQueuesRoute, element.port, 'GET', element.auth, function(response, responseObj) {
                async.forEach(element.queues, function(queue, cb2){
                    rabbitmqUtils.checkQueueSize(response, queue.name, function(queueSize) {
                        var statusMessage = element.name + " " + queue.name + ": OK";
                        if(queueSize > queue.threshold) {
                            statusMessage = element.name + " " + queue.name + ": Warning";
                            loggedIssues.push({name: element.name + " Warning", message: "The queue " + queue.name + " is too full.\n"});
                        }

                        console.log("[" + Date.now() + "] " + statusMessage);
                        cb2();
                    });
                }, cb);
            });
        }, callback);
    }
], function(){
    alertingUtils.reportErrors(config.emailAlerts, loggedIssues);
});
