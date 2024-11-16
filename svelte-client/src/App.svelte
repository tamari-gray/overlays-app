<script>
  import { Router, Route, Link } from 'svelte-routing';
  import Leaderboard from './lib/components/leaderboard.svelte';

</script>

<main>
  <Router>
    <Route path="/leaderboard" component={Leaderboard} />
  </Router>
</main>
