import WebRTC from "../../lib/webrtc";
import { observer, action } from "../../server/signaling";

export function create(roomId: string, trickle: boolean) {
  return new Promise<WebRTC>(async resolve => {
    const rtc = new WebRTC({ trickle: false });

    observer.subscribe(action => {
      console.log(action);
      switch (action.type) {
        case "join":
          rtc.makeOffer();
          break;
        case "sdp":
          const sdp = action.payload;
          rtc.setSdp(sdp);
          break;
      }
    });

    rtc.onSignal.subscribe((session: any) => {
      console.log({ session });
      const { type, sdp } = session;
      const data = type + "%" + sdp;
      console.log("signal", { sdp: data, roomId });
      action.execute({ type: "offer", payload: data });
    });

    rtc.onConnect.once(() => {
      console.log("connect");
      resolve(rtc);
      setInterval(() => rtc.send("from electron"), 2000);
    });

    rtc.onData.once(e => console.log("connected", e.data));
  });
}