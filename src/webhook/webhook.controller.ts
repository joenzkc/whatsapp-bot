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
    console.log(body.entry[0].changes[0]);
    const sender = body.entry[0].changes[0].value.contacts[0];
    const sender_id = sender.wa_id;
    const sender_name = sender.profile.name;
    const reply_message = `Hi ${sender_name}, your phone number is ${sender_id}!`;
    console.log(reply_message);
    const message = body.entry[0].changes[0].value.messages[0];
    const received_text = message.text.body;
    console.log(`Received: ${received_text}`);
  }
}
