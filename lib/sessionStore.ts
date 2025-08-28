declare global {
  var sessionStore: SessionStore | undefined;
}

interface SessionData {
  email: string;
  index: number;
  timestamp: number;
}

class SessionStore {
  private sessions = new Map<string, SessionData>();
  private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly processId = process.pid;
  
  constructor() {
    console.log(`🔄 SessionStore initialized with PID: ${this.processId}`);
  }

  set(state: string, email: string, index: number): void {
    const timestamp = Date.now();
    this.sessions.set(state, {
      email,
      index,
      timestamp
    });
    this.cleanup(); // Clean up expired sessions
  }

  get(state: string): { email: string; index: number } | null {
    const session = this.sessions.get(state);
    const now = Date.now();
    
    
    if (!session) {
      return null;
    }
    
    const age = now - session.timestamp;
    
    if (age > this.EXPIRY_TIME) {
      this.sessions.delete(state);
      return null;
    }
    
    return {
      email: session.email,
      index: session.index
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [state, session] of this.sessions.entries()) {
      if (now - session.timestamp > this.EXPIRY_TIME) {
        this.sessions.delete(state);
      }
    }
  }

  getStats(): { total: number; expired: number } {
    const now = Date.now();
    let expired = 0;
    for (const session of this.sessions.values()) {
      if (now - session.timestamp > this.EXPIRY_TIME) {
        expired++;
      }
    }
    
    // for (const [state, session] of this.sessions.entries()) {
    //   const age = now - session.timestamp;
    //   console.log("age", age)
    //   console.log("state", state)
    // }
    
    return {
      total: this.sessions.size,
      expired
    };
  }
}

// Use global variable to persist across imports
if (!global.sessionStore) {
  global.sessionStore = new SessionStore();
}

export const sessionStore = global.sessionStore;