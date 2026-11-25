/**
 * js/simulator.js
 * React Network Simulator Engine (SVG + Drag & Drop + Graph Validator + Packet & Fault Animator)
 * Menggunakan React Hooks & Tailwind CSS.
 */

import { React, html } from './reactHtm.js';

const { useState, useRef, useEffect } = React;

export const DEVICE_META = {
  pc: { label: 'PC', icon: '💻', color: '#38bdf8' },
  switch: { label: 'Switch', icon: '🔀', color: '#34d399' },
  hub: { label: 'Hub / Tap', icon: '⭕', color: '#fbbf24' },
  router: { label: 'Router / Term', icon: '📡', color: '#a78bfa' },
  server: { label: 'Server', icon: '🖥️', color: '#f472b6' }
};

export function cloneGraph(graph) {
  return JSON.parse(JSON.stringify(graph || { nodes: [], links: [] }));
}

function buildAdjacency(graph, activeOnly = true) {
  const validNodeIds = new Set(
    graph.nodes.filter((n) => !activeOnly || !n.offline).map((n) => n.id)
  );
  const adj = {};
  validNodeIds.forEach((id) => {
    adj[id] = [];
  });
  const activeLinks = [];
  graph.links.forEach((l) => {
    if (activeOnly && l.broken) return;
    if (!validNodeIds.has(l.from) || !validNodeIds.has(l.to)) return;
    if (l.from === l.to) return;
    if (!adj[l.from].includes(l.to)) adj[l.from].push(l.to);
    if (!adj[l.to].includes(l.from)) adj[l.to].push(l.from);
    activeLinks.push(l);
  });
  return { adj, activeLinks, validNodeIds };
}

function isConnected(adj, nodeIds) {
  if (nodeIds.length === 0) return false;
  const visited = new Set([nodeIds[0]]);
  const queue = [nodeIds[0]];
  while (queue.length) {
    const cur = queue.shift();
    (adj[cur] || []).forEach((nxt) => {
      if (!visited.has(nxt)) {
        visited.add(nxt);
        queue.push(nxt);
      }
    });
  }
  return visited.size === nodeIds.length;
}

export function findShortestPath(graph, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return null;
  const { adj, validNodeIds } = buildAdjacency(graph, true);
  if (!validNodeIds.has(fromId) || !validNodeIds.has(toId)) return null;

  const queue = [[fromId]];
  const visited = new Set([fromId]);
  while (queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];
    if (last === toId) return path;
    for (const nxt of adj[last] || []) {
      if (!visited.has(nxt)) {
        visited.add(nxt);
        queue.push([...path, nxt]);
      }
    }
  }
  return null;
}

