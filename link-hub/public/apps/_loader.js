(() => {
  const script = document.currentScript;
  const files = (script.dataset.payloads || '').split(',').filter(Boolean);
  const payloadGlobal = script.dataset.payloadGlobal || '';
  const status = document.getElementById('app-status');

  (async () => {
    if (!('DecompressionStream' in window)) {
      throw new Error('Dieser Browser unterstützt die benötigte Dekompression nicht.');
    }

    const embeddedParts = payloadGlobal && Array.isArray(globalThis[payloadGlobal])
      ? globalThis[payloadGlobal]
      : [];
    const parts = embeddedParts.length
      ? embeddedParts
      : await Promise.all(files.map(async file => {
          const response = await fetch(file, { cache: 'no-store' });
          if (!response.ok) {
            throw new Error(`Seitendaten ${file} konnten nicht geladen werden (${response.status}).`);
          }
          return (await response.text()).trim();
        }));

    if (!parts.length) throw new Error('Keine Seitendaten konfiguriert.');
    const binary = atob(parts.join(''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const html = await new Response(stream).text();
    document.open();
    document.write(html);
    document.close();
  })().catch(error => {
    console.error(error);
    if (status) {
      status.innerHTML = `<strong>Seite konnte nicht geladen werden.</strong><br>${String(error.message || error)}`;
      status.style.color = '#b42318';
    }
  });
})();
