import { AdminUser } from '../types';

const ADMIN_SESSION_KEY = 'artecrafts_admin_session';

export const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-01',
  name: 'Arlette Portilla',
  email: 'admin@artecrafts.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

// Default authorized credentials
const VALID_CREDENTIALS = [
  { user: 'admin@artecrafts.com', pass: 'artecrafts2026' },
  { user: 'admin', pass: 'artecrafts2026' },
  { user: 'arletteportilla0311@gmail.com', pass: 'artecrafts2026' },
];

export class AuthService {
  static getSession(): AdminUser | null {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AdminUser;
    } catch {
      return null;
    }
  }

  static getCurrentUser(): AdminUser | null {
    return this.getSession();
  }

  static isAuthenticated(): boolean {
    return !!this.getSession();
  }

  static login(emailOrUser: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cleanUser = emailOrUser.trim().toLowerCase();
        const cleanPass = password.trim();

        if (!cleanUser) {
          resolve({ success: false, error: 'Por favor ingresa tu correo o nombre de usuario.' });
          return;
        }

        if (!cleanPass) {
          resolve({ success: false, error: 'Por favor ingresa tu contraseña.' });
          return;
        }

        const match = VALID_CREDENTIALS.some(
          (c) => c.user.toLowerCase() === cleanUser && c.pass === cleanPass
        );

        if (match) {
          const user: AdminUser = {
            ...DEFAULT_ADMIN,
            email: cleanUser.includes('@') ? cleanUser : DEFAULT_ADMIN.email,
          };
          try {
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
          } catch (e) {
            console.warn('Could not persist session', e);
          }
          resolve({ success: true, user });
        } else {
          resolve({
            success: false,
            error: 'Credenciales inválidas. Verifica tu correo y contraseña.',
          });
        }
      }, 400); // realistic slight async feel
    });
  }

  static logout(): void {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {
      console.warn('Could not remove session', e);
    }
  }
}
