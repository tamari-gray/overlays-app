 <script>
  import { Router, Route } from 'svelte-routing';
  import Leaderboard from './lib/components/leaderboard.svelte';
  import winPercentage from './lib/components/winPercentage.svelte'

</script>

<main>
  <Router>
    <Route path="/leaderboard" component={Leaderboard} />
    <Route path="/win-percentage" component={winPercentage} />
  </Router>
</main>
