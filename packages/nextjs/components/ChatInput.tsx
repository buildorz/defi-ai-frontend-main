import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import record from "./assets/record.png";
import send1 from "./assets/right.svg";
import { AiOutlineSend } from "react-icons/ai";
import { CiMicrophoneOn } from "react-icons/ci";

type ChatInputProps = {
  sendBtnHandler: (audioBlob: Blob | null, textInput: string | null) => void;
  setIsMessageLoading: (loading: boolean) => void;
};

type ChatInputRef = {
  clearCanvas: () => void;
};

const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({ sendBtnHandler, setIsMessageLoading }, ref) => {
  const [textInput, setTextInput] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [showRecordingDuration, setShowRecordingDuration] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const animationFrame = useRef<number | null>(null);
  const recordingStartTime = useRef<number | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const audioElement = useRef<HTMLAudioElement>(typeof window !== "undefined" ? new Audio() : null);

  // Expose clearCanvas method to parent components
  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      setAudioBlob(null);
      setVisualizerData([]);
      setShowRecordingDuration(false);
    },
  }));

  // Clean up resources on component unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  // Start audio recording
  const startRecording = async () => {
    console.log("Starting recording...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext.current = new AudioContext();
    analyser.current = audioContext.current.createAnalyser();
    const source = audioContext.current.createMediaStreamSource(stream);
    source.connect(analyser.current);

    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = event => {
      setAudioBlob(event.data);
    };
    mediaRecorder.current.start();

    setIsRecording(true);
    visualize();
    recordingStartTime.current = Date.now();
    recordingInterval.current = setInterval(() => {
      setRecordingDuration((Date.now() - recordingStartTime.current!) / 1000);
    }, 1000);
  };
  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (recordingInterval.current !== null) {
        clearInterval(recordingInterval.current);
      }
      setShowRecordingDuration(true);
    }
  };

  // Cancel recording and reset states
  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setShowRecordingDuration(false);
    setRecordingDuration(0);
  };

  // Play recorded audio
  const playRecording = () => {
    if (audioBlob && audioElement.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioElement.current.src = audioUrl;
      audioElement.current.play();
      setIsPlaying(true);

      audioElement.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };
  // Pause audio playback
  const pausePlayback = () => {
    if (audioElement.current) {
      audioElement.current.pause();
      setIsPlaying(false);
    }
  };

  // Visualize audio data
  const visualize = () => {
    if (!analyser.current) return;

    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    analyser.current.getByteFrequencyData(dataArray);

    const normalizedData = Array.from(dataArray).map(val => val / 255);
    setVisualizerData(normalizedData.slice(0, 50));

    animationFrame.current = requestAnimationFrame(visualize);
  };

  // Handle sending input (text or audio)
  const handleSendInput = () => {
    if (audioBlob) {
      sendBtnHandler(audioBlob, null);
      setAudioBlob(null);
      setShowRecordingDuration(false);
    } else if (textInput !== "") {
      sendBtnHandler(null, textInput);
      setTextInput("");
    }
  };

  // Handle 'Enter' key press for sending text input
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && textInput !== "") {
      handleSendInput();
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Render component
  return (
    <div className="flex justify-between items-center border border-white/50 rounded-[10px] px-5">
      {" "}
      <div className="flex w-full items-center space-x-2">
        {!isRecording && !showRecordingDuration ? (
          <input
            type="text"
            onChange={e => setTextInput(e.target.value)}
            value={textInput}
            className="w-full bg-transparent outline-none text-[#8E8E8E] placeholder:text-white/70 placeholder:font-medium px-6 h-[48px] md:h-[54px]"
            placeholder="Type here..."
            onKeyDown={handleKeyDown}
          />
        ) : isRecording ? (
          // Recording in progress
          <div className="flex-grow h-[48px] md:h-[54px] border-[1.5px] border-[#8E8E8E] rounded-[16px] md:rounded-[20px] bg-transparent flex items-center px-4">
            {/* Audio visualizer */}
            <div className="flex-grow h-8 flex  items-center">
              {visualizerData.map((value, index) => (
                <div
                  key={index}
                  className="md:w-1 w-full bg-[#8E8E8E] md:mx-px"
                  style={{ height: `${value * 100}%` }}
                ></div>
              ))}
            </div>
            {/* Recording duration */}
            <span className="text-white mr-2">{formatDuration(recordingDuration)}</span>
            {/* Stop recording button */}
            <button onClick={stopRecording} className="ml-2 text-white p-2 rounded-full hover:bg-[#202020]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          // Recording finished, ready to send or play
          <div className="flex-grow h-[48px] md:h-[54px] border-[1.5px] border-[#8E8E8E] rounded-[16px] md:rounded-[20px] bg-transparent flex items-center px-4 justify-between">
            <span className="text-white mr-2">Voice message: {formatDuration(recordingDuration)}</span>

            <div>
              {/* Play/Pause button */}
              <button
                onClick={isPlaying ? pausePlayback : playRecording}
                className="ml-2 text-white p-2 rounded-full hover:bg-[#202020]"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              {/* Cancel recording button */}
              <button onClick={cancelRecording} className="ml-2 text-white p-2 rounded-full hover:bg-[#202020]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-5">
        {/* Record button */}
        <CiMicrophoneOn className="text-[#8f259b] text-[25px]" onClick={startRecording} />

        {/* Send button */}
        <AiOutlineSend
          className={`text-[#8f259b] text-[25px] ${
            audioBlob || textInput !== "" ? "cursor-pointer " : "cursor-not-allowed "
          } transition-colors duration-200`}
          onClick={() => {
            setIsMessageLoading(true);
            handleSendInput();
          }}
          aria-disabled={!audioBlob && textInput === ""}
        />
      </div>
    </div>
  );
});

export default ChatInput;
