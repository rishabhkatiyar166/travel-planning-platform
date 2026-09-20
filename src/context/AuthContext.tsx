import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../services/supabaseClient";

/*
 * ========================================
 * USER TYPE
 * ========================================
 */

interface User {
  id: string;
  name?: string;
  email: string;
}

/*
 * ========================================
 * AUTH CONTEXT TYPE
 * ========================================
 */

interface AuthContextType {
  user: User | null;

  isLoggedIn: boolean;

  isAuthLoading: boolean;

  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;

  login: (email: string, password: string) => Promise<{ error: string | null }>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/*
 * ========================================
 * PROVIDER PROPS
 * ========================================
 */

interface AuthProviderProps {
  children: ReactNode;
}

/*
 * ========================================
 * AUTH PROVIDER
 * ========================================
 */

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  /*
   * ========================================
   * RESTORE SUPABASE SESSION
   * ========================================
   */

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error || !session?.user) {
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      const metadata = session.user.user_metadata;

      setUser({
        id: session.user.id,

        name: typeof metadata?.name === "string" ? metadata.name : undefined,

        email: session.user.email ?? "",
      });

      setIsAuthLoading(false);
    };

    restoreSession();

    /*
     * ========================================
     * LISTEN FOR AUTH CHANGES
     * ========================================
     */

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        if (!session?.user) {
          setUser(null);
          return;
        }

        const metadata = session.user.user_metadata;

        setUser({
          id: session.user.id,

          name: typeof metadata?.name === "string" ? metadata.name : undefined,

          email: session.user.email ?? "",
        });
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  /*
   * ========================================
   * SIGN UP
   * ========================================
   */

  const signUp = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    /*
     * If email confirmation is enabled,
     * Supabase creates the account but
     * does not immediately create a session.
     */

    if (!data.session) {
      return {
        error: null,
      };
    }

    return {
      error: null,
    };
  };

  /*
   * ========================================
   * LOGIN
   * ========================================
   */

  const login = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      error: null,
    };
  };

  /*
   * ========================================
   * LOGOUT
   * ========================================
   */

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /*
   * ========================================
   * CONTEXT
   * ========================================
   */

  return (
    <AuthContext.Provider
      value={{
        user,

        isLoggedIn: user !== null,

        isAuthLoading,

        signUp,

        login,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
 * ========================================
 * USE AUTH
 * ========================================
 */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
