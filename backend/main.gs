function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const path = e.parameter.path || "";
  const method = e.parameter.method || e.method || "GET";
  const body = e.postData ? JSON.parse(e.postData.contents) : {};
  const headers = e.headers || {};

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  if (method === "OPTIONS") {
    return Utils.jsonResponse({}, corsHeaders, 200);
  }

  try {
    if (path === "auth/login" && method === "POST") {
      return Utils.jsonResponse(AuthController.login(body), corsHeaders);
    }

    if (path === "auth/logout" && method === "POST") {
      return Utils.jsonResponse(AuthController.logout(headers), corsHeaders);
    }

    if (path === "users/me" && method === "GET") {
      return Utils.jsonResponse(AuthController.getCurrentUser(headers), corsHeaders);
    }

    return Utils.jsonResponse({ error: "Endpoint not found" }, corsHeaders, 404);
  } catch (err) {
    return Utils.jsonResponse({ error: err.message }, corsHeaders, 500);
  }
}
