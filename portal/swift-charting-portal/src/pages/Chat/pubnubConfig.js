/* eslint-disable no-unused-vars */
/* eslint-disable no-new */
import Pubnub from 'pubnub';

const usePubNubConfig = (uuid) =>({unsubscribe:()=>{},addListener:()=>{},removeListener:()=>{},subscribe:()=>{},hereNow:()=>{},history:()=>{},objects:{getMemberships:()=>({then:()=>{}})}})

export default usePubNubConfig;
