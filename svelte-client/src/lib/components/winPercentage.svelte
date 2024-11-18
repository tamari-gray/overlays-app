<script>
  import { onMount } from 'svelte';
  import { onValue, ref, database } from '../firebase'; // Import Firebase setup

  let winPercent = 0; // Default values
  let name = '';
  let losePercent = 0;

  onMount(() => {
    const predictionRef = ref(database, 'prediction'); // Reference to 'prediction' in Firebase

    onValue(predictionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val(); // Get the raw data
        const prediction = data; // Extract the prediction object

        // Check for both winVotePercentage and loseVotePercentage
        if (
          prediction.winVotePercentage == null || 
          prediction.loseVotePercentage == null
        ) {
          winPercent = 50;
          losePercent = 50;
        } else {
          // Use the values from Firebase
          winPercent = prediction.winVotePercentage;
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
 .win-percentage {
   width: 1440px;
   height: 270px;
   display: flex;
   position: relative;
   font-size: 36px;
 }

 .win {
   background-color: red;
   width: var(--win-width);
   display: flex;
   justify-content: center;
   align-items: center;
   color: white;
   font-weight: bold;
   text-align: center;
   padding: 10px;
 }

 .lose {
   background-color: blue;
   width: calc(100% - var(--win-width));
   display: flex;
   justify-content: center;
   align-items: center;
   color: white;
   font-weight: bold;
   text-align: center;
   padding: 10px;
 }

 /* Hide text when percentage is below 15% */
 .low-percentage .label-text {
   display: none;
 }

 .low-percentage .percentage-text {
   font-weight: bold;
 }
</style>

<div class="win-percentage" style="--win-width: {winPercent}%">
  {#if winPercent === 100}
    <!-- Only show the win bar when winPercent is 100 -->
    <div class="win">
      <span class="label-text">100% voted {name} wins</span>
    </div>
  {:else if losePercent === 100}
    <!-- Only show the lose bar when losePercent is 100 -->
    <div class="lose">
      <span class="label-text">100% voted {name} loses</span>
    </div>
  {:else}
    <!-- Normal rendering when neither percentage is 100 -->
    <div class="win {winPercent < 15 ? 'low-percentage' : ''}">
      <span class="label-text">
        {winPercent >= 15 ? `${winPercent}% voted ${name} wins` : ''}
      </span>
      <span class="percentage-text">
        {winPercent < 15 ? `${winPercent}%` : ''}
      </span>
    </div>
    <div class="lose {losePercent < 15 ? 'low-percentage' : ''}">
      <span class="label-text">
        {losePercent >= 15 ? `${losePercent}% voted ${name} loses` : ''}
      </span>
      <span class="percentage-text">
        {losePercent < 15 ? `${losePercent}%` : ''}
      </span>
    </div>
  {/if}
</div>

