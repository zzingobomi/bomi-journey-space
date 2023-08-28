export enum MessageType {
  Hello = "hello",
  JoinRoom = "joinRoom",
  GameServer = "gameserver",
  OtherUsers = "otherUsers",
  Offer = "offer",
  Answer = "answer",
  Candidate = "candidate",
  Disconnect = "disconnect",
  OtherExit = "otherExit",
}

export interface IOfferPayload {
  sdp: RTCSessionDescriptionInit;
  offerSendId: string;
  offerReceiveId: string;
}

export interface IAnswerPayload {
  sdp: RTCSessionDescriptionInit;
  answerSendId: string;
  answerReceiveId: string;
}

export interface ICandidatePayload {
  candidate: RTCIceCandidate;
  candidateSendId: string;
  candidateReceiveId: string;
}

export const DATA_CHANNEL_NAME = "data";
