<script>
 import { onMount } from 'svelte';
 import { onValue, ref, database } from '../firebase'; // Import Firebase setup

 let losePercent = 0; // Default value
 let name = '';

 onMount(() => {
   const predictionRef = ref(database, 'prediction'); // Reference to 'prediction' in Firebase

   onValue(predictionRef, (snapshot) => {
     if (snapshot.exists()) {
       const data = snapshot.val(); // Get the raw data
       const prediction = data; // Extract the prediction object


       // Check for winVotePercentage
       if (prediction.loseVotePercentage == null) {
         losePercent = 50;
       } else {
         // Use the value from Firebase
         losePercent = prediction.loseVotePercentage;
       }
       name = prediction.person || ''; // Use an empty string as fallback for name
     } else {
       console.log("No prediction data found");
     }
   });
 });
</script>

<style>


 /* Make the entire window's background transparent */
 :global(html, body) {
   background: transparent;
   margin: 0;
   padding: 0;
   height: 100%;
   width: 100%;
 }

 /* Container to center content */
 .container {
   display: flex;
   justify-content: center;
   align-items: center;
   height: 100vh; /* Full viewport height */
   width: 100vw;  /* Full viewport width */
   overflow: hidden; /* Prevent scrolling */
 }

 .lose-percent {
   font-family: 'black';
   font-size: 128px; /* Adjust the size as needed */
   font-weight: bold;
   text-align: center;
   color: #fff; /* Example color */
   margin: 20px;
   background: transparent; /* Ensure background is transparent */
 }

</style>

<div class="container">
 <div class="lose-percent">
   {losePercent}% voted <br />
   {name} loses!
 </div>
</div>
