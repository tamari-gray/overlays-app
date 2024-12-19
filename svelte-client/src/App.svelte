 <script>
  import { Router, Route } from 'svelte-routing';
  import Leaderboard from './lib/components/leaderboard.svelte';
  import winPercentage from './lib/components/winPercentage.svelte';
  import StreamInfo from './lib/components/streamInfo.svelte';
  import Rules from './lib/components/rules.svelte';
  import Timer from './lib/components/timer.svelte';
  import Flag from './lib/components/flag.svelte';
  import Voting from './lib/components/voting.svelte';
  import LosePercentage from './lib/components/losePercentage.svelte';

</script>

<main>
  <Router>
    <Route path="/leaderboard" component={Leaderboard} />
    <Route path="/win-percentage" component={winPercentage} />
    <Route path="/lose-percentage" component={LosePercentage} />
    <Route path="/stream-info" component={StreamInfo} />
    <Route path="/rules" component={Rules} />
    <Route path="/flag" component={Flag} />
    <Route path="/timer" component={Timer} />
    <Route path="/voting" component={Voting} />

  </Router>
</main>
