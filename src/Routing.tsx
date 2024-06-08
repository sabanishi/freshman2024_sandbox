import { Router, Route } from "@solidjs/router";
import Lending from "./pages/Lending";
import Return from "./pages/Return";
import MainPage from "./pages/MainPage";
import FirebaseTest from "./pages/FirebaseTest";

function Routing() {
  return (
    <Router>
      <Route path="/" component={MainPage} />
      <Route path="/lending" component={Lending} />
      <Route path="/return" component={Return} />
      <Route path="/firebase-test" component={FirebaseTest} />
    </Router>
  );
}

export default Routing;