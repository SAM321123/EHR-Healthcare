import { Box, Dialog, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import MediaContext from '../../../context/media-context';
import ZoomContext from '../../../context/zoom-context';
import { useMount } from '../../../hooks/useUnmount';
import Tabs from 'src/components/Tabs';


const mult = '\u00D7';
const AudioMetrics = [
  {
    title: 'Frequency',
    value: 'sample_rate',
    format: (value) => `${value} khz`
  },
  {
    title: 'Bitrate',
    value: ['bitrate'],
    format: (value) => `${(value / 1024).toFixed(1)} kps`
  },
  {
    title: 'Latency',
    value: 'rtt',
    format: (value) => `${value} ms`
  },
  {
    title: 'Jitter',
    value: 'jitter',
    format: (value) => `${value} ms`
  },
  {
    title: 'Packet Loss - Avg(Max)',
    value: ['avg_loss', 'max_loss'],
    format: (value) => {
      const nv = value.map((s) => {
        return `${((Number(s) / 1000) * 100).toFixed(1)}%`;
      });
      const [avg, max] = nv;
      return `${avg} (${max})`;
    }
  }
];
const VideoMetrics = [
  {
    title: 'Latency',
    value: 'rtt',
    format: (value) => `${value} ms`
  },
  {
    title: 'Jitter',
    value: 'jitter',
    format: (value) => `${value} ms`
  },
  {
    title: 'Bandwidth',
    value: ['bandwidth'],
    format: (value) => `${(value / 1024).toFixed(1)} kb/s`
  },
  {
    title: 'Packet Loss - Avg(Max)',
    value: ['avg_loss', 'max_loss'],
    format: (value) => {
      const nv = value.map((s) => {
        return `${((Number(s) / 1000) * 100).toFixed(1)}%`;
      });
      const [avg, max] = nv;
      return `${avg} (${max})`;
    }
  },
  {
    title: 'Resolution',
    value: ['width', 'height'],
    format: (value) => {
      const [w, h] = value;
      if (w === 0 && h === 0) {
        return '-';
      }
      return `${w}${mult}${h}`;
    }
  },
  {
    title: 'Frame Per Second	',
    value: 'fps',
    format: (value) => `${value} fps`
  }
];
const AudioQosDataShape = {
  avg_loss: 0,
  jitter: 0,
  max_loss: 0,
  rtt: 0,
  sample_rate: 0,
  timestamp: 0,
  bandwidth: 0,
  bitrate: 0
};

const VideoQosDataShape = {
  avg_loss: 0,
  fps: 0,
  height: 0,
  jitter: 0,
  max_loss: 0,
  rtt: 0,
  width: 0,
  sample_rate: 0,
  timestamp: 0,
  bandwidth: 0,
  bitrate: 0
};
const getDataSouce = (
  streamMertics,
  encodingData,
  decodingData
) => {
  return streamMertics.map((metrics, index) => {
    let send = '';
    let receive = '';
    if (encodingData) {
      let value;
      if (Array.isArray(metrics.value)) {
        value = metrics.value.map((m) => encodingData[m]);
      } else {
        value = encodingData[metrics.value];
      }
      send = value === 0 ? '-' : metrics.format(value);
    }
    if (decodingData) {
      let value;
      if (Array.isArray(metrics.value)) {
        value = metrics.value.map((m) => decodingData[m]);
      } else {
        value = decodingData[metrics.value];
      }
      receive = value === 0 ? '-' : metrics.format(value);
    }
    return {
      name: metrics.title,
      send,
      receive,
      key: index
    };
  });
};
const columns = [
  {
    title: 'Item Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Send',
    dataIndex: 'send',
    key: 'send'
  },
  {
    title: 'Receive',
    dataIndex: 'receive',
    key: 'receive'
  }
];
const AudioVideoStatisticModal = (props) => {
  const { visible, defaultTab, isStartedAudio, isStartedVideo, isMuted, setVisible } = props;
  const zmclient = useContext(ZoomContext);
  const { mediaStream } = useContext(MediaContext);
  const [tab, setTab] = useState(defaultTab || 'audio');
  console.log("🚀 ~ AudioVideoStatisticModal ~ tab:", tab)
  const [audioEncodingStatistic, setAudioEncodingStatistic] = useState();
  const [audioDecodingStatistic, setAudioDecodingStatistic] = useState();
  const [videoEncodingStatistic, setVideoEncodingStatistic] = useState();
  const [videoDecodingStatistic, setVideoDecodingStatistic] = useState();
  const [shareEncodingStatistic, setShareEncodingStatistic] = useState();
  const [shareDecodingStatistic, setShareDecodingStatistic] = useState();
  const timerRef = useRef(0);

  const onAudioStatisticChange = useCallback((payload) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setAudioEncodingStatistic({ ...restProps, timestamp: Date.now() });
    } else {
      setAudioDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const onVideoStatisticChange = useCallback((payload) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setVideoEncodingStatistic({ ...restProps, timestamp: Date.now() });
    } else {
      setVideoDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const onShareStatisticChange = useCallback((payload) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setShareEncodingStatistic({ ...restProps, timestamp: Date.now() });
    } else {
      setShareDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const audioDataSource = getDataSouce(AudioMetrics, audioEncodingStatistic, audioDecodingStatistic);
  const videoDataSource = getDataSouce(VideoMetrics, videoEncodingStatistic, videoDecodingStatistic);
  const shareDataSource = getDataSouce(VideoMetrics, shareEncodingStatistic, shareDecodingStatistic);
  useEffect(() => {
    zmclient.on('audio-statistic-data-change', onAudioStatisticChange);
    zmclient.on('video-statistic-data-change', onVideoStatisticChange);
    zmclient.on('share-statistic-data-change', onShareStatisticChange);
    return () => {
      zmclient.off('audio-statistic-data-change', onAudioStatisticChange);
      zmclient.off('video-statistic-data-change', onVideoStatisticChange);
      zmclient.off('share-statistic-data-change', onShareStatisticChange);
    };
  }, [zmclient, onAudioStatisticChange, onVideoStatisticChange, onShareStatisticChange]);

  useEffect(() => {
    if (visible && mediaStream && zmclient.getSessionInfo().isInMeeting) {
      mediaStream.subscribeAudioStatisticData();
      mediaStream.subscribeVideoStatisticData();
      mediaStream.subscribeShareStatisticData();
    }
    return () => {
      if (zmclient.getSessionInfo().isInMeeting) {
        mediaStream?.unsubscribeAudioStatisticData();
        mediaStream?.unsubscribeVideoStatisticData();
        mediaStream?.unsubscribeShareStatisticData();
      }
    };
  }, [mediaStream, zmclient, visible]);
  useEffect(() => {
    if (!isStartedAudio || isMuted) {
      setAudioEncodingStatistic({ ...AudioQosDataShape, timestamp: Date.now() });
    }
  }, [isStartedAudio, isMuted]);
  useEffect(() => {
    if (!isStartedVideo) {
      setVideoEncodingStatistic({ ...VideoQosDataShape, timestamp: Date.now() });
    }
  }, [isStartedVideo]);
  useEffect(() => {
    if (defaultTab) {
      setTab(defaultTab);
    }
  }, [defaultTab]);
  useMount(() => {
    if (mediaStream) {
      const { encode: audioEncoding, decode: audioDecoding } = mediaStream.getAudioStatisticData();
      const { encode: videoEncoding, decode: videoDecoding } = mediaStream.getVideoStatisticData();
      setAudioDecodingStatistic({ ...audioDecoding, timestamp: Date.now() });
      setAudioEncodingStatistic({ ...audioEncoding, timestamp: Date.now() });
      setVideoDecodingStatistic({ ...videoDecoding, timestamp: Date.now() });
      setVideoEncodingStatistic({ ...videoEncoding, timestamp: Date.now() });
    }
  });

  const checkQos = useCallback(() => {
    const now = Date.now();
    [
      audioEncodingStatistic,
      audioDecodingStatistic,
      videoEncodingStatistic,
      videoDecodingStatistic,
      shareEncodingStatistic,
      shareDecodingStatistic
    ].forEach((item, index) => {
      if (item?.timestamp !== 0 && now - (item?.timestamp) > 2000) {
        switch (index) {
          case 0:
            setAudioEncodingStatistic(AudioQosDataShape);
            break;
          case 1:
            setAudioDecodingStatistic(AudioQosDataShape);
            break;
          case 2:
            setVideoEncodingStatistic(VideoQosDataShape);
            break;
          case 3:
            setVideoDecodingStatistic(VideoQosDataShape);
            break;
          case 4:
            setShareEncodingStatistic(VideoQosDataShape);
            break;
          default:
            setShareDecodingStatistic(VideoQosDataShape);
        }
      }
    });
  }, [
    audioEncodingStatistic,
    audioDecodingStatistic,
    videoEncodingStatistic,
    videoDecodingStatistic,
    shareEncodingStatistic,
    shareDecodingStatistic
  ]);
  useEffect(() => {
    checkQos();
    clearInterval(timerRef.current);
    timerRef.current = window.setInterval(checkQos, 3000);
    return () => clearInterval(timerRef.current);
  }, [
    audioEncodingStatistic,
    audioDecodingStatistic,
    videoEncodingStatistic,
    videoDecodingStatistic,
    shareEncodingStatistic,
    shareDecodingStatistic,
    checkQos
  ]);

  const AudioComponet =()=> <TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Item Name</TableCell>
        <TableCell>Send</TableCell>
        <TableCell>Receive</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {audioDataSource.map((row) => (
        <TableRow key={row.key}>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.send}</TableCell>
          <TableCell>{row.receive}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>;
const ShareComponent = ()=> <TableContainer>
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Item Name</TableCell>
      <TableCell>Send</TableCell>
      <TableCell>Receive</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {shareDataSource.map((row) => (
      <TableRow key={row.key}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.send}</TableCell>
        <TableCell>{row.receive}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
</TableContainer>;
const VideoComponent = ()=><TableContainer>
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Item Name</TableCell>
      <TableCell>Send</TableCell>
      <TableCell>Receive</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {videoDataSource.map((row) => (
      <TableRow key={row.key}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.send}</TableCell>
        <TableCell>{row.receive}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
</TableContainer>;
  const  data = [
    {
      label: 'Audio',
      component: AudioComponet,
    },
    {
      label: 'Video',
      component: VideoComponent,
    },
    {
      label: 'Share',
      component: ShareComponent,
    },
  ]
  
  return (
      <Dialog open={visible} onClose={() => setVisible(false)} maxWidth="md" fullWidth>
        <Box p={2}>
        <Tabs
      data={data}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />

        </Box>
      </Dialog>
  );
};

export default AudioVideoStatisticModal;
