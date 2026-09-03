(() => {
  const context = document.modelContext;
  if (!context?.registerTool || context.registerTool.__mealPlannerTracked) return;

  const registeredNames = new Set();
  const originalRegisterTool = context.registerTool.bind(context);

  function renderStatus() {
    const status = document.querySelector("#mcpStatus");
    if (!status || !registeredNames.size) return;
    const text = `WebMCP · ${registeredNames.size} tools`;
    if (status.textContent !== text) status.textContent = text;
    status.classList.add("ready");
    status.title = "This page is exposing structured tools to your browser agent.";
  }

  const trackedRegisterTool = async (definition) => {
    const result = await originalRegisterTool(definition);
    if (definition?.name) registeredNames.add(definition.name);
    renderStatus();
    return result;
  };
  trackedRegisterTool.__mealPlannerTracked = true;
  context.registerTool = trackedRegisterTool;

  const observeStatus = () => {
    const status = document.querySelector("#mcpStatus");
    if (!status) return;
    const observer = new MutationObserver(renderStatus);
    observer.observe(status, { childList: true, subtree: true, characterData: true });
    renderStatus();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeStatus, { once: true });
  } else {
    observeStatus();
  }

  globalThis.mealPlannerWebMCPStatus = {
    getRegisteredToolNames: () => [...registeredNames]
  };
})();
