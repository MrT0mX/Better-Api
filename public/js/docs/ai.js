(() => {
  const form = document.querySelector("#ai-playground");
  if (!form) return;

  const providerSelect = document.querySelector("#ai-provider");
  const modelInput = document.querySelector("#ai-model");
  const modeSelect = document.querySelector("#ai-mode");
  const messageInput = document.querySelector("#ai-message");
  const response = document.querySelector("#ai-response");
  const providerStatus = document.querySelector("#ai-provider-status");
  const submitButton = document.querySelector("#ai-submit");
  const providerModels = new Map();
  let configuredProviders = new Set();
  let language = document.documentElement.lang === "en" ? "en" : "bn";
  const messages = {
    bn: {
      configured: "Provider configure করা আছে",
      unconfigured: "Provider key configure করা নেই",
      unavailable: "Provider status পাওয়া যায়নি",
      apiKeyRequired: "এই API ব্যবহার করতে dashboard account API key প্রয়োজন।",
      providerMissing: "এই provider server-এ configure করা নেই। deployment environment-এ provider key যোগ করুন।",
      waiting: "AI provider-এর উত্তর অপেক্ষা করা হচ্ছে…",
      connectionFailed: "Request পাঠানো যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
    },
    en: {
      configured: "Provider is configured",
      unconfigured: "Provider key is not configured",
      unavailable: "Provider status is unavailable",
      apiKeyRequired: "A dashboard account API key is required to use this API.",
      providerMissing: "This provider is not configured on the server. Add its key to the deployment environment.",
      waiting: "Waiting for the AI provider…",
      connectionFailed: "Could not send the request. Check your connection and try again.",
    },
  };

  function updateProviderStatus() {
    const available = configuredProviders.has(providerSelect.value);
    providerStatus.textContent = available
      ? messages[language].configured
      : messages[language].unconfigured;
    providerStatus.dataset.available = String(available);
    const config = providerModels.get(providerSelect.value);
    if (config && !modelInput.value.trim()) modelInput.placeholder = config.defaultModel;
  }

  document.addEventListener("docs:languagechange", (event) => {
    language = event.detail.language;
    updateProviderStatus();
  });

  fetch("/api/ai/providers", { headers: { Accept: "application/json" } })
    .then(async (result) => {
      if (!result.ok) throw new Error("Provider list could not be loaded");
      const data = await result.json();
      if (!Array.isArray(data.providers)) throw new Error("Provider list response was invalid");
      data.providers.forEach((provider) => {
        providerModels.set(provider.id, provider);
        if (provider.configured) configuredProviders.add(provider.id);
      });
      const firstConfigured = data.providers.find((provider) => provider.configured);
      if (firstConfigured) providerSelect.value = firstConfigured.id;
      updateProviderStatus();
    })
    .catch(() => {
      providerStatus.textContent = messages[language].unavailable;
      providerStatus.dataset.available = "false";
    });

  providerSelect.addEventListener("change", () => {
    modelInput.value = "";
    updateProviderStatus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const apiKey = document.querySelector("#api-key-value")?.value;
    if (!apiKey) {
      response.textContent = messages[language].apiKeyRequired;
      return;
    }
    if (!configuredProviders.has(providerSelect.value)) {
      response.textContent = messages[language].providerMissing;
      return;
    }

    const teacherMode = modeSelect.value === "teach";
    submitButton.disabled = true;
    response.textContent = messages[language].waiting;
    try {
      const result = await fetch(teacherMode ? "/api/agent/chat" : "/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          provider: providerSelect.value,
          model: modelInput.value.trim() || undefined,
          mode: teacherMode ? "teach" : "chat",
          messages: [{ role: "user", content: messageInput.value.trim() }],
        }),
      });
      const data = await result.json();
      if (!result.ok || !data.status) {
        response.textContent = data.message || `Request failed (${result.status}).`;
        return;
      }
      response.textContent = `${data.provider} · ${data.model}\n\n${data.result.content}`;
    } catch (error) {
      response.textContent = messages[language].connectionFailed;
    } finally {
      submitButton.disabled = false;
    }
  });
})();
