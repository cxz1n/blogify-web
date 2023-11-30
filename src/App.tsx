import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Router from './router';
import store, { persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import '@/assets/css/index.css'
function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate persistor={persistor}></PersistGate>
        <Router></Router>
      </Provider>
    </BrowserRouter>
  )
}

export default App
