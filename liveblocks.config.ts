import type { Json } from "@liveblocks/core";

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    Presence: {
      cursor: {
        x: number;
        y: number;
      } | null;
      isThinking: boolean;
    };

    Storage: {
      // Canvas state and room document are managed by the app.
    };

    UserMeta: {
      id?: string;
      info?: {
        [key: string]: Json | undefined;
        name?: string;
        avatar?: string;
        color?: string;
      };
    };

    RoomEvent: {};

    ThreadMetadata: {
      x: number;
      y: number;
    };

    RoomInfo: {
      title: string;
      url: string;
    };
  }
}

export {};
