const API_BASE_URL = window.API_BASE_URL || '/api';
const STORAGE_KEY = 'techcorp-chat-history-v1';

const statusDot = document.querySelector('#statusDot');
const statusLabel = document.querySelector('#statusLabel');
const modelLabel = document.querySelector('#modelLabel');
const messagesContainer = document.querySelector('#messages');
const chatForm = document.querySelector('#chatForm');
const messageInput = document.querySelector('#messageInput');
const sendButton = document.querySelector('#sendButton');
const healthButton = document.querySelector('#healthButton');
const clearButton = document.querySelector('#clearButton');
const promptChips = document.querySelectorAll('.prompt-chip');

let history = loadHistory();
let isSending = false;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30)));
}

function setStatus(state, label, model = 'inconnu') {
  statusDot.className = 'status-dot';
  statusDot.classList.add(state === 'online' ? 'status-online' : state === 'warning' ? 'status-warning' : 'status-offline');
  statusLabel.textContent = label;
  modelLabel.textContent = `Modèle : ${model || 'inconnu'}`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatContent(content) {
  return escapeHtml(content).replaceAll('\n', '<br />');
}

function renderMessages() {
  messagesContainer.innerHTML = '';

  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <h2>Prêt pour la démonstration</h2>
      <p>Pose une question financière. L'historique local sera envoyé au backend pour conserver le contexte court.</p>
    `;
    messagesContainer.appendChild(empty);
    return;
  }

  for (const message of history) {
    const bubble = document.createElement('article');
    bubble.className = `message message-${message.role}`;
    bubble.innerHTML = `
      <div class="message-role">${message.role === 'user' ? 'Utilisateur' : 'Assistant'}</div>
      <div class="message-content">${formatContent(message.content)}</div>
    `;
    messagesContainer.appendChild(bubble);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addMessage(role, content) {
  history.push({ role, content });
  history = history.slice(-30);
  saveHistory();
  renderMessages();
}

function setSending(value) {
  isSending = value;
  sendButton.disabled = value;
  messageInput.disabled = value;
  sendButton.textContent = value ? 'Envoi...' : 'Envoyer';
}

function showLoading() {
  const bubble = document.createElement('article');
  bubble.id = 'loading-indicator';
  bubble.className = 'message message-assistant';
  bubble.innerHTML = `
    <div class="message-role">Assistant</div>
    <div class="message-content">
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeLoading() {
  const loading = document.getElementById('loading-indicator');
  if (loading) {
    loading.remove();
  }
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const model = data.model || 'inconnu';

    if (data.status === 'ok') {
      setStatus('online', 'Connecté', model);
    } else {
      const available = Array.isArray(data.available_models) ? data.available_models.join(', ') : 'aucun';
      setStatus('warning', `Dégradé - modèle à initialiser (${available})`, model);
    }

    return data;
  } catch (error) {
    setStatus('offline', 'Backend indisponible', 'inconnu');
    return null;
  }
}

async function sendMessageStream(message, historySnapshot, onChunk) {
  const payload = { message, history: historySnapshot };

  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Erreur HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isSending) return;

  const message = messageInput.value.trim();
  if (!message) return;

  // Historique AVANT d'ajouter le message courant (envoyé séparément au backend)
  const historySnapshot = history
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .slice(-12);

  messageInput.value = '';
  addMessage('user', message);

  // Bulle assistant vide qui se remplira au fil du streaming
  history.push({ role: 'assistant', content: '' });
  renderMessages();
  const liveEl = messagesContainer.querySelector('.message:last-child .message-content');
  const assistantMsg = history[history.length - 1];

  setSending(true);
  showLoading();

  try {
    await sendMessageStream(message, historySnapshot, (chunk) => {
      assistantMsg.content += chunk;
      if (liveEl) liveEl.innerHTML = formatContent(assistantMsg.content);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    if (!assistantMsg.content) {
      assistantMsg.content = 'Réponse vide.';
      if (liveEl) liveEl.innerHTML = formatContent(assistantMsg.content);
    }
    saveHistory();
  } catch (error) {
    assistantMsg.content = `Erreur : ${error.message}`;
    if (liveEl) liveEl.innerHTML = formatContent(assistantMsg.content);
    saveHistory();
    await checkHealth();
  } finally {
    setSending(false);
    messageInput.focus();
  }
});

healthButton.addEventListener('click', checkHealth);

clearButton.addEventListener('click', () => {
  history = [];
  saveHistory();
  renderMessages();
  messageInput.focus();
});

promptChips.forEach((button) => {
  button.addEventListener('click', () => {
    messageInput.value = button.dataset.prompt || '';
    messageInput.focus();
  });
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    chatForm.requestSubmit();
  }
});

renderMessages();
checkHealth();
setInterval(checkHealth, 30000);
