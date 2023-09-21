import { RtcSocket } from "./RtcSocket";

export type p2pType = "node" | "gameserver" | "user";

export enum SocketMsgType {
  Hello = "hello",
  JoinHostRoom = "joinHostRoom",
  JoinGuestRoom = "joinGuestRoom",
  JoinUserRoom = "joinUserRoom",
  OtherHosts = "otherHosts",
  OtherUsers = "otherUsers",
  Offer = "offer",
  Answer = "answer",
  Candidate = "candidate",
  Disconnect = "disconnect",
  OtherHostExit = "otherHostExit",
  OtherExit = "otherExit",
  GameServer = "gameserver",
}

export enum RtcSocketEventType {
  ReceiveData = "receiveData",
}

export interface IOfferPayload {
  sdp: RTCSessionDescriptionInit;
  offerSendId?: string;
  offerReceiveId?: string;
}

export interface IAnswerPayload {
  sdp: RTCSessionDescriptionInit;
  answerSendId?: string;
  answerReceiveId?: string;
}

export interface ICandidatePayload {
  candidate: RTCIceCandidate;
  candidateSendId?: string;
  candidateReceiveId?: string;
}

export interface IRtcSockets {
  [key: string]: RtcSocket;
}

export const DATA_CHANNEL_NAME = "data";

export const StunUrls = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun2.l.google.com:19302",
  "stun:stun3.l.google.com:19302",
  "stun:stun4.l.google.com:19302",
];
