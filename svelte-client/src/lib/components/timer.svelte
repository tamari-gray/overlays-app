<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { database } from '../firebase'; // Ensure this path is correct
  import { ref, onValue } from 'firebase/database';

  // Create a writable store for the timer
  const timer = writable(0);

  // Function to subscribe to the 'prediction/timer' value in Realtime Database
  const subscribeToTimer = () => {
    const timerRef = ref(database, 'prediction/timer');

    // Listen for changes to the timer value
    const unsubscribe = onValue(timerRef, (snapshot) => {
      if (snapshot.exists()) {
        const currentTime = snapshot.val();
        timer.set(currentTime);
      } else {
        console.log("No timer data available");
        timer.set(0); // Reset timer if no data exists
      }
    }, (error) => {
      console.error("Error fetching timer data:", error);
    });

    return unsubscribe;
  };

  onMount(() => {
    const unsubscribe = subscribeToTimer();
    // Clean up the listener when the component is destroyed
    return () => unsubscribe();
  });
</script>

<style>
  @font-face {
  font-family: 'Big';
  src: url('/fonts/BurbankBigCondensed-Black.otf') format('opentype');
  font-weight: bold;
  font-style: normal;
}
  .timer-text {
    font-family: 'Big';
    color: white;
    font-size: 136px; /* Adjust as needed */
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
  {$timer}s
</div>
