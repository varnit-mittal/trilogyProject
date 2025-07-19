import queue
import os
import pyaudio
from google.cloud import speech, translate_v2 as translate
import google.generativeai as genai

# Audio config
RATE = 16000
CHUNK = int(RATE / 10)
POSSIBLE_LANGUAGES = [
    "en-US", "hi-IN", "es-ES", "fr-FR", "de-DE", "ta-IN", "te-IN", "ar-SA", "zh", "ja-JP"
]

# Mapping short language codes to BCP-47
LANGUAGE_CODE_MAP = {
    "en": "en-US",
    "hi": "hi-IN",
    "es": "es-ES",
    "fr": "fr-FR",
    "de": "de-DE",
    "ta": "ta-IN",
    "te": "te-IN",
    "ar": "ar-SA",
    "zh": "zh",
    "ja": "ja-JP"
}

def normalize_lang(code):
    return LANGUAGE_CODE_MAP.get(code, code)

# Setup credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class MicrophoneStream:
    def __init__(self, rate, chunk):
        self._rate = rate
        self._chunk = chunk
        self._buff = queue.Queue()
        self.closed = True

    def __enter__(self):
        self._audio_interface = pyaudio.PyAudio()
        self._audio_stream = self._audio_interface.open(
            format=pyaudio.paInt16, channels=1,
            rate=self._rate, input=True, frames_per_buffer=self._chunk,
            stream_callback=self._fill_buffer,
        )
        self.closed = False
        return self

    def __exit__(self, *_):
        self._audio_stream.stop_stream()
        self._audio_stream.close()
        self.closed = True
        self._buff.put(None)
        self._audio_interface.terminate()

    def _fill_buffer(self, in_data, *_):
        self._buff.put(in_data)
        return None, pyaudio.paContinue

    def generator(self):
        while not self.closed:
            chunk = self._buff.get()
            if chunk is None:
                break
            yield chunk

def translate_text(text, source_lang, target_lang, client):
    src = source_lang.split("-")[0]
    tgt = target_lang.split("-")[0]
    if src == tgt:
        return text
    return client.translate(text, source_language=src, target_language=tgt)["translatedText"]

def stream_transcription(target_lang="en-US", source_lang="auto"):
    client = speech.SpeechClient()
    translate_client = translate.Client()

    # Normalize
    target_lang = normalize_lang(target_lang)
    if source_lang != "auto":
        source_lang = normalize_lang(source_lang)

    # Configure recognition
    if source_lang == "auto":
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=RATE,
            language_code="hi-IN",  # temporary base for auto
            alternative_language_codes=POSSIBLE_LANGUAGES,
            enable_automatic_punctuation=True,
            # safest fallback model
            model="latest_long",
        )
        lang_code_used = "hi-IN"
    else:
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=RATE,
            language_code=source_lang,
            enable_automatic_punctuation=True,
            model="default",  # safer than 'latest_long'
        )
        lang_code_used = source_lang

    streaming_config = speech.StreamingRecognitionConfig(
        config=config, interim_results=True
    )

    results = []

    def listen_loop(responses):
        for response in responses:
            if not response.results:
                continue
            result = response.results[0]
            if result.is_final and result.alternatives:
                transcript = result.alternatives[0].transcript
                lang = lang_code_used
                translation = translate_text(transcript, lang, target_lang, translate_client)
                results.append({
                    "transcript": transcript,
                    "lang": lang,
                    "translated": translation,
                    "target": target_lang
                })
                break

    with MicrophoneStream(RATE, CHUNK) as stream:
        audio_generator = stream.generator()
        requests = (speech.StreamingRecognizeRequest(audio_content=chunk) for chunk in audio_generator)
        responses = client.streaming_recognize(streaming_config, requests)
        listen_loop(responses)

    return results[0] if results else None