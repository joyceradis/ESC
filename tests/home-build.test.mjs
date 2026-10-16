import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const render = notes => execFileSync('python3', ['-c',
  'import json,sys; from build import home_latest_note; print(home_latest_note(json.loads(sys.argv[1])))', JSON.stringify(notes)
], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });

test('Retomada mostra apenas a nota mais recente, mesmo com entrada fora de ordem', () => {
  const html = render([
    { id: 'antiga', date: '2026-10-01', title: 'Nota antiga' },
    { id: 'nova', date: '2026-10-11', title: 'Nota mais recente' },
    { id: 'intermediaria', date: '2026-10-05', title: 'Nota intermediária' }
  ]);
  assert.match(html, /Nota mais recente/);
  assert.match(html, /datetime="2026-10-11"/);
  assert.match(html, /11\/10\/2026/);
  assert.doesNotMatch(html, /Nota antiga|Nota intermediária/);
});

test('Retomada mantém um estado vazio legível, sem inventar estudo ou nota', () => {
  const html = render([]);
  assert.match(html, /próxima nota curada/);
  assert.doesNotMatch(html, /<time|home-note-title/);
});

test('Título de nota é texto escapado, nunca HTML executável', () => {
  const html = render([{ id: 'escape', date: '2026-10-11', title: '<img src=x onerror=alert(1)> & "teste"' }]);
  assert.doesNotMatch(html, /<img|<script/);
  assert.match(html, /&lt;img/);
  assert.match(html, /&amp;/);
  assert.match(html, /&quot;teste&quot;/);
});

test('Home construída carrega o painel Seu estado e seus scripts', () => {
  const html = execFileSync('python3', ['-c', 'import pathlib;print(pathlib.Path("index.html").read_text())'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.match(html, /id="home-estado"/);
  assert.match(html, /assets\/js\/rota\.js/);
  assert.match(html, /assets\/js\/home-estado\.js/);
});
