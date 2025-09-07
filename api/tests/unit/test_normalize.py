from api.src.app import app


def test_normalize_echo_tokens_and_text():
    client = app.test_client()
    payload = {
        'text': 'दिल्ली में बैठक',
        'tokens': ['#बैठक', 'दिल्ली']
    }
    rv = client.post('/api/normalize', json=payload)
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['input']['text'] == payload['text']
    n = data['normalized']
    assert '#बैठक' in n
    assert 'दिल्ली' in n

