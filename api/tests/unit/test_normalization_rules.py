from api.src.parsing.normalization import normalize_tokens, fold_nukta, translit_basic


def norm(text='', tokens=None):
    return normalize_tokens(text=text, tokens=tokens or [])


def test_nukta_folding():
    assert fold_nukta('ज़िला') == 'जिला'


def test_transliteration_with_matras():
    # समारोह -> should yield a latin variant close to 'samaroh'
    lat = translit_basic('समारोह').lower()
    assert 'sa' in lat or 'samar' in lat


def test_hinglish_loosen_swachhata():
    out = norm(tokens=['स्वच्छता'])
    variants = out['स्वच्छता']
    # Allow swachhata/swachhta/swachata variants
    joined = ' '.join(variants)
    assert 'swachhata' in joined or 'swachhta' in joined or 'swachata' in joined


def test_schwa_variants_sammilit_partial():
    out = norm(tokens=['सम्मिलित'])
    joined = ' '.join(out['सम्मिलित'])
    # Expect 'sammilit' or close, and partial 'sammi' substring present
    assert 'sammi' in joined

