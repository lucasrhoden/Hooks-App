import React from 'react';
import { Route } from 'react-router-dom'
import Ingredients from './components/Ingredients/Ingredients';

const App = props => {
  return <Route path="/" exact component={Ingredients} />;
};

export default App;
