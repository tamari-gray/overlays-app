<script lang="ts">
 // Props or additional logic can go here if needed in the future
</script>

<style>
 @font-face {
   font-family: 'Burbank Big Condensed';
   src: url('/path-to-font/BurbankBigCondensed-Bold.otf') format('opentype'); /* Replace with your font path */
   font-weight: bold;
   font-style: normal;
 }

 .overlay-textbox {
   position: absolute;
   top: 50%;
   left: 80%;
   transform: translate(-50%, -50%) skewX(-10deg); /* Lean right */
   background-color: rgba(0, 0, 0, 0.801); /* Grey/black background with slight transparency */
   color: white; /* White font color */
   padding: 20px 30px; /* Increased horizontal padding */
   text-align: center; /* Center-align the text */
   font-size: 36px; /* Easy-to-read font size */
   font-family: 'Burbank Big Condensed'; /* Updated font */
   line-height: 1.3; /* Reduced space between lines */
   width: 500px; /* Wider box */
   position: relative; /* Required for pseudo-element positioning */
   z-index: 2;

 }

 .overlay-textbox span {
   display: inline-block;
   transform: skewX(10deg); /* Counteracts the skew so the text remains straight */
 }

 /* Triangle at the bottom-right */
 .overlay-textbox::after {
   content: '';
   position: absolute;
   bottom: -50px; /* Position triangle below the box */
   right: 50px; /* Position triangle towards the right */
   z-index: 5;
   width: 0;
   height: 0;
   border-left: 20px solid transparent; /* Triangle shape - left side */
   border-right: 20px solid transparent; /* Triangle shape - right side */
   border-top: 50px solid rgba(0, 0, 0, 0.8); /* Triangle shape - top side, matches the box color */
 }
</style>

<div class="overlay-textbox">
 <span>
   🎯 Top 3 predictors win V-Bucks! <br />
   Vote on 1v1 predicts. <br />
   1 point for every correct vote!
 </span>
</div>
