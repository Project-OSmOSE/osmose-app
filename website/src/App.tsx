import React from 'react';
//- TODO  : fix error 404 on reload
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';

import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { News } from './pages/News';
import { People } from './pages/People';
import { Publications } from './pages/Publications';
// import { Ontology } from './pages/Ontology';
// import { Explore } from './pages/Explore';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>

        <Route exact path="/">
          <Layout>
            <Home />
          </Layout>
        </Route>

        {/*
        <Route path="/explore">
          <Layout>
            <Explore />
          </Layout>
        </Route>
  */}

        <Route path="/people">
          <Layout>
            <People />
          </Layout>
        </Route>

        <Route path="/publications">
          <Layout>
            <Publications />
          </Layout>
        </Route>

        <Route path="/news">
          <Layout>
            <News />
          </Layout>
        </Route>

        {/* <Route path="/ontology">
          <Layout>
            <Ontology />
          </Layout>
        </Route> */}

      </Switch>
    </Router>
  );
}

export default App;