export function validateTopology(graph, targetTopology, minDevices = null) {
  const nodes = graph.nodes || [];
  const links = graph.links || [];

  if (nodes.length < 3) {
    return { valid: false, message: 'Tambahkan minimal 3–4 perangkat jaringan di kanvas sebelum memeriksa topologi.' };
  }

  const brokenCount = links.filter((l) => l.broken).length;
  const offlineCount = nodes.filter((n) => n.offline).length;
  if (brokenCount > 0 || offlineCount > 0) {
    return {
      valid: false,
      message: `Masih terdapat ${brokenCount} kabel putus dan ${offlineCount} perangkat mati (offline). Perbaiki semua jalur agar topologi dapat divalidasi.`
    };
  }

  if (minDevices) {
    if (minDevices.totalNodes && nodes.length < minDevices.totalNodes) {
      return {
        valid: false,
        message: `Jumlah perangkat masih ${nodes.length}, minimal dibutuhkan ${minDevices.totalNodes} perangkat sesuai skenario.`
      };
    }
    const pcCount = nodes.filter((n) => n.type === 'pc' || n.type === 'server').length;
    if (minDevices.pc && pcCount < minDevices.pc) {
      return {
        valid: false,
        message: `Dibutuhkan minimal ${minDevices.pc} perangkat akhir (PC/Server), saat ini baru ${pcCount}.`
      };
    }
    const swCount = nodes.filter((n) => n.type === 'switch' || n.type === 'hub').length;
    if (minDevices.switchOrHub !== undefined && minDevices.switchOrHub > 0 && swCount < minDevices.switchOrHub) {
      return {
        valid: false,
        message: `Dibutuhkan minimal ${minDevices.switchOrHub} Switch/Hub pada skenario ini.`
      };
    }
  }

  const { adj, activeLinks, validNodeIds } = buildAdjacency(graph, true);
  const ids = Array.from(validNodeIds);

  if (!isConnected(adj, ids)) {
    return {
      valid: false,
      message: 'Jaringan belum terhubung sepenuhnya! Masih ada perangkat yang terpisah (isolated). Pastikan semua perangkat terhubung.'
    };
  }

  const n = ids.length;
  const e = activeLinks.length;
  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));

  if (targetTopology === 'star') {
    const centers = ids.filter((id) => adj[id].length === n - 1);
    const swCenter = centers.find((id) => ['switch', 'hub', 'router'].includes(nodeMap[id].type));
    if (!swCenter) {
      const highDeg = ids.filter((id) => adj[id].length > 1 && ['pc', 'server'].includes(nodeMap[id].type));
      if (highDeg.length > 0) {
        return {
          valid: false,
          message: `Topologi Star membutuhkan 1 perangkat pusat (Switch/Hub) yang terhubung ke semua PC. Saat ini "${nodeMap[highDeg[0]].label}" terhubung langsung ke beberapa perangkat.`
        };
      }
      return {
        valid: false,
        message: 'Topologi Star belum terbentuk: pastikan ada tepat 1 Switch/Hub pusat yang terhubung ke seluruh perangkat lainnya.'
      };
    }
    const nonCenterOk = ids
      .filter((id) => id !== swCenter)
      .every((id) => adj[id].length === 1 && adj[id][0] === swCenter);
    if (!nonCenterOk || e !== n - 1) {
      return {
        valid: false,
        message: 'Pada topologi Star murni, tidak boleh ada kabel langsung antar PC—semua perangkat akhir hanya terhubung ke Switch/Hub pusat.'
      };
    }
    return {
      valid: true,
      message: `VALID! Topologi Star terbentuk sempurna dengan "${nodeMap[swCenter].label}" sebagai pusat dan ${n - 1} perangkat terhubung.`
    };
  }

  if (targetTopology === 'ring') {
    if (n < 3) return { valid: false, message: 'Topologi Ring membutuhkan minimal 3 perangkat.' };
    const badNodes = ids.filter((id) => adj[id].length !== 2);
    if (badNodes.length > 0 || e !== n) {
      const sample = badNodes[0] ? nodeMap[badNodes[0]] : null;
      return {
        valid: false,
        message: sample
          ? `Topologi Ring mengharuskan setiap perangkat terhubung tepat ke 2 tetangga membentuk cincin tertutup. "${sample.label}" saat ini memiliki ${adj[sample.id].length} koneksi.`
          : 'Susunan kabel belum membentuk satu cincin tertutup.'
      };
    }
    return {
      valid: true,
      message: `VALID! Topologi Ring tertutup sempurna dengan ${n} node (masing-masing berderajat 2).`
    };
  }

  if (targetTopology === 'mesh') {
    const expectedEdges = (n * (n - 1)) / 2;
    const missingFrom = ids.find((id) => adj[id].length !== n - 1);
    if (e !== expectedEdges || missingFrom) {
      const targetLabel = missingFrom ? nodeMap[missingFrom].label : 'salah satu node';
      return {
        valid: false,
        message: `Topologi Full Mesh untuk ${n} perangkat memerlukan ${expectedEdges} kabel langsung (rumus n(n-1)/2). Saat ini baru ${e} kabel; "${targetLabel}" belum terhubung ke semua perangkat lain.`
      };
    }
    return {
      valid: true,
      message: `VALID! Topologi Full Mesh sempurna: ${n} perangkat saling terhubung langsung melalui ${e} jalur redundan.`
    };
  }

  if (targetTopology === 'bus') {
    if (e !== n - 1) {
      return {
        valid: false,
        message: 'Topologi Bus tidak boleh membentuk cincin tertutup (loop). Pastikan hanya ada satu jalur utama (backbone) linear tanpa loop.'
      };
    }
    const leafIds = new Set(
      ids.filter((id) => adj[id].length === 1 && (nodeMap[id].type === 'pc' || nodeMap[id].type === 'server'))
    );
    const coreIds = ids.filter((id) => !leafIds.has(id));
    if (coreIds.length === 0) {
      const maxDeg = Math.max(...ids.map((id) => adj[id].length));
      if (maxDeg > 2) {
        return {
          valid: false,
          message: 'Topologi Bus harus berbentuk jalur linear (atau gunakan Hub/Tap pada jalur backbone dengan PC bercabang ke backbone).'
        };
      }
      return { valid: true, message: `VALID! Topologi Bus linear terbentuk dengan ${n} perangkat pada satu jalur.` };
    }
    const coreBad = coreIds.some((id) => adj[id].filter((nb) => !leafIds.has(nb)).length > 2);
    if (coreBad) {
      return {
        valid: false,
        message: 'Jalur backbone Bus bercabang terlalu banyak seperti Tree. Pastikan jalur utama (backbone) lurus satu garis.'
      };
    }
    return {
      valid: true,
      message: `VALID! Topologi Bus terbentuk dengan jalur backbone utama dan ${leafIds.size} perangkat terhubung.`
    };
  }

  if (targetTopology === 'tree') {
    if (e !== n - 1) {
      return {
        valid: false,
        message: 'Topologi Tree tidak boleh memiliki loop (jumlah kabel harus n - 1). Periksa apakah ada cabang yang saling melingkar.'
      };
    }
    const hubsOrSwitches = ids.filter((id) => ['router', 'switch', 'hub'].includes(nodeMap[id].type));
    if (hubsOrSwitches.length < 3) {
      return {
        valid: false,
        message: 'Topologi Tree bertingkat membutuhkan minimal 1 perangkat Root (Router/Switch Utama) dan minimal 2 Switch/Hub cabang.'
      };
    }
    const rootCandidate = hubsOrSwitches.find((id) => {
      const infraNeighbors = adj[id].filter((nb) => ['router', 'switch', 'hub'].includes(nodeMap[nb].type));
      return infraNeighbors.length >= 2;
    });
    if (!rootCandidate) {
      return {
        valid: false,
        message: 'Belum terlihat hierarki Tree: pastikan ada 1 Core Router/Switch utama yang menghubungkan minimal 2 Switch cabang.'
      };
    }
    const endDevices = ids.filter((id) => nodeMap[id].type === 'pc' || nodeMap[id].type === 'server');
    if (endDevices.length < 2) {
      return { valid: false, message: 'Tambahkan perangkat akhir (PC/Server) pada masing-masing Switch cabang.' };
    }
    const pcAttachedToAnotherPc = endDevices.some((id) =>
      adj[id].some((nb) => nodeMap[nb].type === 'pc' || nodeMap[nb].type === 'server')
    );
    if (pcAttachedToAnotherPc) {
      return { valid: false, message: 'Pada topologi Tree, PC/Server harus terhubung ke Switch cabang, bukan langsung antar PC.' };
    }
    return {
      valid: true,
      message: `VALID! Topologi Tree bertingkat sempurna dengan "${nodeMap[rootCandidate].label}" sebagai akar hierarki.`
    };
  }

  return { valid: false, message: 'Pilih target topologi untuk divalidasi.' };
}

