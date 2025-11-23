// Minimal browser-friendly SDK module for the prototype server
// Usage (browser / node with fetch):
//   const sdk = Plotline.initialize({ baseUrl: 'http://localhost:4000' });
//   sdk.identify('user_123', { user_tier: 'Gold' });
//   sdk.track('Checkout_Started', { cart_total: 150 });
//   sdk.fetchCampaigns('user_123').then(c => console.log(c));

export const Plotline = (function () {
  let baseUrl = 'http://localhost:4000';
  let apiKey = null;

  function setConfig({ baseUrl: b, apiKey: k } = {}) {
    if (b) baseUrl = b;
    if (k) apiKey = k;
  }

  async function identify(userId, traits = {}) {
    const body = { user_id: userId, traits };
    await fetch(`${baseUrl}/v1/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async function track(userId, event, properties = {}) {
    const body = { user_id: userId, event, properties };
    const resp = await fetch(`${baseUrl}/v1/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return resp.json();
  }

  async function fetchCampaigns(userId) {
    const resp = await fetch(`${baseUrl}/v1/campaigns?user_id=${encodeURIComponent(userId)}`);
    return resp.json();
  }

  return {
    initialize: (opts) => (setConfig(opts), { identify, track, fetchCampaigns }),
    identify,
    track,
    fetchCampaigns,
  };
})();
