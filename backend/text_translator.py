from google.cloud import translate_v2 as translate
import os
from dotenv import load_dotenv

load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./service-account.json"

translate_client = translate.Client()

def translate_text_input(text, target_lang, source_lang="auto"):
    """
    Translates given text from source language to target language using Google Translate API.
    If source_lang is 'auto', Google will auto-detect the language.
    """
    if not text.strip():
        return {"error": "Empty text input."}

    target_lang = target_lang.split("-")[0]  # Normalize (e.g., "fr-FR" → "fr")
    source_lang = source_lang.split("-")[0] if source_lang != "auto" else None

    result = translate_client.translate(
        text,
        target_language=target_lang,
        source_language=source_lang  # None triggers auto-detect
    )

    return {
        "input": text,
        "translated": result["translatedText"],
        "target_language": target_lang,
        "detected_language": result.get("detectedSourceLanguage", source_lang or "unknown")
    }