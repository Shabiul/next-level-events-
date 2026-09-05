export class BookingHandler {

    async handle(message: string, sessionId: string) {

        return {

            answer:
                "Booking support is under development. Soon you'll be able to track and manage your bookings here.",

            products: []

        };

    }

}

export const bookingHandler = new BookingHandler();