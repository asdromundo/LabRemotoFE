<script lang="ts">
  let streamURL = import.meta.env.PUBLIC_STREAM_URL;
  let streamKey = import.meta.env.PUBLIC_STREAM_KEY;

  let videoPlayer: HTMLMediaElement = $state()!;
  let connectionState: string = $state("disconnected");
  $inspect(connectionState);

  async function setupPeerConnection(peerConnection: RTCPeerConnection) {
    try {
      peerConnection.ontrack = (event) => {
        videoPlayer.srcObject = event.streams[0];
      };

      peerConnection.oniceconnectionstatechange = () => {
        connectionState = peerConnection.iceConnectionState;
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const response = await fetch(streamURL, {
        method: "POST",
        body: peerConnection.localDescription
          ? peerConnection.localDescription.sdp
          : null,
        headers: {
          Authorization: `Bearer ${streamKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to send offer to server");
      }

      const answer = await response.text();
      await peerConnection.setRemoteDescription({
        sdp: answer,
        type: "answer",
      });
    } catch (error) {
      console.log("An error occurred: " + (error as Error).message);
    }
  }
  $effect(() => {
    const peerConnection = new RTCPeerConnection();
    peerConnection.addTransceiver("audio", { direction: "recvonly" });
    peerConnection.addTransceiver("video", { direction: "recvonly" });
    setupPeerConnection(peerConnection);
  });
</script>

<div class="my-8">
  {#if connectionState === "disconnected"}
    <div
      role="status"
      class="flex items-center justify-center aspect-video h-auto w-full max-w-full bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700"
    >
      <span class="sr-only">Loading...</span>
    </div>
  {:else}
    <video
      bind:this={videoPlayer}
      autoplay
      muted
      controls
      class="h-auto w-full max-w-full"
    >
      <track kind="captions" />
      Your browser does not support the video tag.
    </video>
  {/if}
</div>