/**
 * Komponen React Read-Only Graph Preview (untuk Guru memeriksa proyek GPL siswa)
 */
export function ReadOnlyGraphPreview({ graph }) {
  const nodes = graph?.nodes || [];
  const links = graph?.links || [];
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return html`
    <div className="sim-canvas-grid relative h-[320px] rounded-xl border border-slate-700 overflow-hidden select-none">
      <svg className="w-full h-full block" viewBox="0 0 640 330" preserveAspectRatio="xMidYMid meet">
        ${links.map((l) => {
          const a = nodeMap[l.from];
          const b = nodeMap[l.to];
          if (!a || !b) return null;
          return html`<line key=${l.id} x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y}
            className=${`sim-link ${l.backbone ? 'backbone' : ''} ${l.broken ? 'broken' : ''}`} />`;
        })}
        ${nodes.map((n) => {
          const meta = DEVICE_META[n.type] || DEVICE_META.pc;
          return html`
            <g key=${n.id} className=${`sim-node ${n.offline ? 'offline' : ''}`} transform=${`translate(${n.x}, ${n.y})`}>
              <rect x="-34" y="-24" width="68" height="48" className="sim-node-box" />
              <text y="-3" className="sim-node-label">${meta.icon}</text>
              <text y="15" className="sim-node-sub">${n.label}</text>
            </g>
          `;
        })}
      </svg>
    </div>
  `;
}

/**
 * Komponen React Simulator Interaktif di Halaman Materi
 */
