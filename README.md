Monitoring
==========

With this simple tool you can easily monitor the uptime of your various API endpoints and your RabbitMQ queues.

Just add your various API endpoints to config/endpoints.json and your RabbitMQ queues to config/rabbitmq.json and then you can set the monitoring to run as a cronjob:

```
*/15 * * * * cd /path/to/monitoring; /usr/bin/nodejs app.js >> /var/log/monitoring/logs.log
```