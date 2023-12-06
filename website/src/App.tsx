import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Layout } from './components/Layout';
import { HomePage } from './pages/Home/HomePage';
import { NewsPage } from './pages/News/NewsPage';
import { People } from './pages/People/People';
import { Projects } from './pages/Projects';
import { Publications } from './pages/Publications';
import { NewsDetailPage } from './pages/News/NewsDetail/NewsDetailPage';
import { PeopleDetail } from "./pages/People/PeopleDetail/PeopleDetail";

import { setupIonicReact } from "@ionic/react";
import '@ionic/react/css/core.css';

setupIonicReact({
  mode: 'md'
})

const App: React.FC = () => {
  return (
    <Router>
      <Switch>

        <Route exact path="/">
          <Layout>
            <HomePage/>
          </Layout>
        </Route>

        {/*
        <Route path="/explore">
          <Layout>
            <Explore />
          </Layout>
        </Route>
        */ }

        <Route exact path="/people">
          <Layout>
            <People/>
          </Layout>
        </Route>

        <Route path="/people/:id">
          <Layout>
            <PeopleDetail/>
          </Layout>
        </Route>

        <Route exact path="/projects">
          <Layout>
            <Projects/>
          </Layout>
        </Route>

        <Route exact path="/publications">
          <Layout>
            <Publications/>
          </Layout>
        </Route>

        <Route exact path="/news">
          <Layout>
            <NewsPage/>
          </Layout>
        </Route>

        <Route path="/news/:id">
          <Layout>
            <NewsDetailPage/>
          </Layout>
        </Route>

        {/* <Route path="/ontology">
          <Layout>
            <Ontology />
          </Layout>
        </Route> */ }

        <Route path="*">
          <Redirect to="/"></Redirect>
        </Route>

      </Switch>
    </Router>
  );
}

export default App;
