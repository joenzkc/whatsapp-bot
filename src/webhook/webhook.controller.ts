import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
const axios = require('axios');

@Controller('webhook')
export class WebhookController {
  /**
   * Facebook will call this API to verify the webhook
   *
   * Learn more at https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
   * @param mode
   * @param challenge
   * @param token
   * @returns
   */
  @Get('/webhook')
  async verify(
    @Query('hub.mode') mode: String,
    @Query('hub.challenge') challenge: String,
    @Query('hub.verify_token') token: String,
  ) {
    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('WEBHOOK VERIFIED');
        return challenge;
      } else {
        throw new BadRequestException('VERIFICATION FAILED');
      }
    }
  }

  @Post('/webhook')
  async handleEvents(@Body() body: any) {
    if (body) {
      console.log(body.entry[0].changes[0].value);
      console.log(body.entry[0].changes[0].value.metadata);

      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const phone_number_id =
          body.entry[0].changes[0].value.metadata.phone_number_id;
        const sender = body.entry[0].changes[0].value.contacts[0];
        const sender_id = sender.wa_id;
        const sender_name = sender.profile.name;
        const reply_message = `Hi ${sender_name}, your phone number is ${sender_id}!`;
        // console.log(reply_message);
        const from = message.from;
        const received_text = message.text.body;
        // console.log(`Received: ${received_text}`);
        const full_message =
          reply_message + 'The message you sent me was: ' + received_text;
        console.log(received_text);

        if (received_text === 'start') {
          const body = {
            messaging_product: 'whatsapp',
            to: from,
            type: 'template',
            template: {
              name: 'message_template',
              language: {
                code: 'en_GB',
              },
            },
          };

          try {
            await axios.post(
              `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${process.env.TOKEN}`,
              body,
            );
          } catch (err) {
            console.log(err);
            throw err;
          }
        } else {
          try {
            await axios.post(
              `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${process.env.TOKEN}`,
              {
                messaging_product: 'whatsapp',
                to: from,
                text: { body: `echo: ${received_text}` },
              },
            );
          } catch (err) {
            throw err;
          }
        }
        return 'Sent message';
      } else {
        console.log('Bad command');
        throw new BadRequestException('Unknown command!');
      }
    }
  }
}
