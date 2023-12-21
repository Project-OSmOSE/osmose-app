import React from 'react';
//- TODO  : fix error 404 on reload
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { News } from './pages/News';
import { People } from './pages/People';
import { Projects } from './pages/Projects';
import { Publications } from './pages/Publications';
import { SingleNews } from './pages/SingleNews';
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

        <Route exact path="/people">
          <Layout>
            <People />
          </Layout>
        </Route>

        <Route exact path="/projects">
          <Layout>
            <Projects />
          </Layout>
        </Route>

        <Route exact path="/publications">
          <Layout>
            <Publications />
          </Layout>
        </Route>

        <Route exact path="/news">
          <Redirect to="/news/1" />
        </Route>

        <Route path="/news/:page">
          <Layout>
            <News />
          </Layout>
        </Route>

        <Route exact path="/article">
          <Redirect to="/news/1" />
        </Route>

        <Route path="/article/:id">
          <Layout>
            <SingleNews />
          </Layout>
        </Route>

        {/* <Route path="/ontology">
          <Layout>
            <Ontology />
          </Layout>
        </Route> */}

        <Route path="*">
          <Redirect to="/"></Redirect>
        </Route>

      </Switch>
    </Router>
  );
}

export default App;
