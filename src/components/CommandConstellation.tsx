import { useEffect, useMemo, useRef } from "react";
import type { Command } from "../types";
import { platformById } from "../data/platforms";

type Props = {
  commands: Command[];
  onSelectCommand: (cmd: Command) => void;
  onCenterClick: () => void;
};

/** Word-only physics network: no circles, just readable moving labels. */
export function CommandConstellation({ commands, onSelectCommand, onCenterClick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const nodesRef = useRef<HTMLButtonElement[]>([]);
  const hubRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const n = Math.min(commands.length, 14);
  const nodes = useMemo(() => commands.slice(0, n), [commands, n]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;

    const pad = 14;
    const state = nodes.map((cmd) => ({
      id: cmd.id,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 120,
      vy: (Math.random() - 0.5) * 120,
      w: 40,
      h: 18,
      col: platformById(cmd.platform).accent,
      t: Math.random() * 1000,
    }));

    function measure(wrapEl: HTMLDivElement) {
      const rect = wrapEl.getBoundingClientRect();
      const W = Math.max(280, rect.width);
      const H = Math.min(460, Math.max(320, W * 0.92));
      wrapEl.style.height = `${H}px`;

      if (canvas && ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      for (let i = 0; i < state.length; i++) {
        const el = nodesRef.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        state[i]!.w = Math.max(24, r.width);
        state[i]!.h = Math.max(14, r.height);
      }

      for (let i = 0; i < state.length; i++) {
        const s = state[i]!;
        if (s.x === 0 && s.y === 0) {
          s.x = pad + Math.random() * Math.max(1, W - pad * 2 - s.w);
          s.y = pad + Math.random() * Math.max(1, H - pad * 2 - s.h);
        } else {
          s.x = Math.min(Math.max(s.x, pad), W - pad - s.w);
          s.y = Math.min(Math.max(s.y, pad), H - pad - s.h);
        }
      }

      return { W, H };
    }

    let { W, H } = measure(wrap);
    const ro = new ResizeObserver(() => {
      const r = measure(wrap);
      W = r.W;
      H = r.H;
    });
    ro.observe(wrap);

    let last = performance.now();

    function collide(a: (typeof state)[number], b: (typeof state)[number]) {
      const ax2 = a.x + a.w;
      const ay2 = a.y + a.h;
      const bx2 = b.x + b.w;
      const by2 = b.y + b.h;
      if (a.x >= bx2 || b.x >= ax2 || a.y >= by2 || b.y >= ay2) return;

      const dx1 = bx2 - a.x;
      const dx2 = ax2 - b.x;
      const dy1 = by2 - a.y;
      const dy2 = ay2 - b.y;
      const minX = Math.min(dx1, dx2);
      const minY = Math.min(dy1, dy2);

      if (minX < minY) {
        const push = (minX + 0.5) * (a.x < b.x ? -1 : 1);
        a.x += push * 0.5;
        b.x -= push * 0.5;
        const t = a.vx;
        a.vx = b.vx;
        b.vx = t;
      } else {
        const push = (minY + 0.5) * (a.y < b.y ? -1 : 1);
        a.y += push * 0.5;
        b.y -= push * 0.5;
        const t = a.vy;
        a.vy = b.vy;
        b.vy = t;
      }
    }

    function step(now: number) {
      const dt = Math.min(0.032, Math.max(0.008, (now - last) / 1000));
      last = now;

      const drag = 0.985;
      const jitter = 26;
      const bounce = 0.88;

      for (const s of state) {
        s.t += dt;
        const ax = Math.sin(s.t * 1.7 + s.x * 0.01) * jitter;
        const ay = Math.cos(s.t * 1.3 + s.y * 0.01) * jitter;
        s.vx = (s.vx + ax * dt) * drag;
        s.vy = (s.vy + ay * dt) * drag;

        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (s.x <= pad) {
          s.x = pad;
          s.vx = Math.abs(s.vx) * bounce;
        } else if (s.x + s.w >= W - pad) {
          s.x = W - pad - s.w;
          s.vx = -Math.abs(s.vx) * bounce;
        }
        if (s.y <= pad) {
          s.y = pad;
          s.vy = Math.abs(s.vy) * bounce;
        } else if (s.y + s.h >= H - pad) {
          s.y = H - pad - s.h;
          s.vy = -Math.abs(s.vy) * bounce;
        }
      }

      // Light AABB collisions to keep labels from stacking too much.
      for (let i = 0; i < state.length; i++) {
        for (let j = i + 1; j < state.length; j++) collide(state[i]!, state[j]!);
      }

      // Paint transforms without rerendering.
      for (let i = 0; i < state.length; i++) {
        const el = nodesRef.current[i];
        if (!el) continue;
        const s = state[i]!;
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      }

      // Draw strings to the central hub label ("Vault")
      if (ctx && canvas) {
        ctx.clearRect(0, 0, W, H);

        const hub = hubRef.current;
        let hx = W / 2;
        let hy = H / 2;
        if (hub) {
          const wr = wrap!.getBoundingClientRect();
          const hr = hub.getBoundingClientRect();
          hx = (hr.left - wr.left) + hr.width / 2;
          hy = (hr.top - wr.top) + hr.height / 2;
        }

        ctx.lineWidth = 1.15;
        ctx.lineCap = "round";
        for (const s of state) {
          const x = s.x + s.w / 2;
          const y = s.y + s.h / 2;
          ctx.strokeStyle = `${s.col}66`;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Subtle hub glow
        const ring = "rgba(255,255,255,0.08)";
        ctx.strokeStyle = ring;
        ctx.beginPath();
        ctx.arc(hx, hy, 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame((t) => {
      last = t;
      step(t);
    });

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [nodes]);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-lg select-none overflow-hidden rounded-3xl border border-vault-border bg-vault-surface backdrop-blur-xl"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden />

      <button
        ref={hubRef}
        type="button"
        onClick={onCenterClick}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-center font-mono text-[clamp(16px,4.6vw,20px)] font-semibold tracking-wide text-vault-fg"
        style={{ textShadow: "0 1px 22px rgba(0,0,0,0.75)" }}
        aria-label="Open search"
        title="Open Search"
      >
        Vault
      </button>

      <div className="absolute left-3 top-3 z-20 text-[11px] text-vault-subtle">// tap a word to open it</div>

      <div className="relative z-10 h-full w-full">
        {nodes.map((cmd, i) => {
          const meta = platformById(cmd.platform);
          const label = cmd.name.length > 24 ? `${cmd.name.slice(0, 23)}…` : cmd.name;
          return (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={cmd.id}
              ref={(el) => {
                if (el) nodesRef.current[i] = el;
              }}
              type="button"
              onClick={() => onSelectCommand(cmd)}
              className="absolute left-0 top-0 z-10 max-w-[92%] whitespace-nowrap px-1 py-0.5 font-mono text-[clamp(13px,3.6vw,16px)] font-semibold tracking-tight text-vault-fg"
              style={{
                textShadow: "0 1px 22px rgba(0,0,0,0.75)",
                WebkitTextStroke: "0.25px rgba(0,0,0,0.45)",
              }}
              aria-label={`Open ${meta.label}: ${cmd.name}`}
              title={`${meta.label} — ${cmd.name}`}
            >
              <span style={{ color: meta.accent }}>{meta.label}</span>
              <span className="mx-1 text-vault-subtle">/</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
