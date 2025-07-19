from flask import Flask, jsonify, request
from flask_cors import CORS
from text_translator import translate_text_input
from translator import stream_transcription

from google.cloud import translate_v2 as translate
import os
from dotenv import load_dotenv

# Load credentials
load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

app = Flask(__name__)
translate_client = translate.Client()

app = Flask(__name__)
CORS(app)
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