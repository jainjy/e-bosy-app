import { webSocketService } from "./webSocketService";

export class WebRTCService {
    constructor() {
      this.peerConnection = null;
      this.localStream = null;
      this.remoteStream = new MediaStream();
      this.iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        // Ajoutez vos serveurs TURN si nécessaire
      ];
    }
  
    async initLocalStream(options = { video: true, audio: true }) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(options);
        return this.localStream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
      }
    }
  
    async createPeerConnection() {
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers
      });
  
      // Ajouter les tracks locaux
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
  
      // Gestion des candidats ICE
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          webSocketService.sendMessage('signal', {
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };
  
      // Gestion des streams distants
      this.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          this.remoteStream.addTrack(track);
        });
      };
  
      return this.peerConnection;
    }
  
    async createOffer() {
      if (!this.peerConnection) {
        await this.createPeerConnection();
      }
  
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
  
      return offer;
    }
  
    async handleOffer(offer) {
      if (!this.peerConnection) {
        await this.createPeerConnection();
      }
  
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
  
      return answer;
    }
  
    async handleAnswer(answer) {
      if (!this.peerConnection) {
        throw new Error('PeerConnection not initialized');
      }
      await this.peerConnection.setRemoteDescription(answer);
    }
  
    async addIceCandidate(candidate) {
      if (!this.peerConnection) {
        throw new Error('PeerConnection not initialized');
      }
      await this.peerConnection.addIceCandidate(candidate);
    }
  
    close() {
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
    }
  }