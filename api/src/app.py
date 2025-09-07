import os
import json
import uuid
from flask import Flask, jsonify, request
from .parsing.normalization import normalize_tokens


def create_app() -> Flask:
  app = Flask(__name__)

  @app.get('/api/health')
  def health():
    return jsonify({
      'status': 'ok',
      'traceId': str(uuid.uuid4()),
      'flags': {
        'FLAG_ALIAS_LOADER': os.getenv('FLAG_ALIAS_LOADER', 'on'),
        'FLAG_PARSE_ENGINE': os.getenv('FLAG_PARSE_ENGINE', 'on'),
      },
    })

  @app.post('/api/normalize')
  def normalize():
    payload = request.get_json(silent=True) or {}
    text = (payload.get('text') or '').strip()
    tokens = payload.get('tokens') or []
    result = normalize_tokens(text=text, tokens=tokens)
    return jsonify({
      'traceId': str(uuid.uuid4()),
      'input': {'text': text, 'tokens': tokens},
      'normalized': result,
    })

  @app.get('/api/aliases')
  def get_aliases():
    # Stub: will load from data/aliases.json in later tasks
    return jsonify({'version': 1, 'aliases': {}})

  @app.post('/api/aliases/reload')
  def reload_aliases():
    # Stubbed endpoint for hot reload; guarded by flag in later tasks
    return jsonify({'reloaded': True, 'traceId': str(uuid.uuid4())})

  return app


app = create_app()

