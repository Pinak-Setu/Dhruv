import os
import json
import uuid
from flask import Flask, jsonify, request
from .parsing.normalization import normalize_tokens
from .parsing.alias_loader import load_aliases, AliasIndex


ALIAS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'aliases.json')
_ALIASES: AliasIndex | None = None


def _ensure_aliases():
  global _ALIASES
  if _ALIASES is None and os.getenv('FLAG_ALIAS_LOADER', 'on') != 'off':
    try:
      _ALIASES = load_aliases(ALIAS_PATH)
    except Exception:
      _ALIASES = None


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
    _ensure_aliases()
    return jsonify({
      'traceId': str(uuid.uuid4()),
      'input': {'text': text, 'tokens': tokens},
      'normalized': result,
      'aliasesVersion': getattr(_ALIASES, 'version', None),
    })

  @app.get('/api/aliases')
  def get_aliases():
    _ensure_aliases()
    if _ALIASES is None:
      return jsonify({'version': None, 'aliases': {}})
    return jsonify({'version': _ALIASES.version, 'tags': _ALIASES.tags, 'locations': _ALIASES.locations})

  @app.post('/api/aliases/reload')
  def reload_aliases():
    if os.getenv('FLAG_ALIAS_LOADER', 'on') == 'off':
      return jsonify({'reloaded': False, 'disabled': True}), 400
    try:
      global _ALIASES
      _ALIASES = load_aliases(ALIAS_PATH)
      return jsonify({'reloaded': True, 'version': _ALIASES.version, 'traceId': str(uuid.uuid4())})
    except Exception as e:
      return jsonify({'reloaded': False, 'error': str(e)}), 500

  return app


app = create_app()
