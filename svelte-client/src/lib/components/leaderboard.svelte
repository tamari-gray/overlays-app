<script lang="ts">
 import { onMount } from 'svelte';
 import { database, ref, onValue } from '../firebase'; // Adjust path to firebase.ts if needed

 // Define types
 type LeaderboardItem = {
   rank: number;
   name: string;
   points: number;
 };

 // Type for data structure from Firebase
 type LeaderboardFirebaseItem = {
   Username: string;
   Points: number;
 };

 let leaderboard: LeaderboardItem[] = [];

 // Fetch data when the component mounts
 onMount(() => {
   const leaderboardRef = ref(database, 'leaderboard'); // Reference to the leaderboard data in Firebase

   // Listen for changes in the leaderboard data
   onValue(leaderboardRef, (snapshot) => {
     if (snapshot.exists()) {
       // Get the raw data from Firebase and assert its type
       const data = snapshot.val() as Record<string, LeaderboardFirebaseItem>;

       // Map the data to the leaderboard format
       leaderboard = Object.values(data).map((item, index) => ({
         rank: index + 1, // Calculate the rank based on the position in the array
         name: item.Username, // Assuming "Username" is the field for player names
         points: item.Points, // Assuming "Points" is the field for player points
       }));
     } else {
       leaderboard = [];
     }
   });
 });
</script>

<style>
 /* Fullscreen layout for the leaderboard */
 .leaderboard {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: flex-start;
   width: 480px;
   height: 100vh;
   font-family: 'Burbank Big Condensed', sans-serif;
   background-color: #f0f0f0;
   padding: 20px;
   box-sizing: border-box;
   margin: 0 auto; /* Centers the leaderboard horizontally */
 }

 .title {
   font-size: 3rem;
   margin-bottom: 2rem;
   font-weight: bold;
   position: sticky;
   top: 0;
   background-color: #f0f0f0;
   padding: 10px 0;
   width: 100%;
   z-index: 10;
   text-align: center;
 }

 .board-list {
   overflow-y: auto;
   width: 100%;
   height: calc(100vh - 120px); /* Adjust to fit within the available height after the title */
 }

 .board-item {
   font-size: 1.5rem;
   display: flex;
   justify-content: space-between;
   width: 100%;
   padding: 10px 0;
   border-bottom: 1px solid #ddd;
   align-items: center;
 }

 .rank {
   width: 20%;
   text-align: center;
 }

 .name {
   width: 50%;
   text-align: center;
 }

 .points {
   width: 30%;
   text-align: center;
 }
</style>

<div class="leaderboard">
 <div class="title">Leaderboard</div>
 <div class="board-list">
   {#each leaderboard as { rank, name, points }}
     <div class="board-item">
       <div class="rank">{rank}</div>
       <div class="name">{name}</div>
       <div class="points">{points} pts</div>
     </div>
   {/each}
 </div>
</div>
