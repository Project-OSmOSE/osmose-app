import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';

import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { People } from './pages/People';
import { Project } from './pages/Project';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Layout>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/project">
            <Project />
          </Route>
          <Route path="/people">
            <People />
          </Route>
        </Layout>
      </Switch>
    </Router>
  );
}

export default App;
