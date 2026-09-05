export class GreetingHandler {

    async handle(_message: string) {

        return {

            answer:
                "Hello 👋 Welcome to The Decor Party! How can I help you plan your event today?",

            products: []

        };

    }

}

export const greetingHandler = new GreetingHandler();