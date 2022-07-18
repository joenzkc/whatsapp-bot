import { BadRequestException, Injectable } from '@nestjs/common';
const axios = require('axios');

@Injectable()
export class WebhookService {
  /**
   * Handles the event
   */
  async handleEvents(body: any) {
    if (body) {
      console.log(body.entry[0].changes[0].value);
      console.log(body.entry[0].changes[0].value.metadata);

      if (this.isMessage(body)) {
        const message = this.parseMessage(body);
        if (this.isInteractiveResponse(message)) {
          console.log(message.interactive);
        }

        if (this.isButtonResponse(message)) {
          console.log(message.button);
        }

        const { phone_number_id, sender, sender_name, sender_number } =
          this.parseValue(body);

        const from = message.from;
        const received_text = message.text.body;

        switch (received_text) {
          case 'action':
            this.handleAction(from, phone_number_id);
            break;
          case 'button':
            this.handleButton(from, phone_number_id);
            break;
          case 'start':
            this.handleStart(phone_number_id, from, sender_name);
            break;
          default:
            this.handleDefault(phone_number_id, from);
        }

        return;
      }
    }
  }

  /**
   * Check if the event is a message event
   */
  isMessage(body: any) {
    return (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    );
  }

  /**
   * Check if the message is an interactive response
   * @param message
   * @returns
   */
  isInteractiveResponse(message: any) {
    if (message.type) {
      return message.type === 'interactive';
    }
    return false;
  }

  /**
   * Check if the message is a button response
   */
  isButtonResponse(message: any) {
    if (message.type) {
      return message.type === 'button';
    }
    return false;
  }

  /**
   * Parse the message event
   */
  parseMessage(body: any) {
    return body.entry[0].changes[0].value.messages[0];
  }

  /**
   * Parse values to get relevant information
   */
  parseValue(body: any) {
    const phone_number_id =
      body.entry[0].changes[0].value.metadata.phone_number_id;
    const sender = body.entry[0].changes[0].value.contacts[0];
    const sender_name = sender.name;
    const sender_number = sender.wa_id;
    return { phone_number_id, sender, sender_name, sender_number };
  }

  /**
   * Handler when the user types in action
   */
  async handleAction(from, phone_number_id) {
    const body = {
      messaging_product: 'whatsapp',
      to: from,
      type: 'template',
      template: {
        name: 'message_test_two',
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
      return;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * Handler for when the user types button
   */
  async handleButton(from, phone_number_id) {
    try {
      const interactive = {
        type: 'button',
        header: {
          type: 'text',
          text: 'Welcome',
        },
        body: {
          text: 'Welcome to my Chatbot. Select an option you would like',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'button-login',
                title: 'Login',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'button-forgot-password',
                title: 'Forgot Password',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'button-help',
                title: 'Help',
              },
            },
          ],
        },
      };

      await axios.post(
        `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${process.env.TOKEN}`,
        {
          messaging_product: 'whatsapp',
          to: from,
          type: 'interactive',
          interactive: interactive,
        },
      );
      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Handler for when the user types action
   */
  async handleStart(phone_number_id, sender_number, sender_name) {
    console.log('phone_number id', phone_number_id);
    console.log('token', process.env.TOKEN);
    console.log('sender_number', sender_number);
    console.log('sender_name', sender_name);
    try {
      await axios.post(
        `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${process.env.TOKEN}`,
        {
          messaging_product: 'whatsapp',
          to: sender_number,
          type: 'template',
          template: {
            name: 'testing_templates',
            language: {
              code: 'en_GB',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: 'filler',
                  },
                  {
                    type: 'text',
                    text: sender_number,
                  },
                ],
              },
            ],
          },
        },
      );
      return;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * Default case
   */
  async handleDefault(phone_number_id, from) {
    try {
      const interactive = {
        type: 'list',
        header: {
          type: 'text',
          text: 'Welcome',
        },
        body: {
          text: 'Welcome to my Chatbot. Select an option you would like',
        },
        action: {
          button: 'View Options',
          sections: [
            {
              title: 'Account',
              rows: [
                {
                  id: 'account-login',
                  title: 'Login',
                  description: 'Log into your account',
                },
                {
                  id: 'account-forgot',
                  title: 'Forgot your password',
                },
              ],
            },
            {
              title: 'Cart',
              rows: [
                {
                  id: 'cart-view',
                  title: 'View my cart',
                },
                {
                  id: 'cart-checkout',
                  title: 'Checkout',
                },
              ],
            },
          ],
        },
      };

      await axios.post(
        `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${process.env.TOKEN}`,
        {
          messaging_product: 'whatsapp',
          to: from,
          type: 'interactive',
          interactive: interactive,
        },
      );
    } catch (err) {
      throw err;
    }
  }
}
