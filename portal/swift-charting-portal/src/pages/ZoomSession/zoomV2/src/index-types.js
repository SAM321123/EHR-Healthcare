import {
  VideoClient,
  Stream,
  Participant as ZoomParticipant,
  ChatClient as SDKChatClient,
  SubsessionClient as SDKSubsessionClient,
  RecordingClient as SDKRecordingClient,
  LiveTranscriptionClient as SDKLiveTranscriptionClient,
  CommandChannel,
  LiveStreamClient as SDKLiveStreamClient
} from '@zoom/videosdk';

export const  ZoomClient =  VideoClient;
export const  MediaStream =  Stream;
export const  Participant = ZoomParticipant;
export const  ChatClient =  SDKChatClient;
export const  CommandChannelClient =  CommandChannel;
export const  SubsessionClient =  SDKSubsessionClient;
export const  RecordingClient =  SDKRecordingClient;
export const  LiveTranscriptionClient =  SDKLiveTranscriptionClient;
export const  LiveStreamClient =  SDKLiveStreamClient;
