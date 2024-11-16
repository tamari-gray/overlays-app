<script>
 import { onMount } from 'svelte';
 import { database, ref, onValue } from '../firebase';

 let winPercent = 0;  // Default values
 let name = '';
 let losePercent = 0;

 // Fetch data from Firebase
 onMount(() => {
   const predictionRef = ref(database, 'prediction');  // Reference to 'prediction' in Firebase

   onValue(predictionRef, (snapshot) => {
     if (snapshot.exists()) {
       const data = snapshot.val();  // Get the raw data
       const prediction = data;  // Get the first item in the 'prediction' object
       console.log(data);

       // Map data to your variables
       winPercent = prediction.winVotePercentage;  // Convert to percentage
       name = prediction.person; // Get the person name
       losePercent = 100 - winPercent; // Calculate the lose percentage
     } else {
       // Handle the case where data doesn't exist
       console.log("No prediction data found");
     }
   });
 });
</script>

<style>
 .win-percentage {
   width: 1440px;
   height: 270px;
   display: flex;
 }

 .win {
   background-color:#FE4242;
   width: var(--win-width);
   display: flex;
   justify-content: center;
   align-items: center;
   color: white;
   font-weight: bold;
   text-align: center;
 }

 .lose {
   background-color:#31AEF3;
   width: calc(100% - var(--win-width));
   display: flex;
   justify-content: center;
   align-items: center;
   color: white;
   font-weight: bold;
   text-align: center;
 }

 .label {
   font-size: 36px;
   font-weight: bold;
 }
</style>

<div class="win-percentage" style="--win-width: {winPercent}%">
 <div class="win">
   <span class="label">{winPercent}% voted {name} wins</span>
 </div>
 <div class="lose">
   <span class="label">{losePercent}% voted {name} loses</span>
 </div>
</div>
