import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00e676',
        },
        secondary: {
            main: '#ff5722',
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
)
