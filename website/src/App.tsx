import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import './App.css';

import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Project } from './pages/Project';
import { News } from './pages/News';
import { Explore } from './pages/Explore';
import { People } from './pages/People';
import { Publications } from './pages/Publications';
// import { Ontology } from './pages/Ontology';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>

        <Route exact path="/">
          <Layout>
            <Project />
          </Layout>
        </Route>

        <Route path="/project">
          <Layout>
            <Project />
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
