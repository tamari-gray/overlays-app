require('dotenv').config()

const express = require('express');
const firebaseAdmin = require('firebase-admin');
const bodyParser = require('body-parser');
const app = express();

// Load Firebase service account key
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);

// Initialize Firebase Admin SDK with Realtime Database
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://predict-bot-66888-default-rtdb.asia-southeast1.firebasedatabase.app/"  // Replace with your Firebase Realtime Database URL
});

const db = firebaseAdmin.database();

app.use(bodyParser.json());

// Route to handle adding personName to Firebase Realtime Database
app.post('/startPrediction', async (req, res) => {
  console.log("Received /startPrediction request with payload:", req.body);

  const personName = req.body.personName;

  if (!personName) {
    console.error("Error: 'personName' is missing in the payload.");
    return res.status(400).json({ error: 'personName is required' });
  }

  try {
    // Storing the single prediction at the root level under 'prediction'
    const predictionRef = db.ref('prediction'); // Fixed key instead of dynamic push
    await predictionRef.set({
      person: personName,
      createdAt: firebaseAdmin.database.ServerValue.TIMESTAMP,
      winVotePercentage: null // Placeholder for winVotePercentage, to be updated later
    });

    console.log(`Started prediction for ${personName}`);
    res.status(200).json({ message: `Prediction started for ${personName}` });
  } catch (error) {
    console.error("Error adding prediction to Firebase Realtime Database:", error);
    res.status(500).json({ error: 'Failed to start prediction' });
  }
});

// Route to update the winVotePercentage for the prediction
app.post('/updatePrediction', async (req, res) => {
  console.log("Received /updatePrediction request with payload:", req.body);

  const { winVotePercentage } = req.body;

  if (typeof winVotePercentage !== 'number') {
    console.error("Error: 'winVotePercentage' is missing or invalid in the payload.");
    return res.status(400).json({ error: 'winVotePercentage is required and must be a number' });
  }

  try {
    // Updating winVotePercentage at the root level under 'prediction'
    const predictionRef = db.ref('prediction');
    await predictionRef.update({ winVotePercentage });

    console.log(`Updated winVotePercentage to ${winVotePercentage}%`);
    res.status(200).json({ message: `Win percentage updated` });
  } catch (error) {
    console.error("Error updating winVotePercentage in Firebase Realtime Database:", error);
    res.status(500).json({ error: 'Failed to update win percentage' });
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
