import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
//setelah menginstall Tanstuck Query, notisctack & axios
import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient({
  defaultOption: {
    queries:{
      staleTime : 30000,
    }
  }
})


// Penambahan store bagian dari instalasi Redux-React
createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}> 
     <SnackbarProvider autoHideDuration={3000}>
        <QueryClientProvider client={queryClient}>
         < App />
        </QueryClientProvider>
     </SnackbarProvider>
   </Provider>
  </StrictMode>,
)
