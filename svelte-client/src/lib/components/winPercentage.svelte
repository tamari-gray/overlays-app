<script>
 let winPercent = 60; // Set the win percentage here (can be dynamic)
 let name = 'Jenna'; // Static variable for the name
 let losePercent = 100 - winPercent; // Calculate the lose percentage
</script>

<style>
 .win-percentage {
   width: 1440px;
   height: 270px; /* Set a fixed height for the component */
   display: flex;
   font-family: 'Burbank Big Condensed', sans-serif;
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
