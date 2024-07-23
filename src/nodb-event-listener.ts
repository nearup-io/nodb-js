import WebSocket from "ws";
import { NodbError } from "./errors";

class NodbEventListener {
  protected socket: WebSocket | undefined;

  protected connect(props: {
    baseUrl: string;
    appName: string;
    envName?: string;
    token: string;
  }) {
    if (!props.token) {
      throw new NodbError("Token is missing!");
    }
    const envUrlPart = props.envName ? `/${props.envName}` : "";

    const formattedBaseUrl = props.baseUrl
      .replace("http://", "ws://")
      .replace("https://", "wss://");
    this.socket = new WebSocket(
      `${formattedBaseUrl}/ws/${props.appName}${envUrlPart}`,
      {
        headers: {
          token: props.token,
        },
      },
    );

    this.socket.on("open", () => {
      console.log("Connected to socket");
    });

    this.socket.onerror = () => {
      throw new NodbError(`Something went wrong with socket!`);
    };

    this.listenForMessages();
  }

  protected listenForMessages() {
    this.socket?.on("message", (data) => {
      const message = data.toString();
      try {
        const {
          type,
          appName,
          envName,
          data: messageData,
        } = JSON.parse(message) as {
          type: string;
          appName: string;
          envName: string;
          data: any;
        };
        console.log(`Operation ${type.toUpperCase()}`);
        console.log(
          `Affected environment: ${JSON.stringify({ appName, envName }, null, 2)}`,
        );
        console.log(`Data: ${JSON.stringify(messageData, null, 2)}`);
      } catch (err) {
        console.error("Error parsing JSON:", err);
      }
    });
  }

  public disconnectFromSocket() {
    this.socket?.close();
  }
}

export default NodbEventListener;
