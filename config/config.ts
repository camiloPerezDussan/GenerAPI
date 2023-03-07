
import { env } from 'process';
// ==============================
// Puerto
// ==============================
env.PORT = env.PORT || '8081';

// ==============================
// Entorno
// ==============================
env.NODE_ENV = env.NODE_ENV || 'dev';