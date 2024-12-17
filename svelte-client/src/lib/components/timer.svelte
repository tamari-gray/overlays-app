<script>
 import { onMount } from 'svelte';
 import { writable } from 'svelte/store';
 import { initializeApp } from 'firebase/app';
 import { database, ref, onValue } from '../firebase'; // Adjust path if needed


 // Create a writable store for the timer
 const timer = writable(0);

 // Function to subscribe to the Timer value in Firestore
 const subscribeToTimer = () => {
   // Replace 'timers' and 'your_document_id' with your Firestore collection and document ID
   const timerDoc = doc(db, "timers", "your_document_id");

   return onSnapshot(timerDoc, (docSnapshot) => {
     if (docSnapshot.exists()) {
       const data = docSnapshot.data();
       timer.set(data.Timer || 0);
     } else {
       console.log("No such document!");
     }
   }, (error) => {
     console.error("Error fetching Timer:", error);
   });
 };

 onMount(() => {
   const unsubscribe = subscribeToTimer();
   return () => unsubscribe();
 });
</script>

<style>
 .timer-text {
   font-family: 'Burbank Big Condensed';
   color: white;
   font-size: 48px; /* Adjust as needed */
   -webkit-text-stroke: 2px #2b96fd; /* Stroke for WebKit browsers */
   /* text-stroke: 2px #2b96fd; Future-proofing for other browsers */
   /* Optional: Add text-shadow for better stroke effect across browsers */
   text-shadow:
     -1px -1px 0 #2b96fd,
     1px -1px 0 #2b96fd,
     -1px 1px 0 #2b96fd,
     1px 1px 0 #2b96fd;
 }
</style>

<div class="timer-text">
 {$timer}
</div>