export function MaterialSimulator({ topology, onSimRun }) {
  const [graph, setGraph] = useState(() => cloneGraph(topology.presetGraph));
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [packetPos, setPacketPos] = useState(null);
  const [log, setLog] = useState({
    type: 'neutral',
    text: 'Klik ▶ Kirim Paket Data untuk melihat animasi alur transmisi, atau klik kabel/node untuk menyimulasikan kerusakan.'
  });
  const faultTestedRef = useRef(false);
  const animRef = useRef(false);

  useEffect(() => {
    const fresh = cloneGraph(topology.presetGraph);
    setGraph(fresh);
    const endNodes = fresh.nodes.filter((n) => n.type === 'pc' || n.type === 'server');
    setFromId(endNodes[0]?.id || fresh.nodes[0]?.id || '');
    setToId(endNodes[endNodes.length - 1]?.id || fresh.nodes[1]?.id || '');
    setPacketPos(null);
    faultTestedRef.current = false;
    animRef.current = false;
    setLog({
      type: 'neutral',
      text: 'Klik ▶ Kirim Paket Data untuk melihat animasi alur transmisi, atau klik kabel/node untuk menyimulasikan kerusakan.'
    });
  }, [topology.id]);

  const nodeMap = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  function toggleLink(linkId) {
    setGraph((prev) => {
      const next = cloneGraph(prev);
      const l = next.links.find((x) => x.id === linkId);
      if (l) {
        l.broken = !l.broken;
        faultTestedRef.current = true;
        setLog({
          type: l.broken ? 'fail' : 'neutral',
          text: l.broken
            ? '✂️ Kabel diputus! Klik ▶ Kirim Paket Data untuk melihat dampaknya pada topologi ini.'
            : '🔧 Kabel tersambung kembali.'
        });
        if (onSimRun) onSimRun(true);
      }
      return next;
    });
  }

  function toggleNode(nodeId) {
    setGraph((prev) => {
      const next = cloneGraph(prev);
      const n = next.nodes.find((x) => x.id === nodeId);
      if (n) {
        n.offline = !n.offline;
        faultTestedRef.current = true;
        setLog({
          type: n.offline ? 'fail' : 'neutral',
          text: n.offline
            ? `⚡ Perangkat "${n.label}" dimatikan (offline). Uji kirim paket untuk melihat ketahanan jaringan.`
            : `✅ "${n.label}" dinyalakan kembali.`
        });
        if (onSimRun) onSimRun(true);
      }
      return next;
    });
  }

  function sendPacket() {
    if (animRef.current) return;
    if (!fromId || !toId || fromId === toId) {
      setLog({ type: 'fail', text: 'Pilih perangkat pengirim dan tujuan yang berbeda.' });
      return;
    }
    const path = findShortestPath(graph, fromId, toId);
    if (onSimRun) onSimRun(faultTestedRef.current);

    if (!path) {
      setLog({
        type: 'fail',
        text: `❌ Pengiriman Gagal! Tidak ada jalur aktif dari ${nodeMap[fromId]?.label || fromId} ke ${nodeMap[toId]?.label || toId} karena kabel putus atau perangkat mati.`
      });
      return;
    }

    animRef.current = true;
    let segIdx = 0;
    let progress = 0;
    function step() {
      if (segIdx >= path.length - 1) {
        setPacketPos(null);
        animRef.current = false;
        const labels = path.map((id) => nodeMap[id]?.label || id).join(' → ');
        setLog({
          type: 'pass',
          text: `✅ Paket Terkirim (${path.length - 1} hop): ${labels}`
        });
        return;
      }
      const a = nodeMap[path[segIdx]];
      const b = nodeMap[path[segIdx + 1]];
      setPacketPos({
        x: a.x + (b.x - a.x) * progress,
        y: a.y + (b.y - a.y) * progress
      });
      progress += 0.055;
      if (progress >= 1) {
        progress = 0;
        segIdx++;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function resetGraph() {
    setGraph(cloneGraph(topology.presetGraph));
    setLog({ type: 'neutral', text: 'Semua kabel dan perangkat dipulihkan ke kondisi normal.' });
  }

  const bannerCls =
    log.type === 'pass'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
      : log.type === 'fail'
      ? 'bg-rose-50 border-rose-300 text-rose-900'
      : 'bg-slate-50 border-slate-200 text-slate-700';

  return html`
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-t-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Dari:</span>
          <select value=${fromId} onChange=${(e) => setFromId(e.target.value)} className="px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg">
            ${graph.nodes.map((n) => html`<option key=${n.id} value=${n.id}>${n.label}</option>`)}
          </select>
          <span className="text-xs font-bold text-slate-600">Ke:</span>
          <select value=${toId} onChange=${(e) => setToId(e.target.value)} className="px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg">
            ${graph.nodes.map((n) => html`<option key=${n.id} value=${n.id}>${n.label}</option>`)}
          </select>
          <button type="button" onClick=${sendPacket} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            ▶ Kirim Paket Data
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Klik kabel/node untuk uji putus!</span>
          <button type="button" onClick=${resetGraph} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100">
            ↺ Reset Jalur
          </button>
        </div>
      </div>

      <div className="sim-canvas-grid h-[310px] border-x border-b border-slate-700 rounded-b-xl overflow-hidden select-none">
        <svg className="w-full h-full block" viewBox="0 0 640 320" preserveAspectRatio="xMidYMid meet">
          ${graph.links.map((l) => {
            const a = nodeMap[l.from];
            const b = nodeMap[l.to];
            if (!a || !b) return null;
            return html`<line key=${l.id} x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y}
              onClick=${() => toggleLink(l.id)}
              className=${`sim-link ${l.backbone ? 'backbone' : ''} ${l.broken ? 'broken' : ''}`} />`;
          })}
          ${graph.nodes.map((n) => {
            const meta = DEVICE_META[n.type] || DEVICE_META.pc;
            return html`
              <g key=${n.id} onClick=${() => toggleNode(n.id)} style=${{ cursor: 'pointer' }}
                className=${`sim-node ${n.offline ? 'offline' : ''}`} transform=${`translate(${n.x}, ${n.y})`}>
                <rect x="-34" y="-22" width="68" height="44" className="sim-node-box" />
                <text y="-2" className="sim-node-label">${meta.icon}</text>
                <text y="14" className="sim-node-sub">${n.label}${n.offline ? ' (MATI)' : ''}</text>
              </g>
            `;
          })}
          ${packetPos && html`
            <g>
              <circle cx=${packetPos.x} cy=${packetPos.y} r="9" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
              <text x=${packetPos.x} y=${packetPos.y - 14} fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">DATA</text>
            </g>
          `}
        </svg>
      </div>

      <div className=${`mt-3 px-4 py-3 rounded-xl border text-sm ${bannerCls}`}>
        ${log.text}
      </div>
    </div>
  `;
}

/**
 * Komponen React Full Network Simulator Lab (dipakai di halaman Simulator & Modal Proyek GPL)
 */
export function FullNetworkSimulator({
  initialGraph = { nodes: [], links: [] },
  initialTarget = 'star',
  initialNotes = '',
  minDevices = null,
  presets = [],
  projectMode = false,
  onValidateSuccess = null,
  onSubmitProject = null
}) {
  const [graph, setGraph] = useState(() => cloneGraph(initialGraph));
  const [target, setTarget] = useState(initialTarget);
  const [tool, setTool] = useState('select');
  const [connectFromId, setConnectFromId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [testedFault, setTestedFault] = useState(false);
  const [pktFrom, setPktFrom] = useState(() => initialGraph.nodes?.[0]?.id || '');
  const [pktTo, setPktTo] = useState(() => initialGraph.nodes?.[initialGraph.nodes.length - 1]?.id || '');
  const [packetPos, setPacketPos] = useState(null);
  const [notes, setNotes] = useState(initialNotes);
  const [feedback, setFeedback] = useState({
    type: 'neutral',
    text: 'Tambahkan perangkat dari palet di kiri, lalu pilih alat Hubung Kabel untuk menyambungkan dua perangkat.'
  });

  const svgRef = useRef(null);
  const animRef = useRef(false);
  const countersRef = useRef({ pc: 1, switch: 1, hub: 1, router: 1, server: 1 });

  useEffect(() => {
    const c = { pc: 1, switch: 1, hub: 1, router: 1, server: 1 };
    graph.nodes.forEach((n) => {
      if (c[n.type] !== undefined) c[n.type]++;
    });
    countersRef.current = c;
  }, []);

  useEffect(() => {
    if (graph.nodes.length > 0) {
      if (!graph.nodes.some((n) => n.id === pktFrom)) setPktFrom(graph.nodes[0].id);
      if (!graph.nodes.some((n) => n.id === pktTo)) setPktTo(graph.nodes[graph.nodes.length - 1].id);
    }
  }, [graph.nodes]);

  function getSvgPoint(evt) {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function addNode(type, x, y) {
    const meta = DEVICE_META[type] || DEVICE_META.pc;
    const count = countersRef.current[type]++;
    const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const node = {
      id,
      type,
      label: `${meta.label.split(' ')[0]}-${count}`,
      x: Math.max(45, Math.min(755, Math.round(x))),
      y: Math.max(35, Math.min(445, Math.round(y))),
      offline: false
    };
    setGraph((prev) => ({ ...prev, nodes: [...prev.nodes, node] }));
  }

  function handleNodeMouseDown(evt, id) {
    evt.stopPropagation();
    const node = graph.nodes.find((n) => n.id === id);
    if (!node) return;

    if (tool === 'select') {
      setSelectedNodeId(id);
      setDraggingId(id);
      const pt = getSvgPoint(evt);
      setDragOffset({ x: node.x - pt.x, y: node.y - pt.y });
      return;
    }

    if (tool === 'connect') {
      if (!connectFromId) {
        setConnectFromId(id);
        setFeedback({ type: 'neutral', text: `Perangkat asal: ${node.label}. Klik perangkat tujuan untuk menyambungkan kabel.` });
      } else if (connectFromId === id) {
        setConnectFromId(null);
      } else {
        const exists = graph.links.some(
          (l) => (l.from === connectFromId && l.to === id) || (l.from === id && l.to === connectFromId)
        );
        if (exists) {
          setFeedback({ type: 'fail', text: 'Kedua perangkat tersebut sudah terhubung kabel.' });
        } else {
          const newLink = {
            id: 'lnk-' + Date.now() + Math.floor(Math.random() * 1000),
            from: connectFromId,
            to: id,
            broken: false
          };
          setGraph((prev) => ({ ...prev, links: [...prev.links, newLink] }));
          setFeedback({ type: 'neutral', text: 'Kabel tersambung antara perangkat terpilih.' });
        }
        setConnectFromId(null);
      }
      return;
    }

    if (tool === 'cut') {
      setTestedFault(true);
      setGraph((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, offline: !n.offline } : n))
      }));
      setFeedback({
        type: !node.offline ? 'fail' : 'neutral',
        text: !node.offline
          ? `⚡ Perangkat "${node.label}" dimatikan (offline). Uji kirim paket untuk melihat dampaknya.`
          : `✅ Perangkat "${node.label}" aktif kembali.`
      });
      return;
    }

    if (tool === 'delete') {
      setGraph((prev) => ({
        nodes: prev.nodes.filter((n) => n.id !== id),
        links: prev.links.filter((l) => l.from !== id && l.to !== id)
      }));
      setSelectedNodeId(null);
      setConnectFromId(null);
    }
  }

  function handleLinkClick(evt, linkId) {
    evt.stopPropagation();
    const link = graph.links.find((l) => l.id === linkId);
    if (!link) return;

    if (tool === 'cut') {
      setTestedFault(true);
      setGraph((prev) => ({
        ...prev,
        links: prev.links.map((l) => (l.id === linkId ? { ...l, broken: !l.broken } : l))
      }));
      setFeedback({
        type: !link.broken ? 'fail' : 'neutral',
        text: !link.broken
          ? '✂️ Kabel diputus! Klik ▶ Kirim Paket untuk menguji pengaruhnya terhadap alur data.'
          : '🔧 Kabel disambung kembali.'
      });
    } else if (tool === 'delete') {
      setGraph((prev) => ({
        ...prev,
        links: prev.links.filter((l) => l.id !== linkId)
      }));
    }
  }

  function handleMouseMove(evt) {
    if (!draggingId) return;
    const pt = getSvgPoint(evt);
    const nx = Math.max(45, Math.min(755, Math.round(pt.x + dragOffset.x)));
    const ny = Math.max(35, Math.min(445, Math.round(pt.y + dragOffset.y)));
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === draggingId ? { ...n, x: nx, y: ny } : n))
    }));
  }

  function handleValidate() {
    const res = validateTopology(graph, target, minDevices);
    setFeedback({ type: res.valid ? 'pass' : 'fail', text: res.message });
    if (res.valid && onValidateSuccess) {
      onValidateSuccess(target, testedFault, graph);
    }
  }

  function handleSendPacket() {
    if (animRef.current) return;
    if (!pktFrom || !pktTo || pktFrom === pktTo) {
      setFeedback({ type: 'fail', text: 'Pilih dua perangkat berbeda untuk mengirim paket.' });
      return;
    }
    const nodeMap = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
    const path = findShortestPath(graph, pktFrom, pktTo);
    if (!path) {
      setFeedback({
        type: 'fail',
        text: `❌ Paket gagal mencapai ${nodeMap[pktTo]?.label || pktTo} — jalur tidak terhubung atau terputus.`
      });
      return;
    }
    animRef.current = true;
    let segIdx = 0;
    let progress = 0;
    function anim() {
      if (segIdx >= path.length - 1) {
        setPacketPos(null);
        animRef.current = false;
        const trail = path.map((id) => nodeMap[id]?.label || id).join(' → ');
        setFeedback({ type: 'pass', text: `✅ Paket berhasil dikirim (${path.length - 1} hop): ${trail}` });
        return;
      }
      const a = nodeMap[path[segIdx]];
      const b = nodeMap[path[segIdx + 1]];
      setPacketPos({ x: a.x + (b.x - a.x) * progress, y: a.y + (b.y - a.y) * progress });
      progress += 0.055;
      if (progress >= 1) {
        progress = 0;
        segIdx++;
      }
      requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }

  function handleProjectSubmit() {
    const res = validateTopology(graph, target, minDevices);
    setFeedback({ type: res.valid ? 'pass' : 'fail', text: res.message });
    if (!res.valid) return;
    if (!notes.trim()) {
      setFeedback({ type: 'fail', text: 'Tuliskan catatan analisis singkat sebelum mengumpulkan proyek.' });
      return;
    }
    onSubmitProject({ graph: cloneGraph(graph), notes, validationSummary: res.message });
  }

  const nodeMap = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const fbClass =
    feedback.type === 'pass'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
      : feedback.type === 'fail'
      ? 'bg-rose-50 border-rose-300 text-rose-900'
      : 'bg-slate-50 border-slate-200 text-slate-700';

  const toolButtons = [
    { id: 'select', label: '✋ Pindah' },
    { id: 'connect', label: '🔌 Hubung Kabel' },
    { id: 'cut', label: '✂️ Uji Putus / Mati' },
    { id: 'delete', label: '🗑️ Hapus' }
  ];

  return html`
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 items-start">
      <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h4 className="font-bold text-slate-900 text-sm mb-1">Palet Perangkat</h4>
        <p className="text-xs text-slate-500 mb-3">Seret ke kanvas atau klik untuk menambah perangkat.</p>
        <div className="space-y-2">
          ${Object.entries(DEVICE_META).map(([type, m]) => html`
            <div
              key=${type}
              draggable="true"
              onDragStart=${(e) => e.dataTransfer.setData('text/plain', type)}
              onClick=${() => {
                const count = graph.nodes.length;
                addNode(type, 140 + ((count * 95) % 540), 90 + Math.floor((count * 95) / 540) * 110);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 cursor-grab select-none text-sm font-semibold transition"
            >
              <span>${m.icon}</span>
              <span>${m.label}</span>
              <span className="ml-auto text-xs text-blue-600">+ Tambah</span>
            </div>
          `)}
        </div>

        <hr className="my-4 border-slate-200" />

        <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Validasi Topologi</label>
        <select
          value=${target}
          disabled=${projectMode}
          onChange=${(e) => setTarget(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl mb-3 disabled:bg-slate-100"
        >
          <option value="bus">Topologi Bus</option>
          <option value="star">Topologi Star</option>
          <option value="ring">Topologi Ring</option>
          <option value="mesh">Topologi Mesh</option>
          <option value="tree">Topologi Tree</option>
        </select>

        <button type="button" onClick=${handleValidate} className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition">
          ✓ Periksa Topologi
        </button>

        ${presets.length > 0 && !projectMode && html`
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Muat Contoh Topologi</label>
            <select
              defaultValue=""
              onChange=${(e) => {
                const found = presets.find((p) => p.id === e.target.value);
                if (!found) return;
                setGraph(cloneGraph(found.presetGraph));
                setTarget(found.id);
                setFeedback({ type: 'neutral', text: `Contoh ${found.name} dimuat ke kanvas. Coba validasi atau uji putus kabel!` });
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl"
            >
              <option value="">-- Pilih Preset --</option>
              ${presets.map((p) => html`<option key=${p.id} value=${p.id}>${p.name}</option>`)}
            </select>
          </div>
        `}
      </aside>

      <div>
        <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-t-2xl">
          ${toolButtons.map((tb) => html`
            <button
              key=${tb.id}
              type="button"
              onClick=${() => { setTool(tb.id); setConnectFromId(null); }}
              className=${`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                tool === tb.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ${tb.label}
            </button>
          `)}
          <button
            type="button"
            onClick=${() => {
              setGraph({ nodes: [], links: [] });
              setConnectFromId(null);
              setSelectedNodeId(null);
              setFeedback({ type: 'neutral', text: 'Kanvas dikosongkan. Silakan susun ulang perangkat.' });
            }}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            Reset Kanvas
          </button>
        </div>

        <div
          className="sim-canvas-grid h-[460px] border-x border-b border-slate-700 rounded-b-2xl overflow-hidden select-none"
          onDragOver=${(e) => e.preventDefault()}
          onDrop=${(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            if (!type || !DEVICE_META[type]) return;
            const pt = getSvgPoint(e);
            addNode(type, pt.x, pt.y);
          }}
        >
          <svg
            ref=${svgRef}
            className="w-full h-full block"
            viewBox="0 0 800 480"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove=${handleMouseMove}
            onMouseUp=${() => setDraggingId(null)}
            onMouseLeave=${() => setDraggingId(null)}
          >
            ${graph.links.map((l) => {
              const a = nodeMap[l.from];
              const b = nodeMap[l.to];
              if (!a || !b) return null;
              return html`<line key=${l.id} x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y}
                onClick=${(e) => handleLinkClick(e, l.id)}
                className=${`sim-link ${l.backbone ? 'backbone' : ''} ${l.broken ? 'broken' : ''}`} />`;
            })}
            ${graph.nodes.map((n) => {
              const meta = DEVICE_META[n.type] || DEVICE_META.pc;
              const isSelected = n.id === connectFromId || n.id === selectedNodeId;
              return html`
                <g key=${n.id} onMouseDown=${(e) => handleNodeMouseDown(e, n.id)}
                  className=${`sim-node ${isSelected ? 'selected' : ''} ${n.offline ? 'offline' : ''}`}
                  transform=${`translate(${n.x}, ${n.y})`}>
                  <rect x="-36" y="-25" width="72" height="50" className="sim-node-box" />
                  <text y="-3" className="sim-node-label">${meta.icon}</text>
                  <text y="16" className="sim-node-sub">${n.label}${n.offline ? ' (OFF)' : ''}</text>
                </g>
              `;
            })}
            ${packetPos && html`
              <circle cx=${packetPos.x} cy=${packetPos.y} r="10" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
            `}
          </svg>
        </div>

        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-xs text-slate-700">Uji Pengiriman Data:</strong>
              <select value=${pktFrom} onChange=${(e) => setPktFrom(e.target.value)} className="px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg">
                ${graph.nodes.length === 0 ? html`<option value="">--</option>` : graph.nodes.map((n) => html`<option key=${n.id} value=${n.id}>${n.label}</option>`)}
              </select>
              <span className="text-slate-400">→</span>
              <select value=${pktTo} onChange=${(e) => setPktTo(e.target.value)} className="px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg">
                ${graph.nodes.length === 0 ? html`<option value="">--</option>` : graph.nodes.map((n) => html`<option key=${n.id} value=${n.id}>${n.label}</option>`)}
              </select>
              <button type="button" onClick=${handleSendPacket} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition">
                ▶ Kirim Paket
              </button>
            </div>
            <span className="text-xs font-medium text-slate-500">${graph.nodes.length} Perangkat • ${graph.links.length} Kabel</span>
          </div>

          <div className=${`mt-3 px-4 py-3 rounded-xl border text-sm ${fbClass}`}>
            ${feedback.text}
          </div>
        </div>

        ${onSubmitProject && html`
          <div className="mt-4 bg-white border-2 border-blue-500 rounded-2xl p-4 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-1">Kumpulkan Proyek GPL</h4>
            <p className="text-xs text-slate-500 mb-3">Pastikan topologi sudah berstatus <strong>VALID</strong> sebelum mengirim ke Guru.</p>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Analisis Rancangan Siswa</label>
            <textarea
              value=${notes}
              onChange=${(e) => setNotes(e.target.value)}
              placeholder="Jelaskan alasan pemilihan perangkat dan hasil uji simulasi putus kabel/perangkat..."
              className="w-full p-3 text-sm border border-slate-300 rounded-xl min-h-[84px] mb-3"
            />
            <button type="button" onClick=${handleProjectSubmit} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
              🚀 Validasi & Kumpulkan Proyek
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}
