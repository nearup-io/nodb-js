import { EventName, EventListener } from "./types";

class NodbEventListener {
  protected listeners: Map<EventName, EventListener[]> = new Map();

  protected async emit<T>(eventName: EventName, data: T): Promise<void> {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          await listener(data);
        } catch (error) {
          console.error(`Error in ${eventName} listener:`, error);
        }
      }
    }
  }

  public on<T>(eventName: EventName, listener: EventListener<T>): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(listener);
  }

  public off<T>(eventName: EventName, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  public offAll(eventName?: EventName): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

export default NodbEventListener;
