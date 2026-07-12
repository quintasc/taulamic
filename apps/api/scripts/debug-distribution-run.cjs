const eventId = process.argv[2] ?? 'evt_6785f9f4-f668-430f-957e-a2e073424ac5';
const apiBase = process.env.API_BASE ?? 'http://localhost:3000/api/v1';

async function main() {
  const started = Date.now();
  const response = await fetch(`${apiBase}/events/${eventId}/distribution/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-actor-role': 'admin',
    },
    body: JSON.stringify({
      softRules: ['groupByCategory', 'keepFamiliesTogether'],
    }),
  });

  const elapsed = Date.now() - started;
  const text = await response.text();

  console.log('status', response.status, 'elapsedMs', elapsed);
  console.log(text.slice(0, 2000));

  if (!response.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('FALLO:', error);
  process.exit(1);
});
