import type { Response } from 'express';

class SseManager {
  private clients: Map<string, Response[]> = new Map();

  addClient(userId: string, res: Response) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(res);
    console.log(
      `SSE client added for user: ${userId}. Total connections for user: ${
        this.clients.get(userId)!.length
      }`,
    );
  }

  removeClient(userId: string, res: Response) {
    const userConnections = this.clients.get(userId);
    if (!userConnections) return;

    const updatedConnections = userConnections.filter(r => r !== res);
    if (updatedConnections.length === 0) {
      this.clients.delete(userId);
    } else {
      this.clients.set(userId, updatedConnections);
    }
    console.log(
      `SSE client removed for user: ${userId}. Remaining connections: ${updatedConnections.length}`,
    );
  }

  sendNotification(userId: string, data: any) {
    const userConnections = this.clients.get(userId);
    if (userConnections && userConnections.length > 0) {
      console.log(`Sending SSE notification to user ${userId}`);
      const message = `data: ${JSON.stringify(data)}\n\n`;
      console.log('SSE message:', message);
      userConnections.forEach(res => res.write(message));
    }
  }
}

export const sseManager = new SseManager();
