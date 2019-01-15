import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const middleware = [thunk];

const initialState = {};

// Make sure not to get undefined error from non-chrome browsers
if (window.navigator.userAgent.includes('Chrome') && (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())) {
	var store = createStore(
	rootReducer,
	initialState,
	compose(
		applyMiddleware(...middleware),
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
	)
);
} else {
	store = createStore(
	rootReducer,
	initialState,
	compose(
		applyMiddleware(...middleware)
	)
);
}

export default store;