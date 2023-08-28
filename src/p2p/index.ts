import { io, Socket } from "socket.io-client";
import { DATA_CHANNEL_NAME, MessageType } from "./types";
import { EventType } from "../shared/types";
import PubSub from "pubsub-js";

export class P2P {
  socket: Socket;
  peerConnection: RTCPeerConnection;
  sendChannel: RTCDataChannel;
  receiveChannel: RTCDataChannel;

  public Init() {
    this.socket = io("ws://localhost:25000", {
      reconnectionDelayMax: 10000,
    });

    this.socket.on(MessageType.Hello, (data) => {
      console.log("user socket connected", this.socket.id);
    });

    this.socket.emit(MessageType.JoinRoom, {
      roomId: "userroom1",
      type: "user",
    });

    this.socket.on(MessageType.GameServer, async (gameServer) => {
      this.peerConnection = this.createPeerConnection(gameServer);
      const offerSdp = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offerSdp);

      const offerPayload = {
        sdp: offerSdp,
        offerSendId: this.socket.id,
        offerReceiveId: gameServer,
      };

      this.socket.emit(MessageType.Offer, offerPayload);
    });

    this.socket.on(MessageType.Answer, (data) => {
      const { sdp, answerSendId } = data;
      this.peerConnection.setRemoteDescription(sdp);
    });
  }

  private createPeerConnection(gameServerSocketId: string) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ],
        },
      ],
    });

    peerConnection.onicecandidate = (ev) => {
      if (ev.candidate) {
        const candidatePayload = {
          candidate: ev.candidate,
          candidateSendId: this.socket.id,
          candidateReceiveId: gameServerSocketId,
        };

        this.socket.emit(MessageType.Candidate, candidatePayload);
      }
    };

    // ========================
    // DataChannel
    // ========================
    this.sendChannel = peerConnection.createDataChannel(DATA_CHANNEL_NAME);
    this.sendChannel.onopen = (ev) => {
      this.handleSendChannelStatusChange(this.sendChannel, ev);
    };
    this.sendChannel.onclose = (ev) => {
      this.handleSendChannelStatusChange(this.sendChannel, ev);
    };

    peerConnection.ondatachannel = (ev) => {
      const receiveChannel = ev.channel;
      receiveChannel.onopen = (ev) => {
        this.handleReceiveChannelStatusChange(receiveChannel, ev);
      };
      receiveChannel.onclose = (ev) => {
        this.handleReceiveChannelStatusChange(receiveChannel, ev);
      };
      receiveChannel.onmessage = (ev) => {
        this.handleReceiveMessage(receiveChannel, ev);
      };
    };

    // ========================
    // StateChange
    // ========================

    peerConnection.onconnectionstatechange = (ev) => {
      console.log(
        "Peer Connection State has changed:",
        peerConnection.connectionState
      );
    };

    peerConnection.oniceconnectionstatechange = (ev) => {
      //console.log("Ice Connection State has changed:", ev);
    };

    return peerConnection;
  }

  // ========================
  // Handle DataChannel
  // ========================

  private handleSendChannelStatusChange(dataChannel, event) {
    if (dataChannel) {
      if (dataChannel.readyState === "open") {
        console.log("Data channel is open.");
      } else if (dataChannel.readyState === "closed") {
        console.log("Data channel is closed.");
      }
    }
  }

  private handleReceiveChannelStatusChange(dataChannel, event) {
    if (dataChannel) {
      console.log(
        "Receive channel's status has changed to " + dataChannel.readyState
      );
    }
  }

  private handleReceiveMessage(dataChannel, event) {
    PubSub.publish(EventType.ReceiveData, event.data);
  }
}
