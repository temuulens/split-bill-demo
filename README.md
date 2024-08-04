# Split Bill App

## Overview
This Split Bill App is a web application designed to simplify the process of splitting bills among friends or groups. It allows users to upload receipts, extract item information, assign items to individuals, and calculate the amount each person owes.

## Technologies Used
- Frontend: React.js, Tailwind CSS
- Backend: Firebase (Realtime Database, Cloud Functions)
- Image Processing: GPT4-mini model for OCR (Optical Character Recognition)
- Hosting: Firebase Hosting (client), Vercel (frontend)

## Project Structure
The project is divided into three main parts:
1. `client-frontend/`: React-based client application
2. `firebase-backend/`: Firebase backend including Cloud Functions
3. `frontend/`: Main React frontend application

## Main Components

### Client Frontend (`client-frontend/`)
- `DraggableItemsPage.js`: Handles the drag-and-drop interface for assigning items to users.

### Firebase Backend (`firebase-backend/`)
- `functions/index.js`: Contains Firebase Cloud Functions for backend operations.

### Main Frontend (`frontend/`)
- `App.js`: The main React component that handles image upload, data processing, and displays the results.
- `components/`: UI components using Tailwind CSS.

## How It Works
1. Users upload a receipt image.
2. The image is processed using OCR to extract item information.
3. Users can edit the extracted data and assign items to individuals.
4. The app calculates the total amount each person owes.
5. A QR code is generated for easy sharing of the split bill.

## Building and Running the App

### Prerequisites
- Node.js and npm installed
- Firebase CLI installed (for backend deployment)

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the development server.

### Client Frontend Setup
1. Navigate to the `client-frontend/` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the development server.

### Backend Setup
1. Navigate to the `firebase-backend/` directory.
2. Run `npm install` in the `functions/` subdirectory.
3. Use `firebase deploy` to deploy the Firebase functions.

### Deployment
- Frontend: Deploy to Vercel or your preferred hosting platform.
- Client Frontend: Deploy to Firebase Hosting using `firebase deploy`.
- Backend: Automatically deployed when using `firebase deploy`.

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.
