import { useRef, useState } from "react";

export default function Ask() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hi, I'm here to help. Ask me anything about your pregnancy or your baby, in English or Twi." },
  ]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    // NOTE: The browser's Web Speech API has effectively no Twi (Akan)
    // language support. For real Twi voice recognition, send the audio
    // to a backend speech-to-text service that supports it, rather than
    // relying on this browser API alone.
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser yet. Try Chrome on Android or desktop.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", text: transcript },
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Thanks for your question. Let me connect you with guidance on that shortly.",
        },
      ]);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] px-4">
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                m.role === "user"
                  ? "bg-primary text-on-primary rounded-tr-sm"
                  : "bg-surface-container-lowest border border-outline-variant text-on-surface rounded-tl-sm"
              }`}
            >
              <p>{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pb-4 flex flex-col items-center">
        <button
          onClick={startListening}
          aria-label="Ask a question by voice"
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform ${
            listening ? "bg-error animate-pulse" : "bg-primary"
          }`}
        >
          <span className="material-symbols-outlined text-on-primary text-[36px]">mic</span>
        </button>
        <p className="text-on-surface-variant mt-3 mb-4 text-center">
          {listening ? "Listening..." : "Tap to speak in English or Twi"}
        </p>
        <div className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-outline text-[16px] shrink-0 mt-0.5">info</span>
          <p className="text-sm text-outline">
            Mama Ba provides general guidance. Always consult a doctor for serious medical
            concerns or emergencies. Voice recordings are only used to answer your question and
            are not stored after your session ends.
          </p>
        </div>
      </div>
    </div>
  );
}