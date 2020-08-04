import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo(props => {
  const [ enteredFilter, setEnteredFilter ] = useState("");
  const { onLoadIngredients } = props;
  const inputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      // setTimeout function to no send all the time the http request for the server.
      if (enteredFilter === inputRef.current.value){
        // enteredFilter in setTimeout is the old value. That why needs to use useRef to use the currente value.
        const query = 
          enteredFilter.length === 0
          ? ""
          : `?orderBy="title"&equalTo="${enteredFilter}"`;
        fetch("https://react-hooks-72dd3.firebaseio.com/ingredients.json" + query)
          .then(response => response.json())
          .then(responseData => {
            const loadedIngredients = [];
            for (const key in responseData) {
              loadedIngredients.push({
              id: key,
              title: responseData[key].title,
              amount: responseData[key].amount
            });
          }
        onLoadIngredients(loadedIngredients)
        });
      }
    }, 500);
    return () => {
      // clear the Timeout to only have the time of the latest value.
      clearTimeout(timer);
    };
  }, [enteredFilter, onLoadIngredients])

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input
            ref={inputRef} 
            type="text" 
            value={enteredFilter} 
            onChange={event => setEnteredFilter(event.target.value)} />
        </div>
      </Card>
    </section>
  );
});

export default Search;
