module.exports = {

    apiQueuesRoute: "/api/queues",

    /**
     * Returns the current size of the specified queue
     * @param data
     * @param queue
     * @param callback
     */
    checkQueueSize: function (data, queue, callback) {
        if(typeof data == 'string'){
            data = JSON.parse(data);
        }

        data.forEach(function(element){
            if(element.name == queue) {
                return callback(element.messages);
            }
        });
    }

}

