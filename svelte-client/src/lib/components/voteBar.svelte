<script lang="ts">
 import { onMount } from "svelte";
 import { database, ref, onValue } from "../firebase";

 type LeaderboardEntry = {
   username: string;
   points: number;
 };

 let leaderboard: LeaderboardEntry[] = [];

 // Listen to Firebase changes
 onMount(() => {
   const leaderboardRef = ref(database, "leaderboard");
   onValue(leaderboardRef, (snapshot) => {
     const data = snapshot.val();
     leaderboard = data
       ? Object.values(data).sort((a, b) => b.points - a.points)
       : [];
   });
 });
</script>

<style>
 .leaderboard {
   font-family: Arial, sans-serif;
   padding: 20px;
   background: #222;
   color: white;
   border-radius: 10px;
   width: 300px;
 }
 h2 {
   text-align: center;
 }
 .entry {
   display: flex;
   justify-content: space-between;
   margin-bottom: 10px;
 }
</style>

<div class="leaderboard">
 <h2>Leaderboard</h2>
 {#each leaderboard as { username, points }, i}
   <div class="entry">
     <span>#{i + 1} {username}</span>
     <span>{points} pts</span>
   </div>
 {/each}
</div>
