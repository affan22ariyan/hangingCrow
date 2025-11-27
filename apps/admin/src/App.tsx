import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Container } from '@mui/material';
import { useState } from 'react';
import { useAuthStore } from './store/authStore';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setToken, setUser } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Basic validation
        if (!username.trim()) {
            setError('Please enter your username');
            return;
        }
        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }

        setLoading(true);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || `Login failed: ${response.status}`);
            }

            if (!data.access_token) {
                throw new Error('No authentication token received');
            }

            setToken(data.access_token);
            setUser({ username: username.trim(), ...data.user });
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('Login error:', err);
            let errorMessage = 'Invalid credentials';
            
            if (err.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Betting Admin Login
                    </Typography>
                    {error && (
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.main' }}>
                            <Typography color="error.contrastText" sx={{ wordWrap: 'break-word' }}>
                                {error}
                            </Typography>
                        </Paper>
                    )}
                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                            autoComplete="username"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
                        Test: admin / password123
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}

function Dashboard() {
    const { token, user, logout } = useAuthStore();

    if (!token) return <Navigate to="/login" />;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Admin Dashboard</Typography>
                <Button variant="outlined" onClick={logout}>Logout</Button>
            </Box>
            <Typography variant="body1" gutterBottom>
                Welcome, {user?.username}!
            </Typography>
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>System Status</Typography>
                <Typography>✅ Backend API: Connected</Typography>
                <Typography>✅ Database: PostgreSQL</Typography>
                <Typography>✅ Authentication: Active</Typography>
            </Paper>
        </Box>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
