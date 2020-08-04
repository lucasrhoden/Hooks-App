import React, { useEffect, useCallback, useReducer } from 'react';
import ErrorModal from "../UI/ErrorModal";
import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from "./IngredientList";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error("Should not get there")
  }
}

const httpReducer = (curHttpState, action) => {
  switch(action.type) {
    case "SEND":
      return { loading: true, error: null}
    case "RESPONSE":
      return {...curHttpState, loading: false}
    case "ERROR":
      return { loading: false, error: action.errorMessage}
    case "CLEAR":
      return { ...curHttpState, error: null}
    default:
      throw new Error("Should not be reached!")
  }
}

function Ingredients() {
  // const [ userIngredients, setUserIngredients ] = useState([]);
  const [ userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [ httpState, dispatchHttp ] = useReducer (httpReducer, { loading: false, error: null })
  // const [ isLoading, setIsLoading] = useState(null);
  // const [ error, setError ] = useState();

  useEffect(() => {
    dispatchHttp({type:"SEND"});
    fetch("https://react-hooks-72dd3.firebaseio.com/ingredients.json")
      .then(response => response.json())
      .then(responseData => {
        dispatchHttp({type:"RESPONSE"});
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount
          });
        }
        dispatch({type: "SET", ingredients: loadedIngredients})
      })
      .catch(error => {
        dispatchHttp({type:"ERROR", errorMessage: "Something went wrong!"});
      });
      // [] to use useEffect like componentDidMount. Otherwhise will be componentDidUpdate
  }, []);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({type: "SET", ingredients: filteredIngredients})
  }, []);
 
  const addIngredientsHandler = ingredient => {
    dispatchHttp({type:"SEND"});
    fetch("https://react-hooks-72dd3.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      return response.json();
    }).then(responseData => {
      dispatchHttp({type:"RESPONSE"});
      dispatch({type:"ADD", ingredient: ingredient})
    }).catch(error => {
      dispatchHttp({type:"ERROR", errorMessage: "Something went wrong!"});
    });
  };

  const removeIngredientHandler = ingredientId => {
    dispatchHttp({type:"SEND"});
    fetch(
      `https://react-hooks-72dd3.firebaseio.com/ingredients/${ingredientId}.json`, {
        method: 'DELETE'
      })
      .then(response => {
        dispatchHttp({type:"RESPONSE"});
      dispatch({type:"DELETE", id: ingredientId})
      })
    .catch(error => {
      dispatchHttp({type:"ERROR", errorMessage: "Something went wrong!"});
    });
  };

  const closeError = () => {
    dispatchHttp({type: "CLEAR"})
  }

  return (
    <div className="App">
      {httpState.error ? <ErrorModal onClose={closeError}>{httpState.error}</ErrorModal> : null}
      <IngredientForm onAddIngredient={addIngredientsHandler} loading={httpState.loading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
