require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { handleMessageCreated } = require('./messages');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/webhooks', function (req, res) {
    const { token, type, challenge } = req.body;

    /**
     * This is used to verify that you have the correct access to this url
     * from Slack's point of view
     */
    if (type === 'url_verification') {
        if (token === process.env.SLACK_VERIFICATION_TOKEN) {
            res.status(200).send({
                challenge,
            });
        } else {
            res.status(403).send({
                reason: 'Invalid token',
            });
        }
    } else if (type === 'event_callback') {
        const { event } = req.body;

        if (event.type) {
            handleMessageCreated(event);
        }

        res.status(200).send({});
    }
});

app.listen(3000, function () {
    console.log('Slack Bot Location Example is listening on port 3000');
});