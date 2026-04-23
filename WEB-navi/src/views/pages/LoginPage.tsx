import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../controllers/auth/useAuthController';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthController();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername && !trimmedPassword) {
      setError('Please fill in the form.');
      return;
    }

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please complete both username and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login({ username: trimmedUsername, password: trimmedPassword });
      navigate('/maps', { replace: true });
    } catch (requestError) {
      if (
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        (requestError as { response?: { status?: number } }).response?.status === 401
      ) {
        setError('Password or username is incorrect.');
      } else {
        setError('Unable to login.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">Map Manager Login</Typography>
              <Typography color="text.secondary">Authenticate to manage your indoor maps.</Typography>
            </div>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} fullWidth />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <Button variant="contained" endIcon={<ArrowForwardIcon />} disabled={submitting} onClick={onSubmit}>
              Sign in
            </Button>
            <Typography variant="body2" color="text.secondary">
              Need an account? <RouterLink to="/register">Register</RouterLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
