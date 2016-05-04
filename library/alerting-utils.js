module.exports = {

    /**
     * Send an alert containing the specified message via email with config which looks like:
     * {
     *   "to": "who@where.com",
     *   "from": "who@where.com",
     *   "smtp": {
     *     "host": "smtp-hostname.com",
     *     "port": 25,
     *     "secure": false,
     *     "auth": {
     *         "user": "username",
     *         "pass": "password"
     *     }
     *   }
     * }
     * @param config
     * @param subject
     * @param message
     */
    sendEmailAlert: function(config, subject, message){
        var nodemailer = require('nodemailer');
        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport(config.smtp);

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.from,
            to: config.to,
            subject: subject,
            text: message
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
        });

        transporter.close();
    },

    /**
     * Combines the list of errors to a single email and sends it
     * @param config
     * @param errors
     */
    reportErrors: function(config, errors) {
        var subject = '',
            body = '';

        if(errors.length == 0){
            return;
        }

        if(errors.length == 1) {
            subject = errors[0].name;
            body = errors[0].message;
        } else {
            subject = "Detected " + errors.length + " Issues";
            errors.forEach(function(error){
                body += error.name + " - " + error.message + "\n";
            });
        }

        this.sendEmailAlert(config, subject, body);
    }
}