// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const firebaseAdmin = require('firebase-admin');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json()); // Alternatively, use express.json()

// Load Firebase service account key
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error('Failed to parse SERVICE_ACCOUNT_JSON:', error);
  process.exit(1); // Exit the application if there's an error
}

// Initialize Firebase Admin SDK with Realtime Database
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL || "https://predict-bot-66888-default-rtdb.asia-southeast1.firebasedatabase.app/"  // Replace with your Firebase Realtime Database URL
});

const db = firebaseAdmin.database();

// Variable to hold the timer interval to prevent multiple timers
let timerInterval = null;

// Route to handle adding personName to Firebase Realtime Database and start timer
app.post('/startPrediction', async (req, res) => {
  console.log("Received /startPrediction request with payload:", req.body);

  const personName = req.body.personName;

  if (!personName) {
    console.error("Error: 'personName' is missing in the payload.");
    return res.status(400).json({ error: 'personName is required' });
  }

  try {
    // If a timer is already running, prevent starting another one
    if (timerInterval) {
      console.error("Error: A prediction timer is already running.");
      return res.status(400).json({ error: 'A prediction is already in progress.' });
    }

    // Storing the single prediction at the root level under 'prediction'
    const predictionRef = db.ref('prediction'); // Fixed key instead of dynamic push
    await predictionRef.set({
      person: personName,
      createdAt: firebaseAdmin.database.ServerValue.TIMESTAMP,
      winVotePercentage: null, // Placeholder for winVotePercentage, to be updated later
      timer: 30 // Initialize timer with 30 seconds
    });

    console.log(`Started prediction for ${personName}`);
    res.status(200).json({ message: `Prediction started for ${personName}` });

    // Start a 30-second countdown timer
    let timeLeft = 30; // seconds

    timerInterval = setInterval(async () => {
      timeLeft -= 1;
      if (timeLeft >= 0) {
        try {
          await predictionRef.update({ timer: timeLeft });
          console.log(`Timer updated: ${timeLeft} seconds remaining`);
        } catch (error) {
          console.error("Error updating timer in Firebase Realtime Database:", error);
          // Optionally, clear the interval if there's an error
          clearInterval(timerInterval);
          timerInterval = null;
        }
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log("Timer completed");
        // Optionally, perform actions when the timer completes
        // For example, finalize the prediction or notify users
      }
    }, 1000); // Update every second

  } catch (error) {
    console.error("Error adding prediction to Firebase Realtime Database:", error);
    res.status(500).json({ error: 'Failed to start prediction' });
  }
});

// Route to update the winVotePercentage for the prediction
app.post('/updatePrediction', async (req, res) => {
  console.log("Received /updatePrediction request with payload:", req.body);

  const { winVotePercentage, loseVotePercentage } = req.body;

  // Validate payload
  if (typeof winVotePercentage !== 'number' || typeof loseVotePercentage !== 'number') {
    console.error("Error: 'winVotePercentage' or 'loseVotePercentage' is missing or invalid in the payload.");
    return res.status(400).json({
      error: "'winVotePercentage' and 'loseVotePercentage' are required and must be numbers",
    });
  }

  try {
    // Reference to the 'prediction' node in Firebase
    const predictionRef = db.ref('prediction');

    // Update both percentages
    await predictionRef.update({
      winVotePercentage,
      loseVotePercentage,
    });

    console.log(
      `Updated winVotePercentage to ${winVotePercentage}% and loseVotePercentage to ${loseVotePercentage}%`
    );
    res.status(200).json({ message: `Win and lose percentages updated` });
  } catch (error) {
    console.error("Error updating percentages in Firebase Realtime Database:", error);
    res.status(500).json({ error: 'Failed to update percentages' });
  }
});

app.post('/leaderboard', async (req, res) => {
  console.log("Received leaderboard data:", req.body);

  const leaderboard = req.body.leaderboard;  // This is the array sent from the client

  if (!Array.isArray(leaderboard)) {
    return res.status(400).json({ error: 'Leaderboard data is required and must be an array' });
  }

  try {
    // Save the leaderboard to Firebase Realtime Database
    const leaderboardRef = db.ref('leaderboard');  // Set the node where the leaderboard will be stored
    await leaderboardRef.set(leaderboard);

    console.log("Leaderboard data successfully added to Firebase");

    // Send a response indicating success
    res.status(200).json({ message: 'Leaderboard saved successfully' });
  } catch (error) {
    console.error("Error saving leaderboard to Firebase:", error);
    res.status(500).json({ error: 'Failed to save leaderboard' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
