from flask import Flask, jsonify, request
from flask_cors import CORS
from text_translator import translate_text_input
from translator import stream_transcription
import tempfile
from pydub import AudioSegment

from google.cloud import translate_v2 as translate
from google.cloud import speech
import os
from dotenv import load_dotenv

# Load credentials
load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

app = Flask(__name__)
translate_client = translate.Client()
speech_client = speech.SpeechClient() # Add speech client

app = Flask(__name__)
CORS(app)

# NEW ENDPOINT: To handle audio file from Chrome Extension
@app.route('/api/translate-audio', methods=['POST'])
def translate_audio():
    try:
        audio_file = request.files['audio']
        target_lang = request.form.get('target', 'es')

        # Save chunk to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
            audio_file.save(temp.name)
            audio_path = temp.name

        print(f"Processing chunk: {audio_path}")

        # Transcribe using Google Speech-to-Text
        with open(audio_path, 'rb') as f:
            audio_content = f.read()

        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code='en-US'  # or auto-detect if needed
        )

        response = speech_client.recognize(config=config, audio=audio)

        if not response.results:
            print("No speech detected.")
            return '', 204

        transcript = response.results[0].alternatives[0].transcript
        print(f"Transcript: {transcript}")

        # Translate
        translation = translate_client.translate(transcript, target_language=target_lang)['translatedText']
        print(f"Translation: {translation}")

        return jsonify({"translation": translation})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"translation": ""}), 200

    except Exception as e:
        print(f"Error in /api/translate-audio: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/translate-speech', methods=['GET'])
def translate_speech():
    try:
        target_lang = request.args.get('target', default="en-US")
        source_lang = request.args.get('source', default="auto")  # can be 'auto' or something like 'hi-IN'

        result = stream_transcription(target_lang=target_lang, source_lang=source_lang)

        if result:
            return jsonify({
                "status": "success",
                "transcript": result["transcript"],
                "source_language": result["lang"],
                "target_language": result["target"],
                "translation": result["translated"]
            }), 200
        else:
            return jsonify({"status": "no_speech_detected"}), 204
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/api/translate-text', methods=['POST'])
def translate_text_api():
    try:
        data = request.get_json()
        text = data.get("text", "")
        target = data.get("target", "en")
        source = data.get("source", "auto")  # Default to auto-detection

        if not text:
            return jsonify({"status": "error", "message": "No text provided."}), 400

        result = translate_text_input(text, target, source)

        if "error" in result:
            return jsonify({"status": "error", "message": result["error"]}), 400

        return jsonify({
            "status": "success",
            "input": result["input"],
            "detected_language": result["detected_language"],
            "target_language": result["target_language"],
            "translation": result["translated"]
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)