from api.src.app import app


def test_dataset_lookup_endpoint():
    client = app.test_client()
    # missing q
    assert client.get('/api/dataset/lookup').status_code == 400
    # not found
    assert client.get('/api/dataset/lookup?q=__nope__').status_code == 404
    # found
    rv = client.get('/api/dataset/lookup?q=raigarh')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['found'] is True
    assert data['record']['canonical']

