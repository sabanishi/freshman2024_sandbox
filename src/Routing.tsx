import { Router, Route } from "@solidjs/router";
import Bookshell from "./pages/Bookshell";
import BookRegister from "./pages/BookRegister";

function Routing() {
  return (
    <Router>
      <Route path="/register" component={BookRegister} />
      <Route path="/" component={Bookshell} />
    </Router>
  );
}

export default Routing;