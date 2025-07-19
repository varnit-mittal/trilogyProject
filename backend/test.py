import os
import wave
import pyaudio
import tempfile
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

RATE = 16000
CHUNK = 1024
RECORD_SECONDS = 5  # capture 5 seconds of speech

def record_audio_to_tempfile():
    audio = pyaudio.PyAudio()
    stream = audio.open(format=pyaudio.paInt16, channels=1,
                        rate=RATE, input=True,
                        frames_per_buffer=CHUNK)

    print("🎙️ Recording audio for language detection...")
    frames = []

    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("✅ Recording complete.")

    stream.stop_stream()
    stream.close()
    audio.terminate()

    # Save to temp WAV file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    with wave.open(temp_file.name, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))

    return temp_file.name

def detect_language_from_audio(audio_file_path):
    # The model name you were using seems to be for a specific preview.
    # "gemini-1.5-flash" is a more standard and current model that handles multimodal input.
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = (
        "Detect the language spoken in the given audio. "
        "Reply with only the language name in BCP-47 format like 'hi-IN' or 'en-US'. "
        "Return only the language code, no explanation."
    )

    # Upload the file to the File API
    uploaded_file = genai.upload_file(path=audio_file_path, mime_type="audio/wav")

    # Pass the uploaded file object to the model
    response = model.generate_content([prompt, uploaded_file])
    
    return response.text.strip()

if __name__ == "__main__":
    audio_path = record_audio_to_tempfile()
    try:
        language = detect_language_from_audio(audio_path)
        print("🌐 Detected Language:", language)
    finally:
        # Clean up the temporary file
        os.remove(audio_path)