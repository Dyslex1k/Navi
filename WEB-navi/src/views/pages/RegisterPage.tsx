import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../controllers/auth/useAuthController';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthController();

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
      await register({ username: trimmedUsername, password: trimmedPassword });
      navigate('/login', { replace: true });
    } catch (requestError) {
      if (
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        (requestError as { response?: { status?: number } }).response?.status === 409
      ) {
        setError('That username is already in use.');
      } else {
        setError('Unable to register.');
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
              <Typography variant="h4">Register</Typography>
              <Typography color="text.secondary">Create an account for map administration.</Typography>
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
            <Button variant="contained" startIcon={<PersonAddAlt1Icon />} disabled={submitting} onClick={onSubmit}>
              Create account
            </Button>
            <Typography variant="body2" color="text.secondary">
              Already have an account? <RouterLink to="/login">Login</RouterLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
