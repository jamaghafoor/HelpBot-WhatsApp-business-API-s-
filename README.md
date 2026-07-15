# HelpBot - WhatsApp Business API

HelpBot is a mobile application built with React Native and a Node.js/Express backend that integrates with the WhatsApp Business API via Twilio. Its purpose is to provide an automated support/chatbot experience over WhatsApp.

## How it works
- **Frontend**: A React Native application for users/admins to interact with the bot or view data.
- **Backend**: A Node.js and Express server that handles webhooks from Twilio, communicates with the MongoDB database using Mongoose, and sends/receives messages through the WhatsApp Business API.

## Environment Variables

The backend requires certain environment variables to function correctly. A `.env.example` file is provided in the `backend` directory. 

Create a `.env` file in the `backend/` directory with the following keys:

```env
PORT=5001
URI=your_mongodb_connection_string
TWILLIO_ACCOUNT_SID=your_twilio_account_sid
TWILLIO_AUTH_TOKEN=your_twilio_auth_token
TWILLIO_SENDER_NUMBER=your_twilio_sender_number
```

- `PORT`: The port on which the backend server will run (default is 5001).
- `URI`: MongoDB connection string.
- `TWILLIO_ACCOUNT_SID`: Your Twilio Account SID.
- `TWILLIO_AUTH_TOKEN`: Your Twilio Auth Token.
- `TWILLIO_SENDER_NUMBER`: The Twilio WhatsApp sender number (e.g., `whatsapp:+14155238886`).

## Running the Project

### Prerequisites
- Node.js (>=20)
- Yarn or npm
- MongoDB instance (local or Atlas)
- Twilio account with WhatsApp Sandbox or Business API enabled

### 1. Start the Backend Server
Navigate to the `backend` directory, install dependencies, and start the server:

```sh
cd backend
npm install
npm run dev # or npm start
```

### 2. Start the React Native App
Open a new terminal window at the root of the project, install dependencies, and run the app:

```sh
# Install dependencies
yarn install # or npm install

# Start Metro bundler
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios
```

*(Note: For iOS, you may need to run `cd ios && pod install` first)*
