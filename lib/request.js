function getBody(req) {
  if (!req || req.body == null) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  return {};
}

function getField(req, names, fallback = undefined) {
  const body = getBody(req);

  for (const name of names) {
    const queryValue =
      req && req.query && req.query[name] !== undefined ? req.query[name] : undefined;
    if (queryValue !== undefined && queryValue !== null && queryValue !== "") {
      return queryValue;
    }

    if (body[name] !== undefined && body[name] !== null && body[name] !== "") {
      return body[name];
    }
  }

  return fallback;
}

function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

function ensureMethod(req, res, allowedMethods) {
  if (allowedMethods.includes(req.method)) {
    return true;
  }

  res.setHeader("Allow", allowedMethods.join(", "));
  sendJson(res, 405, { error: "Method not allowed" });
  return false;
}

module.exports = {
  getBody,
  getField,
  sendJson,
  ensureMethod,
};
