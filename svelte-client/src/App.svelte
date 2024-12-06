 <script>
  import { Router, Route } from 'svelte-routing';
  import Leaderboard from './lib/components/leaderboard.svelte';
  import winPercentage from './lib/components/winPercentage.svelte';
  import StreamInfo from './lib/components/streamInfo.svelte';

</script>

<main>
  <Router>
    <Route path="/leaderboard" component={Leaderboard} />
    <Route path="/win-percentage" component={winPercentage} />
    <Route path="/stream-info" component={StreamInfo} />

  </Router>
</main>
