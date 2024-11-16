import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";

const firebaseConfig = {
 apiKey: "AIzaSyAQBTqt2UsPr22eXnZ-zm4mMuy5ysikGVY",
 authDomain: "predict-bot-66888.firebaseapp.com",
 databaseURL: "https://predict-bot-66888-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId: "predict-bot-66888",
 storageBucket: "predict-bot-66888.firebasestorage.app",
 messagingSenderId: "621870137573",
 appId: "1:621870137573:web:74b0897b7ebccd89ae940c",
 measurementId: "G-ESRNH2DRXL"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, update };
