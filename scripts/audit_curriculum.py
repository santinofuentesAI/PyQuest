"""Validate every challenge and execute reference programs in isolated namespaces.
Run: python scripts/audit_curriculum.py [--runtime]
Runtime checks need numpy, pandas, matplotlib, scipy, scikit-learn and seaborn.
"""
import argparse
import contextlib
import io
import json
import math
import os
from pathlib import Path
import signal
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def output_matches(got, expected, numeric=False):
    got, expected = got.strip(), expected.strip()
    if got == expected:
        return True
    if not numeric:
        return False
    a, b = got.splitlines(), expected.splitlines()
    try:
        return len(a) == len(b) and all(math.isfinite(float(x)) and math.isfinite(float(y)) and abs(float(x) - float(y)) <= 1e-9 * max(1, abs(float(y))) for x, y in zip(a, b))
    except ValueError:
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--runtime', action='store_true')
    args = parser.parse_args()
    curriculum = json.loads((ROOT / 'src/content/curriculum.json').read_text())
    exercises = [e for s in curriculum['sections'] for u in s['units'] for l in u['lessons'] for e in l['exercises']]
    errors, ids = [], set()
    counts = {'exercises': len(exercises), 'reference_programs': 0, 'trace_checkpoints': 0}
    if args.runtime:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(TimeoutError('Reference took over 15 seconds')))
    for e in exercises:
        eid = e['id']
        try:
            assert eid not in ids, 'Duplicate exercise ID'
            ids.add(eid)
            assert e['prompt'].strip() and e['explanation'].strip() and e['solution'].strip(), 'Missing learning content'
            if e['type'] == 'fill_blank':
                assert e['template'].count('___') == len(e['blanks']) > 0, 'Each blank needs a placeholder'
                assert all(b['accepted'] and all(x.strip() for x in b['accepted']) for b in e['blanks']), 'Empty accepted answer'
            if e['type'] in ('multiple_choice', 'find_error'):
                choices = {c['id'] for c in e['choices']}
                assert len(choices) == len(e['choices']), 'Duplicate choice'
                assert e['correctChoiceId'] in choices, 'Missing correct choice'
            if e['type'] == 'matching':
                left, right = {x['id'] for x in e['left']}, {x['id'] for x in e['right']}
                assert set(e['pairs']) == left, 'Incomplete matching keys'
                assert set(e['pairs'].values()) == right and len(left) == len(right), 'Invalid matching targets'
            if e['type'] in ('reorder', 'token_order'):
                blocks = {x['id']: x['code'] for x in e['blocks']}
                assert len(blocks) == len(e['blocks']), 'Duplicate block'
                assert len(e['correctOrder']) == len(blocks) and set(e['correctOrder']) == set(blocks), 'Invalid ordering'
                if e['type'] == 'token_order':
                    assert ''.join(blocks[x] for x in e['correctOrder']) == e['solution'], 'Token solution mismatch'
            if e['type'] == 'trace':
                assert e['traceSteps'], 'Empty trace'
                for step in e['traceSteps']:
                    assert 1 <= step['line'] <= len(e['starterCode'].splitlines()), 'Trace line out of range'
                    assert step['correctChoiceId'] in {x['id'] for x in step['choices']}, 'Missing checkpoint answer'
            if not args.runtime or e['type'] not in ('code', 'data', 'predict_output', 'trace'):
                continue
            with tempfile.TemporaryDirectory() as tmp:
                old = os.getcwd()
                os.chdir(tmp)
                try:
                    for name, data in e.get('files', {}).items():
                        path = Path(name)
                        assert not path.is_absolute() and '..' not in path.parts, 'Unsafe dataset path'
                        path.parent.mkdir(parents=True, exist_ok=True)
                        path.write_text(data)
                    program = e['starterCode'] if e['type'] in ('predict_output', 'trace') else e['solution']
                    signal.alarm(15)
                    if e['type'] == 'trace':
                        for step in e['traceSteps']:
                            ns, out = {'__name__': '__main__'}, io.StringIO()
                            prefix = '\n'.join(program.splitlines()[:step['line']])
                            with contextlib.redirect_stdout(out):
                                exec(compile(prefix, eid, 'exec'), ns)
                            ns['__stdout__'] = out.getvalue()
                            exec('assert ' + step['assert'], ns)
                            counts['trace_checkpoints'] += 1
                    else:
                        ns, out = {'__name__': '__main__'}, io.StringIO()
                        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(io.StringIO()):
                            exec(compile(program, eid, 'exec'), ns)
                            # Check user stdout before tests, which may themselves print.
                            stdout = out.getvalue()
                            for test in e.get('tests', []):
                                exec(test.get('setup', ''), ns)
                                exec('assert ' + test['assert'].removeprefix('assert '), ns)
                        if e['type'] == 'predict_output':
                            expected = e.get('acceptedOutputs', [e.get('expectedStdout', '')])
                            assert any(output_matches(stdout, x, e.get('outputComparison') == 'numeric') for x in expected), f'Prediction mismatch: {stdout!r} vs {expected!r}'
                        elif 'expectedStdout' in e:
                            assert output_matches(stdout, e['expectedStdout'], e.get('outputComparison') == 'numeric'), f'Output mismatch: {stdout!r} vs {e["expectedStdout"]!r}'
                        counts['reference_programs'] += 1
                finally:
                    signal.alarm(0)
                    plt.close('all')
                    os.chdir(old)
        except Exception as err:
            errors.append({'id': eid, 'error': f'{type(err).__name__}: {err}'})
    print(json.dumps({'checks': counts, 'errors': errors}, indent=2, ensure_ascii=False))
    raise SystemExit(bool(errors))


if __name__ == '__main__':
    main()
