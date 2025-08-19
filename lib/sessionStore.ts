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
    console.log(`🔐 Session SET - PID: ${this.processId}, State: ${state}, Email: ${email}, Index: ${index}, Timestamp: ${timestamp}, Total Sessions: ${this.sessions.size}`);
    this.cleanup(); // Clean up expired sessions
  }

  get(state: string): { email: string; index: number } | null {
    const session = this.sessions.get(state);
    const now = Date.now();
    
    console.log(`🔍 Session GET - PID: ${this.processId}, State: ${state}, Found: ${!!session}, Total Sessions: ${this.sessions.size}`);
    
    if (!session) {
      console.log(`❌ Session not found for state: ${state}`);
      return null;
    }
    
    const age = now - session.timestamp;
    console.log(`⏰ Session age: ${age}ms, Expiry: ${this.EXPIRY_TIME}ms, Expired: ${age > this.EXPIRY_TIME}`);
    
    if (age > this.EXPIRY_TIME) {
      console.log(`⏰ Session expired for state: ${state}, Age: ${age}ms`);
      this.sessions.delete(state);
      return null;
    }
    
    // Don't delete session immediately to handle potential multiple callback calls
    // Session will be cleaned up by the cleanup method after expiry
    console.log(`✅ Session retrieved for state: ${state}, Email: ${session.email}, Index: ${session.index}`);
    
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
    
    // Log all active sessions for debugging
    console.log("📋 All active sessions:");
    for (const [state, session] of this.sessions.entries()) {
      const age = now - session.timestamp;
      console.log(`  - State: ${state}, Email: ${session.email}, Age: ${age}ms`);
    }
    
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