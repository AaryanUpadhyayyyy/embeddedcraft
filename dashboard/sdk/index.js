// Re-export the plotline SDK implementation
const plotline = require('./plotline.js');

module.exports = plotline.Plotline ? plotline.Plotline : plotline;

// Admin API functions for campaign builder integration
const DEFAULT_BASE = 'http://localhost:4000';

function baseUrl() {
  if (typeof window !== 'undefined') {
    const env = (import.meta || {}).env || {};
    return env.VITE_API_URL || DEFAULT_BASE;
  }
  return process.env.API_URL || DEFAULT_BASE;
}

let apiKey = null;

function setApiKey(key) {
  apiKey = key;
}

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Campaign CRUD operations
async function saveCampaign(campaign) {
  const url = campaign.id 
    ? `${baseUrl()}/v1/admin/campaigns/${campaign.id}`
    : `${baseUrl()}/v1/admin/campaigns`;
  
  const method = campaign.id ? 'PUT' : 'POST';
  
  const response = await fetch(url, {
    method,
    headers: getHeaders(),
    body: JSON.stringify(campaign),
  });
  
  return handleResponse(response);
}

async function loadCampaign(campaignId) {
  const response = await fetch(`${baseUrl()}/v1/admin/campaigns/${campaignId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

async function listCampaigns(options = {}) {
  const { limit = 20, offset = 0 } = options;
  const response = await fetch(
    `${baseUrl()}/v1/admin/campaigns?limit=${limit}&offset=${offset}`,
    { headers: getHeaders() }
  );
  return handleResponse(response);
}

async function deleteCampaign(campaignId) {
  const response = await fetch(`${baseUrl()}/v1/admin/campaigns/${campaignId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const headers = {};
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetch(`${baseUrl()}/v1/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  return handleResponse(response);
}

// Export admin API
if (typeof window !== 'undefined') {
  window.CampaignAPI = {
    setApiKey,
    saveCampaign,
    loadCampaign,
    listCampaigns,
    deleteCampaign,
    uploadImage,
  };
}

module.exports.CampaignAPI = {
  setApiKey,
  saveCampaign,
  loadCampaign,
  listCampaigns,
  deleteCampaign,
  uploadImage,
};
