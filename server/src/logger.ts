interface LogPayload {
  msg: string;
  requestId?: string;
  uid?: string;
  endpoint?: string;
  latencyMs?: number;
  payloadBytes?: number;
  vendor?: string;
  cacheHit?: boolean;
  [key: string]: unknown;
}

function emit(level: "info" | "warn" | "error", payload: LogPayload): void {
  const line = JSON.stringify({ level, ts: new Date().toISOString(), ...payload });
  if (level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export const logger = {
  info: (msg: string, extra: Omit<LogPayload, "msg"> = {}) => emit("info", { msg, ...extra }),
  warn: (msg: string, extra: Omit<LogPayload, "msg"> = {}) => emit("warn", { msg, ...extra }),
  error: (msg: string, extra: Omit<LogPayload, "msg"> = {}) => emit("error", { msg, ...extra }),
};
