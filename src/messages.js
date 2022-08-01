const { Wit } = require('node-wit');
const IncomingWebhook = require('@slack/client').IncomingWebhook;

const client = new Wit({
    accessToken: process.env.WIT_SERVER_ACCESS_TOKEN
});
const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

async function handleMessageCreated(event) {
    const { channel, text } = event;

    try {
        const data = await client.message(text);

        if (Object.keys(data.entities).length > 0 && data.entities.local_search_query) {
            // There were some entities that we found
            const { local_search_query } = data.entities;

            const attachments = local_search_query.map((loc) => {
                return {
                    text: `<https://maps.google.com?q=${loc.value}|${loc.value}>`,
                };
            });

            attachments.push({
                text: '(This was generated using an Incoming Webhook, completely by-passing Oauth, so it\'s kinda cheating 😉 )'
            });

            webhook.send({
                text: 'We found the following locations mentioned:',
                attachments,
            }), function (err, res) {
                if (err) {
                    console.error(err);
                }
            };
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    handleMessageCreated,
};