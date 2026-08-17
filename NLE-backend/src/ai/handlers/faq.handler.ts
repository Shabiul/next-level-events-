const FAQ = {
    contact: "You can contact us at +91-XXXXXXXXXX.",
    email: "support@thedecorparty.com",
    location: "Bengaluru, Karnataka.",
    hours: "We are available from 9 AM to 9 PM.",
};

export class FAQHandler {

    async handle(message: string) {

        const text = message.toLowerCase();

        if (text.includes("contact"))
            return { answer: FAQ.contact, products: [] };

        if (text.includes("email"))
            return { answer: FAQ.email, products: [] };

        if (text.includes("location") || text.includes("address"))
            return { answer: FAQ.location, products: [] };

        if (text.includes("hour") || text.includes("time"))
            return { answer: FAQ.hours, products: [] };

        return {
            answer:
                "Could you please tell me what you'd like to know about The Decor Party?",
            products: [],
        };
    }

}

export const faqHandler = new FAQHandler();